"use client";

import { useEffect, useRef } from "react";
import { usePageReady } from "@/components/providers/PageReady";
import { ButtonLink } from "@/components/ui/Button";
import { ScrollLink } from "@/components/ui/ScrollLink";
import { hero, totalSections } from "@/data/site";
import { loadGsap, prefersReducedMotion } from "@/lib/gsap";
import { HeroObjects } from "./HeroObjects";

export function Hero() {
  const { ready } = usePageReady();
  const letters = useRef<HTMLSpanElement[]>([]);
  const reactive = useRef<HTMLSpanElement[]>([]);
  const section = useRef<HTMLElement>(null);

  // Signature motion: kinetic letter reveal once the preloader leaves.
  useEffect(() => {
    if (!ready) return;
    const els = letters.current;
    if (prefersReducedMotion()) return; // CSS only hides letters when motion is allowed
    let cancelled = false;
    loadGsap()
      .then(({ gsap }) => {
        if (cancelled) return;
        // opacity is the pre-JS hidden state (see globals.css); the mask hides the rest.
        gsap.fromTo(
          els,
          { yPercent: 110, opacity: 1 },
          { yPercent: 0, duration: 0.7, ease: "expo.out", stagger: 0.06 },
        );
      })
      .catch(() => els.forEach((el) => (el.style.opacity = "1")));
    return () => {
      cancelled = true;
    };
  }, [ready]);

  // Subtle cursor-reactive lift: letters near the pointer rise a few pixels.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let off: (() => void) | undefined;
    let cancelled = false;
    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      const setters = reactive.current.map((el) =>
        gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" }),
      );
      const onMove = (e: PointerEvent) => {
        const sec = section.current;
        if (!sec) return;
        const rect = sec.getBoundingClientRect();
        const inside = e.clientY >= rect.top && e.clientY <= rect.bottom;
        reactive.current.forEach((el, i) => {
          if (!inside) return setters[i](0);
          const r = el.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
          const dy = Math.min(Math.max((e.clientY - (r.top + r.height / 2)) / r.height, -1.5), 1.5);
          const falloff = Math.exp(-(dx * dx) * 1.4) * Math.exp(-(dy * dy) * 0.6);
          setters[i](-18 * falloff);
        });
      };
      const onLeave = () => setters.forEach((s) => s(0));
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);
      off = () => {
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerleave", onLeave);
      };
    });
    return () => {
      cancelled = true;
      off?.();
    };
  }, []);

  return (
    <section
      id="home"
      ref={section}
      aria-label="Home"
      className="relative flex min-h-[calc(100dvh-3.5rem-env(safe-area-inset-bottom))] flex-col overflow-hidden px-6 pt-24 pb-4 md:min-h-dvh md:px-12 md:pb-8"
    >
      {/* Three floating objects (glyph, gamepad, helmet) over the top band of the hero */}
      <HeroObjects />
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-end">
        <div data-hero-copy className="relative z-10 max-w-md">
          <p className="font-mono text-[13px] text-accent tabular-nums">
            01 / {totalSections}
          </p>
          <p className="mt-4 text-lg text-fg md:text-xl">{hero.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="#projects">{hero.ctaProjects}</ButtonLink>
            <ButtonLink href="#contact" variant="secondary">
              {hero.ctaContact}
            </ButtonLink>
          </div>
        </div>

        <h1
          aria-label={hero.name}
          data-focus-target
          data-hero-title
          tabIndex={-1}
          className="hero-title relative z-0 mt-6 flex justify-between pr-[0.028em] font-display leading-[0.82] font-extrabold tracking-[-0.045em] select-none md:mt-4"
        >
          {hero.name.split("").map((ch, i) => (
            <span
              key={i}
              aria-hidden
              ref={(el) => {
                if (el) reactive.current[i] = el;
              }}
              className="inline-block"
            >
              {/* Side padding keeps glyph overhang (negative tracking) from being clipped by the mask */}
              <span className="-mx-[0.05em] block overflow-hidden px-[0.05em] pt-[0.06em] pb-[0.04em]">
                <span
                  ref={(el) => {
                    if (el) letters.current[i] = el;
                  }}
                  className="hero-letter block"
                >
                  {ch}
                </span>
              </span>
            </span>
          ))}
        </h1>

        <ScrollLink
          href="#about"
          aria-label="Scroll to About"
          className="relative z-10 mt-6 inline-flex min-h-11 items-center gap-3 self-start font-mono text-[13px] text-muted transition-colors duration-200 hover:text-fg"
        >
          <span>{hero.scrollCue}</span>
          <span aria-hidden className="relative h-px w-16 overflow-hidden bg-line">
            <span className="absolute inset-y-0 left-0 w-1/2 animate-[cue_1.8s_ease-in-out_infinite] bg-accent motion-reduce:animate-none" />
          </span>
        </ScrollLink>
      </div>
    </section>
  );
}
