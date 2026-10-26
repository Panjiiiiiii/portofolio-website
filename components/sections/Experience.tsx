"use client";

import { useEffect, useMemo, useRef } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { experience, experienceCopy, type ExperienceEntry } from "@/data/experience";
import { loadGsap, prefersReducedMotion } from "@/lib/gsap";

/** Entries that share a `step` are drawn side by side as parallel items. */
function groupBySteps(entries: ExperienceEntry[]) {
  const steps: ExperienceEntry[][] = [];
  for (const entry of entries) {
    const last = steps[steps.length - 1];
    if (last && last[0].step === entry.step) last.push(entry);
    else steps.push([entry]);
  }
  return steps;
}

export function Experience() {
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const steps = useMemo(() => groupBySteps(experience), []);

  // Signature motion: the line fills with scroll and each step lights up when reached.
  // Reduced motion: no ScrollTrigger, everything shows in its final state (see globals.css).
  useEffect(() => {
    const container = root.current;
    const bar = progress.current;
    if (!container || !bar || prefersReducedMotion()) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const ctx = gsap.context(() => {
        gsap.fromTo(
          bar,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "top 60%",
              end: "bottom 60%",
              scrub: 0.4,
            },
          },
        );
        container.querySelectorAll<HTMLElement>(".tl-step").forEach((step) => {
          ScrollTrigger.create({
            trigger: step,
            start: "top 62%",
            onEnter: () => (step.dataset.active = "true"),
            onLeaveBack: () => (step.dataset.active = "false"),
          });
        });
      }, container);
      teardown = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, []);

  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className="px-6 pt-[clamp(96px,12vw,180px)] pb-[clamp(48px,6vw,96px)] md:px-12"
    >
      <div className="mx-auto max-w-[1200px]">
        <SectionHeader index="05" title={experienceCopy.title} id="experience-title" />

        <div ref={root} className="relative mt-14 md:mt-24">
          <span aria-hidden className="absolute top-0 bottom-0 left-[7px] w-px bg-line" />
          <span
            ref={progress}
            data-progress
            aria-hidden
            className="absolute top-0 bottom-0 left-[7px] w-px origin-top bg-accent"
          />

          <ol>
            {steps.map((group, si) => (
              <li
                key={si}
                className="tl-step relative pb-16 pl-10 last:pb-0 md:pb-24 md:pl-20"
              >
                <span
                  aria-hidden
                  className="tl-node absolute top-1.5 left-0 size-[15px] border"
                />
                <div
                  className={`grid gap-12 ${
                    group.length > 1 ? "md:grid-cols-2 md:gap-16" : "md:max-w-[34rem]"
                  }`}
                >
                  {group.map((e) => (
                    <article key={`${e.organization}-${e.period}`}>
                      <p className="tl-period font-mono text-[13px] tabular-nums">{e.period}</p>
                      <h3 className="mt-3 font-display text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.05] font-bold tracking-[-0.02em]">
                        {e.organization}
                      </h3>
                      <p className="mt-3 text-[17px] text-fg">{e.role}</p>
                      <p className="mt-3 max-w-[30rem] text-[16px] text-muted">{e.summary}</p>
                    </article>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
