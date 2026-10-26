"use client";

import { useEffect, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "@/lib/gsap";

type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  strength?: number;
};

/**
 * External link that drifts toward the pointer (max about 10px). Mouse only.
 * Off for touch and reduced motion, where it is a plain link.
 */
export function MagneticLink({ href, strength = 0.3, children, ...rest }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let cancelled = false;
    let off: (() => void) | undefined;

    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      const qx = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
      const qy = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
      const clamp = (v: number) => Math.max(-10, Math.min(10, v));
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        qx(clamp((e.clientX - (r.left + r.width / 2)) * strength));
        qy(clamp((e.clientY - (r.top + r.height / 2)) * strength));
      };
      const leave = () => {
        qx(0);
        qy(0);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      off = () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
        gsap.set(el, { x: 0, y: 0 });
      };
    });

    return () => {
      cancelled = true;
      off?.();
    };
  }, [strength]);

  return (
    <a ref={ref} href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}
