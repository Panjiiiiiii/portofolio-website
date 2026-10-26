"use client";

import { useEffect } from "react";
import { loadGsap } from "@/lib/gsap";
import { scrollToHash, setLenis } from "@/lib/scroll";

/**
 * Lenis smooth scroll driven by the GSAP ticker so ScrollTrigger stays in sync.
 * Not started at all when the user prefers reduced motion.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let destroy: (() => void) | null = null;
    let cancelled = false;

    async function start() {
      if (mq.matches || destroy) return;
      const [{ default: Lenis }, { gsap, ScrollTrigger }] = await Promise.all([
        import("lenis"),
        loadGsap(),
      ]);
      if (cancelled || mq.matches) return;

      const lenis = new Lenis({
        duration: 1.1,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        autoRaf: false,
      });
      setLenis(lenis);
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      destroy = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        setLenis(null);
        destroy = null;
      };
    }

    function onMotionChange() {
      if (mq.matches) destroy?.();
      else void start();
    }

    // Back/forward: restore the section from the hash.
    function onPopState() {
      scrollToHash(window.location.hash || "#home", { push: false });
    }

    // The Projects section used to be called Evidence. Keep old links working.
    if (window.location.hash === "#evidence") {
      window.history.replaceState(null, "", "#projects");
      window.requestAnimationFrame(() => scrollToHash("#projects", { push: false }));
    }

    void start();
    mq.addEventListener("change", onMotionChange);
    window.addEventListener("popstate", onPopState);
    return () => {
      cancelled = true;
      mq.removeEventListener("change", onMotionChange);
      window.removeEventListener("popstate", onPopState);
      destroy?.();
    };
  }, []);

  return <>{children}</>;
}
