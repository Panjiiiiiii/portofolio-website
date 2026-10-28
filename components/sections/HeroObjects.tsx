"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { computeAnchors, heroLayoutCss, type Anchor, type ObjectId } from "@/lib/hero-layout";

// Three.js is code-split and never rendered on the server.
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

type NavigatorExtras = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

let cached3D: boolean | undefined;
const noopSubscribe = () => () => {};

function canUse3D(): boolean {
  cached3D ??= detect3D();
  return cached3D;
}

function detect3D(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as NavigatorExtras;
  if (nav.connection?.saveData) return false;
  if ((nav.hardwareConcurrency ?? 8) <= 2) return false;
  if ((nav.deviceMemory ?? 8) <= 2) return false;
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

/* Static SVG version of the glyph. Shown first, and kept for reduced motion,
   low-power devices, save-data and missing WebGL. Flat fill, no gradients. */
const ACCENT = "#00A19B";
const EDGE = { stroke: "#ECEAF2", strokeOpacity: 0.3, strokeWidth: 1.2 } as const;

function GlyphSvg() {
  return (
    <svg viewBox="-230 -130 460 260" className="h-auto w-full" fill={ACCENT} {...EDGE} strokeWidth={1}>
      <polygon points="-131,-100 -97,-100 -179,0 -97,100 -131,100 -213,0" />
      <polygon points="131,-100 97,-100 179,0 97,100 131,100 213,0" />
      <rect x={-15} y={-115} width={30} height={230} transform="rotate(18)" />
    </svg>
  );
}

export function HeroObjects() {
  const box = useRef<HTMLDivElement>(null);
  // false on the server and during hydration, then the real answer on the client.
  const use3D = useSyncExternalStore(noopSubscribe, canUse3D, () => false);
  const [armed, setArmed] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [inView, setInView] = useState(true);
  const getTrigger = useCallback(() => box.current?.closest("section") ?? null, []);
  const [anchors, setAnchors] = useState<Record<ObjectId, Anchor | null> | null>(null);

  // Place the glyph from real measurements so it never overlaps the tagline, the CTAs or the title.
  useEffect(() => {
    const section = getTrigger();
    if (!section) return;
    const title = section.querySelector("[data-hero-title]");
    const copy = section.querySelector("[data-hero-copy]");
    const measure = () => {
      const sr = section.getBoundingClientRect();
      const vw = window.innerWidth;
      const titleTop = title ? title.getBoundingClientRect().top - sr.top : null;
      const copyTop = copy ? copy.getBoundingClientRect().top - sr.top : null;
      // Wide screens: the glyph sits to the right of the tagline, so only the title limits it.
      const tops = vw >= 1024 ? [titleTop] : [titleTop, copyTop];
      const known = tops.filter((v): v is number => v !== null);
      setAnchors(computeAnchors(sr.width, vw, known.length ? Math.min(...known) : null));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(section);
    if (title) ro.observe(title);
    if (copy) ro.observe(copy);
    return () => ro.disconnect();
  }, [getTrigger]);

  const staticStyle = (id: ObjectId): React.CSSProperties | undefined => {
    if (!anchors) return undefined; // first paint uses the generated CSS
    const a = anchors[id];
    return a ? { display: "block", left: a.cx, top: a.cy, width: a.size } : { display: "none" };
  };

  // Load Three.js only after the page has loaded and the browser is idle, so it never competes
  // with the first paint. The static SVG glyph is shown until then.
  useEffect(() => {
    let timer: number | undefined;
    const schedule = () => {
      const run = () => setArmed(true);
      timer = window.setTimeout(() => {
        if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 2500 });
        else run();
      }, 1500);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", schedule);
    };
  }, []);

  // Render only while the hero is on screen.
  useEffect(() => {
    const el = getTrigger();
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [getTrigger]);

  const staticFade = `transition-opacity duration-400 ${canvasReady ? "opacity-0" : "opacity-100"}`;

  return (
    <div ref={box} aria-hidden className="pointer-events-none absolute inset-0 z-20">
      <style dangerouslySetInnerHTML={{ __html: heroLayoutCss() }} />
      <div className={`hero-obj hero-obj-glyph ${staticFade}`} style={staticStyle("glyph")}>
        <GlyphSvg />
      </div>

      {use3D && armed && anchors && (
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-400 ${
            canvasReady ? "opacity-100" : "opacity-0"
          }`}
        >
          <HeroScene
            active={inView}
            getTrigger={getTrigger}
            anchors={anchors}
            onReady={() => setCanvasReady(true)}
          />
        </div>
      )}
    </div>
  );
}
