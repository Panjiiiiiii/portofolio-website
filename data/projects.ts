// Project data for section 04 (Projects). Edit here to add or change a project. No UI code needs to change.
// Text is supplied by the owner. Do not invent features, metrics or client names.
//
// To add a project:
//  1. Put the screenshot in assets/project-galery/<folder>/ and add one line for it to
//     `projectImages` in scripts/optimize-assets.mjs (slug -> folder + file), then run `npm run assets`.
//  2. Add an entry below, newest first.
//  frame: "laptop" (websites) or "phone" (mobile apps). Every frame of a kind is identical.
//         The pipeline crops the screenshot to the frame: laptop 1440x1024, phone 824x1830.
//  focusY: where the crop window sits in the screenshot, 0 = top, 100 = bottom.
//          Change it and run `npm run assets` to show a different part of a tall screenshot.
//  link: { type: "live", url } shows a button, { type: "repo", url } shows a button,
//        { type: "private" } shows a "Private project" label with no button.

export type ProjectLink =
  | { type: "live"; url: string }
  | { type: "repo"; url: string }
  | { type: "private" };

export type Project = {
  slug: string;
  frame: "laptop" | "phone";
  focusY: number;
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
    frame: "phone",
    focusY: 0,
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
    frame: "laptop",
    focusY: 0,
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
    frame: "laptop",
    focusY: 0,
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
    frame: "laptop",
    focusY: 0,
    title: "Bakery Business System",
    role: "Full-stack Developer",
    year: "2024",
    stack: ["Next.js", "Express.js", "Node.js", "PostgreSQL"],
    description:
      "Full-stack bakery ordering system. Features include a cart, receipt printing, payment gateway and filterable financial analytics.",
    link: { type: "private" },
  },
  {
    slug: "ukk-exam-website",
    frame: "laptop",
    focusY: 0,
    title: "UKK Exam Website",
    role: "Full-stack Developer",
    year: "2024",
    stack: ["Next.js", "Express.js", "Node.js", "PostgreSQL"],
    description:
      "Exam website for Universitas Tribhuwana Tunggadewi's UKK. Features include exam point settings, answer keys, and token-based exam access.",
    link: { type: "private" },
  },
];

export const projectsCopy = {
  title: "Projects",
  privateLabel: "Private project",
  liveLabel: "Live site",
  repoLabel: "Repository",
  indexLabel: "Project index",
  progressLabel: "Project progress",
};