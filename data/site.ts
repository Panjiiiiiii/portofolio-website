// All visible copy for sections 01-03 lives here so a second language can be added later.
// Text marked as supplied is verbatim from the owner. Do not rewrite it.

export type NavItem = { id: string; label: string };

export const navItems: NavItem[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "stack", label: "Stack" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

export const totalSections = "07";

export const hero = {
  name: "NJOEL",
  tagline: "Full-stack & mobile developer based in Malang, Indonesia.",
  ctaProjects: "View projects",
  ctaContact: "Contact me",
  scrollCue: "Scroll",
};

export const preloader = {
  label: "Initialising...",
  skip: "Skip",
};

export const about = {
  title: "About",
  name: "Panji Putra Ardian",
  alias: "NJOEL",
  // Supplied by the owner, verbatim.
  bio: "Panji Putra Ardian, known online as NJOEL. I'm a full-stack and mobile developer in Malang. I build web apps with Next.js and Laravel, and mobile apps with React Native (Expo). Currently Associate Developer at PT. Wahana Makmur Sejati.",
  portraitAlt:
    "Panji Putra Ardian in a maroon blazer, leaning forward with his hands on his hips",
  facts: [
    { label: "LOCATION", value: "Malang, Indonesia" },
    { label: "FOCUS", value: "Full-stack web & mobile" },
    { label: "STATUS", value: "Available for projects & part-time job" },
  ],
};

// Logo ids resolve to simple-icons in lib/brand-icons.ts.
export type StackItem = { id: string; name: string; description: string };

export const stack = {
  title: "Stack",
  additionalLabel: "Additional tools",
  // Logos only in the marquee. Each one gets an accessible name from lib/brand-icons.ts.
  marquee: ["nextjs", "laravel", "express", "postgresql", "reactnative", "expo"],
  groups: [
    {
      id: "web",
      label: "Web Full-stack",
      items: [
        {
          id: "nextjs",
          name: "Next.js",
          description:
            "Frontend and full-stack web apps with the App Router and TypeScript.",
        },
        {
          id: "laravel",
          name: "Laravel",
          description: "Backend APIs, authentication and admin systems.",
        },
        {
          id: "express",
          name: "Express.js",
          // Owner supplied this line inside square brackets as a suggested default.
          description: "Backend REST APIs and services on Node.js.",
        },
        {
          id: "postgresql",
          name: "PostgreSQL",
          description: "Database design, queries and migrations.",
        },
      ],
    },
    {
      id: "mobile",
      label: "Mobile",
      items: [
        {
          id: "reactnative",
          name: "React Native (Expo)",
          description: "Cross-platform mobile apps for Android and iOS.",
        },
      ],
    },
  ] as { id: string; label: string; items: StackItem[] }[],
  tools: [
    { id: "github", name: "GitHub" },
    { id: "figma", name: "Figma" },
  ],
};