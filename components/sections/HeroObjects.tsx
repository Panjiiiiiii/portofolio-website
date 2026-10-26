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

/* Static SVG versions of the three objects. Shown first, and kept for reduced motion,
   low-power devices, save-data and missing WebGL. Flat fills, no gradients. */
const BODY = "#23232b";
const DARK = "#0c0c0f";
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

function GamepadSvg() {
  return (
    <svg viewBox="0 0 140 92" className="h-auto w-full">
      <path
        d="M30 12h80a22 22 0 0 1 22 22v10c0 34-12 46-22 46-9 0-13-10-18-18-4-6-8-8-14-8H62c-6 0-10 2-14 8-5 8-9 18-18 18-10 0-22-12-22-46V34a22 22 0 0 1 22-22z"
        fill={BODY}
        {...EDGE}
      />
      <rect x={30} y={31} width={22} height={7} fill={DARK} />
      <rect x={37.5} y={23.5} width={7} height={22} fill={DARK} />
      <circle cx={100} cy={26} r={4.5} fill={DARK} />
      <circle cx={100} cy={44} r={4.5} fill={DARK} />
      <circle cx={91} cy={35} r={4.5} fill={DARK} />
      <circle cx={109} cy={35} r={4.5} fill={ACCENT} />
      <circle cx={54} cy={58} r={7.5} fill={DARK} />
      <circle cx={86} cy={58} r={7.5} fill={DARK} />
    </svg>
  );
}

function HelmetSvg() {
  return (
    <svg viewBox="0 0 100 100" className="h-auto w-full">
      <ellipse cx={50} cy={50} rx={42} ry={44} fill={BODY} {...EDGE} />
      <path d="M12 52C16 38 84 38 88 52L85 64C70 70 30 70 15 64Z" fill="#050507" />
      <path d="M18 68C30 94 70 94 82 68 68 74 32 74 18 68Z" fill={BODY} {...EDGE} />
      <path d="M50 7C49 20 49 30 50 40" fill="none" stroke={ACCENT} strokeWidth={5} strokeLinecap="butt" />
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

  // Place the objects from real measurements so they never overlap the tagline or the title.
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
      // Wide screens: objects sit to the right of the tagline, so only the title limits them.
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
  // with the first paint. The static SVG objects are shown until then.
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
      <div className={`hero-obj hero-obj-gamepad ${staticFade}`} style={staticStyle("gamepad")}>
        <GamepadSvg />
      </div>
      <div className={`hero-obj hero-obj-helmet ${staticFade}`} style={staticStyle("helmet")}>
        <HelmetSvg />
      </div>

      {use3D && armed && anchors && (
        <div
          className={`absolute inset-0 transition-opacity duration-400 ${
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
