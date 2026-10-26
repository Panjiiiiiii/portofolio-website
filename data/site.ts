// All visible copy for sections 01-03 lives here so a second language can be added later.
// Text marked as supplied is verbatim from the owner. Do not rewrite it.

export type NavItem = { id: string; label: string };

export const navItems: NavItem[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "stack", label: "Stack" },
  { id: "evidence", label: "Evidence" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

export const totalSections = "07";

export const hero = {
  name: "NJOEL",
  tagline: "Full-stack & mobile developer based in Malang, Indonesia.",
  ctaEvidence: "View evidence",
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

export const stack = {
  title: "Stack",
  additionalLabel: "Additional tools",
  // Names shown in the marquee, taken from the supplied stack list.
  marquee: ["Next.js", "Laravel", "SQL", "MySQL", "PostgreSQL", "React Native", "Expo"],
  groups: [
    {
      id: "web",
      label: "Web Full-stack",
      items: [
        {
          name: "Next.js",
          description:
            "Frontend and full-stack web apps with the App Router and TypeScript.",
        },
        {
          name: "Laravel",
          description: "Backend APIs, authentication and admin systems.",
        },
        {
          name: "SQL (MySQL, PostgreSQL)",
          description: "Database design, queries and migrations.",
        },
      ],
    },
    {
      id: "mobile",
      label: "Mobile",
      items: [
        {
          name: "React Native (Expo)",
          description: "Cross-platform mobile apps for Android and iOS.",
        },
      ],
    },
  ],
  tools: ["GitHub", "Figma"],
};
