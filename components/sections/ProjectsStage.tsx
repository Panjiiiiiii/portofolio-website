"use client";

import { useEffect, useRef, useState } from "react";
import { ProjectMockup } from "@/components/ui/ProjectMockup";
import { ProjectText } from "@/components/ui/ProjectText";
import { projectsCopy } from "@/data/projects";
import { loadGsap } from "@/lib/gsap";
import type { ProjectItem } from "@/lib/images";
import { getLenis } from "@/lib/scroll";

const STEP_VH = 90; // scroll distance per project, in viewport heights
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Desktop stage. A sticky (not pinned) stage stays on screen while the user scrolls through
 * one step per project. Scrolling is native: nothing is hijacked, the keyboard and the back
 * button keep working, and the position is just the scroll position.
 */
export function ProjectsStage({ items }: { items: ProjectItem[] }) {
  const total = items.length;
  const container = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const panels = useRef<(HTMLElement | null)[]>([]);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = useRef(0);
  const jumpTarget = useRef<number | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = container.current;
    if (!root) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const P = () => panels.current.filter(Boolean) as HTMLElement[];
        const q = (el: HTMLElement, sel: string) => Array.from(el.querySelectorAll<HTMLElement>(sel));
        let tl: gsap.core.Timeline | null = null;
        let stepProgress = 0;
        const pointer = { x: 0, y: 0 };

        // Show one panel with no animation (first paint, jumps from far away, interruptions).
        const showInstant = (idx: number) => {
          tl?.kill();
          P().forEach((p, i) => {
            gsap.set(p, { visibility: i === idx ? "visible" : "hidden", zIndex: i === idx ? 2 : 1 });
            gsap.set(q(p, "[data-pj-media]"), { clipPath: "inset(0% 0% 0% 0%)" });
            gsap.set(q(p, "[data-pj-device]"), { scale: 1, yPercent: 0 });
            gsap.set(q(p, "[data-pj-text]"), { opacity: 1, y: 0 });
            gsap.set(q(p, "[data-pj-title-line]"), { yPercent: 0 });
          });
        };

        // Image and text change: clip wipe on the mockup with a depth shift, staggered text.
        // Durations 250-700ms. Ease set: power3.out in, power2.inOut / power2.in out.
        const transition = (from: number, to: number) => {
          const ps = P();
          const dir = to > from ? 1 : -1;
          const a = ps[from];
          const b = ps[to];
          if (!a || !b) return showInstant(to);
          tl?.progress(1).kill();
          gsap.set(b, { visibility: "visible", zIndex: 2 });
          gsap.set(a, { zIndex: 1 });
          tl = gsap.timeline({ onComplete: () => void gsap.set(a, { visibility: "hidden" }) });
          tl.to(q(a, "[data-pj-text]"), { opacity: 0, y: -14 * dir, duration: 0.25, ease: "power2.in", stagger: 0.025 }, 0)
            .to(
              q(a, "[data-pj-media]"),
              { clipPath: dir > 0 ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)", duration: 0.45, ease: "power2.inOut" },
              0,
            )
            .fromTo(
              q(b, "[data-pj-media]"),
              { clipPath: dir > 0 ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)" },
              { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power3.out" },
              0.2,
            )
            .fromTo(
              q(b, "[data-pj-device]"),
              { scale: 1.14, yPercent: 6 * dir },
              { scale: 1, yPercent: 0, duration: 0.7, ease: "power3.out" },
              0.2,
            )
            .fromTo(q(b, "[data-pj-title-line]"), { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: "power3.out" }, 0.3)
            .fromTo(
              q(b, "[data-pj-text]:not([data-pj-title])"),
              { opacity: 0, y: 18 * dir },
              { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.06 },
              0.38,
            )
            .set(q(b, "[data-pj-title]"), { opacity: 1, y: 0 }, 0.3);
        };

        // Gentle tilt from scroll position inside the step plus the pointer.
        const applyTilt = () => {
          const el = panels.current[current.current]?.querySelector<HTMLElement>("[data-pj-tilt]");
          if (!el) return;
          gsap.to(el, {
            rotationY: -10 + stepProgress * 6 + pointer.x * 6,
            rotationX: 4 - stepProgress * 2 - pointer.y * 4,
            duration: 0.6,
            ease: "power3.out",
            overwrite: "auto",
          });
        };

        const setIndex = (idx: number, instant: boolean) => {
          if (idx === current.current && !instant) return;
          const from = current.current;
          current.current = idx;
          setActive(idx);
          if (instant) showInstant(idx);
          else transition(from, idx);
        };

        const st = ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            const scaled = self.progress * total;
            const idx = Math.min(total - 1, Math.floor(scaled));
            stepProgress = Math.min(1, Math.max(0, scaled - idx));
            fills.current.forEach((f, i) => {
              if (f) f.style.transform = `scaleX(${Math.min(1, Math.max(0, scaled - i))})`;
            });
            if (jumpTarget.current !== null) {
              if (idx === jumpTarget.current) jumpTarget.current = null;
              else return; // skip the in-between steps while jumping from the index
            }
            setIndex(idx, false);
            applyTilt();
          },
        });

        // Start at the right panel if the page loads partway down.
        const startIdx = Math.min(total - 1, Math.floor(st.progress * total));
        current.current = startIdx;
        setActive(startIdx);
        showInstant(startIdx);
        fills.current.forEach((f, i) => {
          if (f) f.style.transform = `scaleX(${Math.min(1, Math.max(0, st.progress * total - i))})`;
        });
        applyTilt();

        const onMove = (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          const r = stage.current?.getBoundingClientRect();
          if (!r) return;
          pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
          pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1;
          applyTilt();
        };
        stage.current?.addEventListener("pointermove", onMove);

        return () => {
          stage.current?.removeEventListener("pointermove", onMove);
          tl?.kill();
          st.kill();
        };
      });
      cleanup = () => mm.revert();
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [total]);

  // Jump to a step by scrolling to it. Native scroll, or Lenis when it is running.
  function goTo(i: number, focus = false) {
    const root = container.current;
    const stg = stage.current;
    if (!root || !stg) return;
    const travel = root.offsetHeight - stg.offsetHeight;
    const top = root.getBoundingClientRect().top + window.scrollY;
    const y = top + ((i + 0.5) / total) * travel;
    jumpTarget.current = i;
    window.setTimeout(() => (jumpTarget.current = null), 1800);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 1 });
    else window.scrollTo({ top: y, behavior: "smooth" });
    if (focus) tabs.current[i]?.focus();
  }

  function onTabKey(e: React.KeyboardEvent, i: number) {
    let next = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % total;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + total) % total;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = total - 1;
    else return;
    e.preventDefault();
    goTo(next, true);
  }

  return (
    <div
      ref={container}
      className="relative"
      style={{ height: `calc(100dvh + ${total * STEP_VH}dvh)` }}
    >
      <div ref={stage} className="sticky top-0 h-dvh overflow-hidden bg-surface">
        {/* Screen readers hear the current project when it changes */}
        <p className="sr-only" role="status" aria-live="polite">
          {`Project ${active + 1} of ${total}: ${items[active]?.project.title ?? ""}`}
        </p>

        {items.map(({ project, image }, i) => (
          <article
            key={project.slug}
            ref={(el) => {
              panels.current[i] = el;
            }}
            id={`pj-panel-${i}`}
            role="tabpanel"
            aria-labelledby={`pj-tab-${i}`}
            data-active={i === active}
            inert={i !== active}
            className="pj-panel absolute inset-0 flex items-center px-12 pt-24 pb-28"
          >
            <div className="mx-auto grid w-full max-w-[1200px] grid-cols-12 items-center gap-8">
              <div data-pj-media className="pj-media col-span-7 -m-10 p-10">
                <div data-pj-device>
                  <ProjectMockup project={project} image={image} eager={i === 0} />
                </div>
              </div>
              <div className="col-span-5">
                <ProjectText project={project} index={i} total={total} />
              </div>
            </div>
          </article>
        ))}

        {/* Index and progress, along the bottom like a film strip */}
        <div className="absolute inset-x-0 bottom-0 px-12 pb-8">
          <div className="mx-auto max-w-[1200px]">
            <div role="tablist" aria-label={projectsCopy.indexLabel} className="mb-5 flex gap-1">
              {items.map(({ project }, i) => (
                <button
                  key={project.slug}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  id={`pj-tab-${i}`}
                  role="tab"
                  type="button"
                  aria-selected={i === active}
                  aria-controls={`pj-panel-${i}`}
                  aria-label={`${pad(i + 1)}, ${project.title}`}
                  tabIndex={i === active ? 0 : -1}
                  onClick={() => goTo(i)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  className={`relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill px-3 font-mono text-[13px] tabular-nums transition-colors duration-200 hover:text-fg ${
                    i === active ? "text-fg" : "text-muted"
                  }`}
                >
                  {pad(i + 1)}
                  <span
                    aria-hidden
                    className={`absolute inset-x-3 bottom-1.5 h-0.5 bg-accent transition-opacity duration-200 ${
                      i === active ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </button>
              ))}
            </div>
            <div aria-hidden className="flex gap-1" title={projectsCopy.progressLabel}>
              {items.map(({ project }, i) => (
                <div key={project.slug} className="h-px flex-1 bg-line">
                  <span
                    ref={(el) => {
                      fills.current[i] = el;
                    }}
                    className="block h-full origin-left bg-accent"
                    style={{ transform: "scaleX(0)" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
