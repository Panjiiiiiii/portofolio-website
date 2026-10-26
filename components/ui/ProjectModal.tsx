"use client";

import { useEffect, useRef } from "react";
import { Lock, X } from "@phosphor-icons/react/dist/ssr";
import { evidenceCopy, type Project } from "@/data/projects";
import { getLenis } from "@/lib/scroll";
import type { ImageMeta } from "@/lib/images";
import { Gallery } from "./Gallery";
import { LinkButton } from "./LinkButton";

type Props = {
  project: Project;
  images: ImageMeta[];
  onClose: () => void;
};

/** Native <dialog>: focus trap, inert background and Escape come from the platform. */
export function ProjectModal({ project, images, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    // The scrollable panel can take initial focus otherwise. Start on the close button.
    closeButton.current?.focus();
    document.documentElement.classList.add("modal-open");
    getLenis()?.stop();
    return () => {
      document.documentElement.classList.remove("modal-open");
      getLenis()?.start();
    };
  }, []);

  const titleId = `project-${project.slug}-title`;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // A click on the dialog element itself is a click on the backdrop area.
        if (e.target === ref.current) ref.current?.close();
      }}
      className="project-dialog fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-fg"
    >
      <div
        data-lenis-prevent
        className="modal-panel mx-auto flex h-full w-full max-w-[1200px] flex-col overflow-y-auto px-6 py-6 md:px-0 md:py-10"
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2
              id={titleId}
              className="font-display text-[clamp(1.75rem,4vw,3.25rem)] leading-[1] font-bold tracking-[-0.025em]"
            >
              {project.title}
            </h2>
            <p className="mt-3 font-mono text-[13px] text-muted">
              {project.role} / {project.year}
            </p>
          </div>
          <button
            ref={closeButton}
            type="button"
            onClick={() => ref.current?.close()}
            aria-label={evidenceCopy.closeLabel}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-pill border border-line transition-colors duration-200 hover:border-accent"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <div className="mt-8">
          {images.length > 0 ? (
            <Gallery images={images} label={`${project.title} screenshots`} />
          ) : (
            <p className="rounded-card border border-line bg-surface p-6 text-muted">
              {evidenceCopy.emptyGallery}
            </p>
          )}
        </div>

        <div className="mt-10 grid gap-8 border-t border-line pt-8 md:grid-cols-[1fr_auto] md:gap-16">
          <div>
            <p className="max-w-[40rem] text-[17px] leading-relaxed">{project.description}</p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Stack">
              {project.stack.map((s) => (
                <li
                  key={s}
                  className="inline-flex h-7 items-center rounded-pill border border-line px-3 font-mono text-[13px] text-muted"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="md:pt-1">
            {project.link.type === "private" ? (
              <p className="inline-flex items-center gap-2 font-mono text-[13px] text-muted">
                <Lock size={16} aria-hidden />
                {evidenceCopy.privateLabel}
              </p>
            ) : (
              <LinkButton project={project} />
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
