"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// Three.js is code-split and never rendered on the server.
const GlyphCanvas = dynamic(() => import("./GlyphCanvas"), { ssr: false });

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

/** Same glyph as static SVG: shown first, and kept for reduced motion and low-power devices. */
function StaticGlyph({ hidden }: { hidden: boolean }) {
  return (
    <svg
      viewBox="-230 -130 460 260"
      className={`absolute inset-0 m-auto h-auto w-full transition-opacity duration-400 ${
        hidden ? "opacity-0" : "opacity-100"
      }`}
      fill="#8B5CF6"
      stroke="#ECEAF2"
      strokeOpacity={0.35}
      strokeWidth={1}
      aria-hidden
    >
      <polygon points="-131,-100 -97,-100 -179,0 -97,100 -131,100 -213,0" />
      <polygon points="131,-100 97,-100 179,0 97,100 131,100 213,0" />
      <rect x={-15} y={-115} width={30} height={230} transform="rotate(18)" />
    </svg>
  );
}

export function HeroGlyph() {
  const box = useRef<HTMLDivElement>(null);
  // false on the server and during hydration, then the real answer on the client.
  const use3D = useSyncExternalStore(noopSubscribe, canUse3D, () => false);
  const [armed, setArmed] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [inView, setInView] = useState(true);

  // Load Three.js only after the page has loaded and the browser is idle, so it never competes
  // with the first paint. The static glyph is shown until then.
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
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={box} aria-hidden className="relative h-full w-full">
      <StaticGlyph hidden={canvasReady} />
      {use3D && armed && (
        <div
          className={`absolute inset-0 transition-opacity duration-400 ${
            canvasReady ? "opacity-100" : "opacity-0"
          }`}
        >
          <GlyphCanvas active={inView} onReady={() => setCanvasReady(true)} />
        </div>
      )}
    </div>
  );
}
