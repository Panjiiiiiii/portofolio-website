"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Lock } from "@phosphor-icons/react/dist/ssr";
import { LinkButton } from "@/components/ui/LinkButton";
import { ProjectModal } from "@/components/ui/ProjectModal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { evidenceCopy, projects } from "@/data/projects";
import { loadGsap } from "@/lib/gsap";
import { getProjectImages } from "@/lib/images";

type PlaceAt = (clientX: number, clientY: number, immediate: boolean) => void;

export function Evidence() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const preview = useRef<HTMLDivElement>(null);
  const placeAt = useRef<PlaceAt | null>(null);

  const gallery = useMemo(() => projects.map((p) => getProjectImages(p.slug)), []);

  // Cursor-following preview: desktop with a mouse only.
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let off: (() => void) | undefined;

    loadGsap().then(({ gsap }) => {
      const el = preview.current;
      if (cancelled || !el) return;
      const qx = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      const qy = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
      placeAt.current = (clientX, clientY, immediate) => {
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const x = Math.min(clientX + 28, window.innerWidth - w - 16);
        const y = Math.min(Math.max(clientY - h / 2, 16), window.innerHeight - h - 16);
        if (immediate) gsap.set(el, { x, y });
        else {
          qx(x);
          qy(y);
        }
      };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType === "mouse") placeAt.current?.(e.clientX, e.clientY, false);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      off = () => window.removeEventListener("pointermove", onMove);
    });

    return () => {
      cancelled = true;
      off?.();
    };
  }, []);

  // Fill sweeps in from the side the pointer entered, and out toward the side it left.
  function setOrigin(e: React.PointerEvent<HTMLLIElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty(
      "--fill-origin",
      e.clientY < r.top + r.height / 2 ? "top" : "bottom",
    );
  }

  function onEnter(e: React.PointerEvent<HTMLLIElement>, i: number) {
    if (e.pointerType !== "mouse") return;
    setOrigin(e);
    // When the preview appears it snaps to the cursor instead of flying in from its last spot.
    if (hovered === null) placeAt.current?.(e.clientX, e.clientY, true);
    setPreviewIndex(i);
    setHovered(i);
  }

  function onLeave(e: React.PointerEvent<HTMLLIElement>) {
    if (e.pointerType !== "mouse") return;
    setOrigin(e);
    setHovered(null);
  }

  function openProject(i: number, el: HTMLElement) {
    trigger.current = el;
    setHovered(null);
    setOpen(i);
  }

  function closeProject() {
    setOpen(null);
    const el = trigger.current;
    requestAnimationFrame(() => el?.focus());
  }

  const previewImage = gallery[previewIndex]?.[0];

  return (
    <section
      id="evidence"
      aria-labelledby="evidence-title"
      className="px-6 py-[clamp(96px,13vw,190px)] md:px-12"
    >
      <div className="mx-auto max-w-[1200px]">
        <SectionHeader index="04" title={evidenceCopy.title} id="evidence-title" />

        <ol className="mt-14 md:mt-20">
          {projects.map((p, i) => (
            <li
              key={p.slug}
              onPointerEnter={(e) => onEnter(e, i)}
              onPointerLeave={onLeave}
              className="project-row relative border-t border-line last:border-b"
            >
              <span aria-hidden className="row-fill absolute inset-0 bg-surface" />
              <div className="relative grid gap-x-8 gap-y-5 py-8 md:grid-cols-[3rem_minmax(0,1fr)] md:px-4 md:py-10 lg:grid-cols-[3rem_minmax(0,1fr)_13rem_8.5rem]">
                <span className="row-index font-mono text-[13px] text-muted tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div>
                  <h3 className="font-display text-[clamp(1.75rem,3.6vw,3.25rem)] leading-[1] font-bold tracking-[-0.025em]">
                    <button
                      type="button"
                      aria-haspopup="dialog"
                      aria-label={`${p.title}, ${evidenceCopy.openLabel.toLowerCase()}`}
                      onClick={(e) => openProject(i, e.currentTarget)}
                      className="text-left after:absolute after:inset-0 after:content-['']"
                    >
                      {p.title}
                    </button>
                  </h3>
                  <p className="mt-4 max-w-[38rem] text-[16px] text-muted">{p.description}</p>
                  <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${p.title} stack`}>
                    {p.stack.map((s) => (
                      <li
                        key={s}
                        className="inline-flex h-7 items-center rounded-pill border border-line px-3 font-mono text-[13px] text-muted"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="font-mono text-[13px] md:col-start-2 lg:col-start-auto">
                  <p className="text-fg tabular-nums">{p.year}</p>
                  <p className="mt-1 text-muted">{p.role}</p>
                </div>

                <div className="md:col-start-2 lg:col-start-auto lg:justify-self-end">
                  {p.link.type === "private" ? (
                    <p className="inline-flex items-center gap-2 font-mono text-[13px] text-muted">
                      <Lock size={16} aria-hidden />
                      {evidenceCopy.privateLabel}
                    </p>
                  ) : (
                    <LinkButton project={p} />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Cursor preview. Decorative duplicate of the gallery, hidden from assistive tech. */}
      <div
        ref={preview}
        aria-hidden
        className={`pointer-events-none fixed top-0 left-0 z-30 hidden transition-opacity duration-200 [@media(hover:hover)_and_(pointer:fine)]:block ${
          hovered !== null ? "opacity-100" : "opacity-0"
        }`}
      >
        {previewImage && (
          <Image
            key={previewImage.src}
            src={previewImage.src}
            alt=""
            width={previewImage.width}
            height={previewImage.height}
            placeholder="blur"
            blurDataURL={previewImage.blur}
            unoptimized
            className="block h-auto max-h-[380px] w-auto max-w-[340px] rounded-card border border-line"
          />
        )}
      </div>

      {open !== null && (
        <ProjectModal project={projects[open]} images={gallery[open]} onClose={closeProject} />
      )}
    </section>
  );
}
