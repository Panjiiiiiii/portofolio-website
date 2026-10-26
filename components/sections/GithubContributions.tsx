import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { HeatmapScroller } from "@/components/ui/HeatmapScroller";
import { githubCopy, socials } from "@/data/contact";
import { getContributions, type Contributions } from "@/lib/github";

// Solid steps of the accent mixed into the surface. Level 0 is the surface color, 4 is the accent.
const LEVEL_COLORS = ["#131316", "#0e3637", "#0a5a58", "#057e7a", "#00a19b"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const profileUrl = socials.find((s) => s.id === "github")!.url;

function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function Cell({ level, title }: { level: number; title?: string }) {
  return (
    <div
      title={title}
      style={{ backgroundColor: LEVEL_COLORS[level] }}
      className="size-[var(--cell)]"
    />
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-2 font-mono text-[13px] text-muted" aria-hidden>
      <span>{githubCopy.less}</span>
      <div className="flex gap-[3px]">
        {LEVEL_COLORS.map((color, l) => (
          <div key={l} style={{ backgroundColor: color }} className="size-3" />
        ))}
      </div>
      <span>{githubCopy.more}</span>
    </div>
  );
}

function Calendar({ data }: { data: Contributions }) {
  // GitHub's first week can be partial: pad so rows line up with weekdays (Sunday first).
  const lead = new Date(`${data.days[0].date}T00:00:00Z`).getUTCDay();
  const cells: (Contributions["days"][number] | null)[] = [...Array(lead).fill(null), ...data.days];
  const weekCount = Math.ceil(cells.length / 7);

  const labels: { week: number; text: string }[] = [];
  let prevMonth = -1;
  for (let w = 0; w < weekCount; w++) {
    const first = cells.slice(w * 7, w * 7 + 7).find(Boolean);
    if (!first) continue;
    const month = new Date(`${first.date}T00:00:00Z`).getUTCMonth();
    if (month !== prevMonth) {
      // Skip a label that would crowd the previous one at the start.
      if (!(w === 0 && new Date(`${first.date}T00:00:00Z`).getUTCDate() > 20)) {
        labels.push({ week: w, text: MONTHS[month] });
      }
      prevMonth = month;
    }
  }

  return (
    <HeatmapScroller label={githubCopy.scrollHint}>
      <div
        className="w-max [--cell:12px] [--gap:3px] md:[--cell:16px] md:[--gap:4px]"
        style={{ ["--step" as string]: "calc(var(--cell) + var(--gap))" }}
      >
        <div className="relative h-6 font-mono text-[13px] text-muted" aria-hidden>
          {labels.map((l) => (
            <span
              key={l.week}
              className="absolute top-0"
              style={{ left: `calc(var(--step) * ${l.week})` }}
            >
              {l.text}
            </span>
          ))}
        </div>
        {/* The grid is decorative. The totals above are the accessible summary. */}
        <div aria-hidden className="grid grid-flow-col grid-rows-7 gap-[var(--gap)]">
          {cells.map((d, i) =>
            d ? (
              <Cell
                key={d.date}
                level={d.level}
                title={`${d.count} ${d.count === 1 ? "contribution" : "contributions"} on ${formatDate(d.date)}`}
              />
            ) : (
              <div key={`pad-${i}`} className="size-[var(--cell)]" />
            ),
          )}
        </div>
      </div>
    </HeatmapScroller>
  );
}

function ProfileLink() {
  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={githubCopy.profileAria}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-line px-6 text-[15px] font-medium transition-colors duration-200 hover:border-accent"
    >
      {githubCopy.profileLink}
      <ArrowSquareOut size={18} aria-hidden />
    </a>
  );
}

/** Async server component. Real numbers only, with empty and unavailable states. */
export async function GithubContributions() {
  const data = await getContributions();

  if (!data) {
    return (
      <div className="mt-10 rounded-card border border-line bg-surface p-6 md:p-8" role="status">
        <p className="font-display text-2xl font-bold">{githubCopy.unavailable}</p>
        <p className="mt-2 text-muted">{githubCopy.unavailableHint}</p>
        <div className="mt-6">
          <ProfileLink />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
        <p>
          <span className="block font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-none font-bold tracking-[-0.03em] tabular-nums">
            {data.total.toLocaleString("en-US")}
          </span>
          <span className="mt-2 block text-muted">{githubCopy.totalSuffix}</span>
        </p>
        <p className="md:text-right">
          <span className="block font-display text-[clamp(1.5rem,3vw,2.25rem)] leading-none font-bold tabular-nums">
            {data.streak} {githubCopy.streakUnit}
          </span>
          <span className="mt-2 block text-muted">{githubCopy.streakLabel}</span>
        </p>
      </div>

      {data.total === 0 ? (
        <p className="mt-8 text-muted">{githubCopy.empty}</p>
      ) : (
        <div className="mt-8">
          <Calendar data={data} />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <Legend />
        <ProfileLink />
      </div>
    </div>
  );
}

/** Loading state shown while the data is fetched. No numbers. */
export function GithubSkeleton() {
  return (
    <div className="mt-10" role="status" aria-live="polite">
      <p className="font-mono text-[13px] text-muted">{githubCopy.loading}</p>
      <div className="mt-6 overflow-hidden [--cell:12px] [--gap:3px] md:[--cell:16px] md:[--gap:4px]">
        <div aria-hidden className="grid w-max grid-flow-col grid-rows-7 gap-[var(--gap)]">
          {Array.from({ length: 53 * 7 }, (_, i) => (
            <Cell key={i} level={0} />
          ))}
        </div>
      </div>
    </div>
  );
}
