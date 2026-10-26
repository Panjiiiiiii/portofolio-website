"use client";

import { useEffect, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "@/lib/gsap";
import { totalSections } from "@/data/site";

type Props = {
  index: string;
  title: string;
  id?: string;
};

/** Accent mono index on a 0px hairline that draws in once, then the display heading. */
export function SectionHeader({ index, title, id }: Props) {
  const rule = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = rule.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.transform = "none";
      return;
    }
    let st: { kill: () => void } | undefined;
    let cancelled = false;
    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const tween = gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.7,
          ease: "power3.out",
          paused: true,
        },
      );
      st = ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => tween.play(),
      });
    });
    return () => {
      cancelled = true;
      st?.kill();
    };
  }, []);

  return (
    <header>
      <div className="flex items-center gap-4">
        <span className="font-mono text-[13px] text-accent tabular-nums">
          {index} / {totalSections}
        </span>
        <span
          ref={rule}
          data-rule
          aria-hidden
          className="h-px flex-1 origin-left bg-line"
        />
      </div>
      <h2
        id={id}
        data-focus-target
        tabIndex={-1}
        className="mt-8 w-fit max-w-full font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] font-bold tracking-[-0.03em]"
      >
        {title}
      </h2>
    </header>
  );
}
