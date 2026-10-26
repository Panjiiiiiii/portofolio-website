"use client";

import { useEffect, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "@/lib/gsap";

/** Parallax reveal: the footer content slides down into place as the footer scrolls into view. */
export function FooterReveal({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const footer = wrap.current;
    const content = inner.current;
    if (!footer || !content || prefersReducedMotion()) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;

    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      const ctx = gsap.context(() => {
        gsap.fromTo(
          content,
          { yPercent: -30 },
          {
            yPercent: 0,
            ease: "none",
            scrollTrigger: {
              trigger: footer,
              start: "top bottom",
              end: "bottom bottom",
              scrub: true,
            },
          },
        );
      }, footer);
      teardown = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, []);

  return (
    <footer
      ref={wrap}
      id="site-footer"
      className="relative overflow-hidden border-t border-line pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-0"
    >
      <div ref={inner}>{children}</div>
    </footer>
  );
}
