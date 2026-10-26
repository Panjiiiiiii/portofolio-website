// Experience data for section 05. Newest first. Text is supplied by the owner, verbatim.
//
// To add an entry: add an object below in the right position.
// `step` groups entries on the timeline. Entries that share a step number are drawn
// side by side as parallel items (for example a job and university in the same period).
// Use a new, higher step number for an entry that stands alone.

export type ExperienceEntry = {
  step: number;
  period: string;
  organization: string;
  role: string;
  summary: string;
};

export const experience: ExperienceEntry[] = [
  {
    step: 1,
    period: "2026 - Present",
    organization: "PT. Wahana Makmur Sejati",
    role: "Associate Developer",
    summary:
      "Migrating internal company systems and developing new systems to improve company performance.",
  },
  {
    step: 1,
    period: "2026 - Present",
    organization: "Binus University",
    role: "Information Systems, Business Analytics",
    summary: "Current GPA 3.88.",
  },
  {
    step: 2,
    period: "2025 - 2026",
    organization: "Sidigs",
    role: "Part-time Full-stack Developer",
    summary:
      "Developed and maintained a digital learning system for internal and client use.",
  },
  {
    step: 3,
    period: "2024 - 2025",
    organization: "VEDC Malang",
    role: "Software & IoT Engineer (Intern)",
    summary: "Planned and executed IoT-based projects and solved problems from industry.",
  },
  {
    step: 3,
    period: "2022 - 2025",
    organization: "Telkom Malang Vocational High School",
    role: "Software Engineering",
    summary: "Graduated with an overall score of 92.0.",
  },
];

export const experienceCopy = {
  title: "Experience",
};
