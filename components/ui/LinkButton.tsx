import { evidenceCopy, type Project } from "@/data/projects";

/** Live or repo URL button. Not rendered for private projects. */
export function LinkButton({ project }: { project: Project }) {
  if (project.link.type === "private") return null;
  const label = project.link.type === "live" ? evidenceCopy.liveLabel : evidenceCopy.repoLabel;
  return (
    <a
      href={project.link.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${project.title} ${label.toLowerCase()} (opens in a new tab)`}
      className="relative z-10 inline-flex min-h-11 items-center justify-center rounded-pill border border-line px-6 font-sans text-[15px] font-medium transition-colors duration-200 hover:border-accent"
    >
      {label}
    </a>
  );
}
