// Server only. GITHUB_TOKEN is read here and never sent to the client.
import { githubUsername } from "@/data/contact";

export type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
export type Contributions = {
  total: number;
  /** Chronological, oldest first. */
  days: Day[];
  streak: number;
};

const LEVELS: Record<string, Day["level"]> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const QUERY = `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays { date contributionCount contributionLevel }
          }
        }
      }
    }
  }
`;

type CalendarResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number;
          weeks: {
            contributionDays: { date: string; contributionCount: number; contributionLevel: string }[];
          }[];
        };
      };
    } | null;
  };
};

export function parseCalendar(json: CalendarResponse): Contributions | null {
  const cal = json.data?.user?.contributionsCollection?.contributionCalendar;
  if (!cal || !Array.isArray(cal.weeks)) return null;

  const days: Day[] = cal.weeks.flatMap((w) =>
    w.contributionDays.map((d) => ({
      date: d.date,
      count: d.contributionCount,
      level: LEVELS[d.contributionLevel] ?? 0,
    })),
  );
  if (days.length === 0) return null;

  // Current streak: consecutive days with contributions, ending today.
  // Today may still be empty, so an empty last day does not break the streak.
  let i = days.length - 1;
  if (days[i].count === 0) i -= 1;
  let streak = 0;
  while (i >= 0 && days[i].count > 0) {
    streak += 1;
    i -= 1;
  }

  return { total: cal.totalContributions, days, streak };
}

// Last successful result, kept in memory as a fallback when a refresh fails.
let lastGood: Contributions | null = null;

/** Returns real data, the last good data, or null (render the "unavailable" state). */
export async function getContributions(): Promise<Contributions | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return lastGood;

  try {
    const res = await fetch(process.env.GITHUB_GRAPHQL_URL || "https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "njoel-portfolio",
      },
      body: JSON.stringify({ query: QUERY, variables: { login: githubUsername } }),
      next: { revalidate: 21600 }, // 6 hours
    });
    if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
    const parsed = parseCalendar((await res.json()) as CalendarResponse);
    if (!parsed) throw new Error("Unexpected GitHub response");
    lastGood = parsed;
    return parsed;
  } catch (error) {
    console.error("GitHub contributions unavailable:", error instanceof Error ? error.message : error);
    return lastGood;
  }
}
