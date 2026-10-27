// Contact, social links and copy for sections 06 and 07. Links are exactly the owner's.

export const githubUsername = "Panjiiiiiii";

export const email = "pann@njoel.my.id";

export type Social = {
  id: "linkedin" | "instagram" | "github";
  label: string;
  url: string;
  ariaLabel: string;
};

export const socials: Social[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/panjiputraardian/",
    ariaLabel: "NJOEL on LinkedIn",
  },
  {
    id: "instagram",
    label: "Instagram",
    url: "https://www.instagram.com/panpanjoel/",
    ariaLabel: "NJOEL on Instagram",
  },
  {
    id: "github",
    label: "GitHub",
    url: `https://github.com/${githubUsername}`,
    ariaLabel: "NJOEL on GitHub",
  },
];

export const githubCopy = {
  title: "GitHub contributions",
  totalSuffix: "contributions in the last year",
  streakLabel: "Current streak",
  streakUnit: "days",
  less: "Less",
  more: "More",
  profileLink: "View GitHub profile",
  profileAria: "NJOEL on GitHub (opens in a new tab)",
  loading: "Loading contribution data...",
  unavailable: "Contribution data unavailable",
  unavailableHint: "GitHub could not be reached. The profile link below still works.",
  empty: "No public contributions in the last year.",
  scrollHint: "Contribution calendar. Scroll horizontally to see earlier weeks.",
};

export const cta = {
  headline: "Get in touch.",
};

export const footerCopy = {
  emailLabel: "Email",
  copyButton: "Copy email",
  copied: "Email copied to clipboard",
  copyFailed: "Could not copy. Select the address and copy it manually.",
  backToTop: "Back to top",
  ownerName: "NJOEL",
  fallbackYear: 2026,
};
