// Project data for section 04. Edit here to add or change a project. No UI code needs to change.
// Text is supplied by the owner. Do not invent features, metrics or client names.
//
// To add a project:
//  1. Put screenshots in assets/project-galery/<folder>/1.png, 2.png ... and add the folder
//     to `projectFolders` in scripts/optimize-assets.mjs (folder -> slug), then run `npm run assets`.
//  2. Add an entry below, newest first.
//  link: { type: "live", url } shows a button, { type: "repo", url } shows a button,
//        { type: "private" } shows a "Private project" label with no button.

export type ProjectLink =
  | { type: "live"; url: string }
  | { type: "repo"; url: string }
  | { type: "private" };

export type Project = {
  slug: string;
  title: string;
  role: string;
  year: string;
  stack: string[];
  description: string;
  link: ProjectLink;
};

export const projects: Project[] = [
  {
    slug: "w-spread",
    title: "W-Spread App",
    role: "Full-stack Developer",
    year: "2026",
    stack: ["React Native", "Supabase"],
    description:
      "Decision support system (DSS) app for forecasting financial health. I contributed from planning through development.",
    link: { type: "private" },
  },
  {
    slug: "sugar-measurer",
    title: "Sugar Measurer Website",
    role: "Tech Lead & Backend Engineer",
    year: "2026",
    stack: ["Next.js", "TypeScript", "PostgreSQL"],
    description:
      "Integrated system for a sugar business, covering measurer, finance and admin modules. I built the entire backend architecture.",
    link: { type: "private" },
  },
  {
    slug: "sidigs-app",
    title: "Sidigs App",
    role: "Part-time Full-stack Developer",
    year: "2025 - 2026",
    stack: ["Laravel", "Vue", "MySQL"],
    description:
      "Digital learning system for internal and client use. I developed and maintained user management, learning materials, evaluations, and learning progress reports.",
    link: { type: "live", url: "https://sidigs.com" },
  },
  {
    slug: "sme-website",
    title: "SME's Website",
    role: "Full-stack Developer",
    year: "2024",
    stack: ["Next.js", "Express.js", "Node.js", "PostgreSQL"],
    description:
      "Full-stack cafe menu ordering system. Features include a cart, receipt printing, and filterable financial analytics.",
    link: { type: "private" },
  },
  {
    slug: "ukk-exam-website",
    title: "UKK Exam Website",
    role: "Full-stack Developer",
    year: "2024",
    stack: ["Next.js", "Express.js", "Node.js", "PostgreSQL"],
    description:
      "Exam website for Universitas Tribhuwana Tunggadewi's UKK. Features include exam point settings, answer keys, and token-based exam access.",
    link: { type: "private" },
  },
];

export const evidenceCopy = {
  title: "Evidence",
  privateLabel: "Private project",
  liveLabel: "Live site",
  repoLabel: "Repository",
  openLabel: "View screenshots",
  closeLabel: "Close",
  prevLabel: "Previous screenshot",
  nextLabel: "Next screenshot",
  emptyGallery: "No screenshots available for this project.",
};
