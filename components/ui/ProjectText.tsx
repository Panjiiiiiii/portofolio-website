import { Lock } from "@phosphor-icons/react/dist/ssr";
import { projectsCopy, type Project } from "@/data/projects";
import { LinkButton } from "./LinkButton";

type Props = {
  project: Project;
  index: number;
  total: number;
  /** The accordion row already shows the title in its button. */
  showTitle?: boolean;
  showCounter?: boolean;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Text block for one project. `data-pj-*` attributes are hooks for the stage transition.
 * Content is the owner's data, verbatim.
 */
export function ProjectText({ project, index, total, showTitle = true, showCounter = true }: Props) {
  return (
    <div>
      {showCounter && (
        <p data-pj-text className="font-display text-2xl font-semibold tabular-nums">
          {pad(index + 1)}
          <span className="text-muted"> / {pad(total)}</span>
        </p>
      )}

      {showTitle && (
        <h3
          data-pj-text
          data-pj-title
          className="mt-5 overflow-hidden pb-[0.12em] font-display text-[clamp(2.25rem,4.4vw,4.25rem)] leading-[1] font-bold tracking-[-0.03em]"
        >
          <span data-pj-title-line className="block">
            {project.title}
          </span>
        </h3>
      )}

      <p data-pj-text className="mt-4 font-mono text-[13px] text-muted">
        {project.role} · {project.year}
      </p>

      <p data-pj-text className="mt-6 max-w-[34rem] text-[17px] leading-relaxed">
        {project.description}
      </p>

      <ul data-pj-text className="mt-6 flex flex-wrap gap-2" aria-label={`${project.title} stack`}>
        {project.stack.map((s) => (
          <li
            key={s}
            className="inline-flex h-7 items-center rounded-pill border border-line px-3 font-mono text-[13px] text-muted"
          >
            {s}
          </li>
        ))}
      </ul>

      <div data-pj-text className="mt-8">
        {project.link.type === "private" ? (
          <p className="inline-flex min-h-11 items-center gap-2 font-mono text-[13px] text-muted">
            <Lock size={16} aria-hidden />
            {projectsCopy.privateLabel}
          </p>
        ) : (
          <LinkButton project={project} />
        )}
      </div>
    </div>
  );
}
