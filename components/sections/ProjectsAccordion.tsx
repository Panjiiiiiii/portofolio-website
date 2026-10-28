"use client";

import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { ProjectMockup } from "@/components/ui/ProjectMockup";
import { ProjectText } from "@/components/ui/ProjectText";
import type { ProjectItem } from "@/lib/images";

const pad = (n: number) => String(n).padStart(2, "0");

/** Below 768px: a vertical accordion. One row open at a time, animated height. */
export function ProjectsAccordion({ items }: { items: ProjectItem[] }) {
  const [open, setOpen] = useState(0);

  return (
    <ol className="border-b border-line">
      {items.map(({ project, image }, i) => {
        const isOpen = open === i;
        return (
          <li key={project.slug} className="border-t border-line">
            <h3>
              <button
                type="button"
                id={`pj-acc-btn-${i}`}
                aria-expanded={isOpen}
                aria-controls={`pj-acc-panel-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex min-h-14 w-full items-center gap-4 py-4 text-left"
              >
                <span className="font-mono text-[13px] text-muted tabular-nums">{pad(i + 1)}</span>
                <span className="flex-1 font-display text-[1.6rem] leading-[1.05] font-bold tracking-[-0.02em]">
                  {project.title}
                </span>
                <CaretDown
                  size={22}
                  aria-hidden
                  className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
            </h3>
            <div
              id={`pj-acc-panel-${i}`}
              role="region"
              aria-labelledby={`pj-acc-btn-${i}`}
              inert={!isOpen}
              className="pj-acc-panel"
              data-open={isOpen}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="pb-10">
                  <div className="pj-compact pt-2 pb-6">
                    <ProjectMockup project={project} image={image} />
                  </div>
                  <div className="mt-8">
                    <ProjectText project={project} index={i} total={items.length} showTitle={false} showCounter={false} />
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
