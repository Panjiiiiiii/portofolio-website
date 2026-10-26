"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePageReady } from "@/components/providers/PageReady";
import { preloader } from "@/data/site";

const SEEN_KEY = "njoel:preloaded";
const COUNT_MS = 550; // counter
const EXIT_MS = 400; // slide away. Total stays near 1.2s.

// Decided once per page load: already seen this session, or reduced motion.
let skipDecision: boolean | undefined;
const noopSubscribe = () => () => {};
function shouldSkip(): boolean {
  if (skipDecision === undefined) {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    skipDecision = seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return skipDecision;
}

/**
 * Overlay above already-rendered content. Once per session, skippable
 * (button, Escape, Enter, or click). Skipped entirely for reduced motion.
 */
export function Preloader() {
  const { markReady } = usePageReady();
  const skip = useSyncExternalStore(noopSubscribe, shouldSkip, () => false);
  const [phase, setPhase] = useState<"show" | "leaving" | "done">("show");
  const [count, setCount] = useState(0);
  const finished = useRef(false);
  const skipRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (skip) {
      markReady();
      return;
    }

    const leave = () => {
      if (finished.current) return;
      finished.current = true;
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
      setCount(100);
      setPhase("leaving");
      markReady();
      window.setTimeout(() => setPhase("done"), EXIT_MS);
    };

    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / COUNT_MS, 1);
      setCount(Math.round(100 * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
      else leave();
    };
    raf = requestAnimationFrame(step);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") leave();
    };
    window.addEventListener("keydown", onKey);
    skipRef.current = leave;
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, [skip, markReady]);

  if (skip || phase === "done") return null;

  return (
    <div
      id="preloader"
      role="status"
      aria-live="polite"
      onClick={() => skipRef.current()}
      style={{
        transform: phase === "leaving" ? "translateY(-100%)" : "translateY(0)",
        transition: `transform ${EXIT_MS}ms cubic-bezier(0.455, 0.03, 0.515, 0.955)`,
      }}
      className="fixed inset-0 z-[1000] flex flex-col justify-between bg-bg px-6 py-8 md:px-12"
    >
      <div className="flex items-start justify-between">
        <span className="font-display text-xl font-extrabold tracking-tight">NJOEL</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            skipRef.current();
          }}
          className="inline-flex min-h-11 items-center rounded-pill border border-line px-5 font-mono text-[13px] text-muted transition-colors duration-200 hover:border-accent hover:text-fg"
        >
          {preloader.skip}
        </button>
      </div>
      <div className="flex items-end justify-between">
        <p className="font-mono text-[13px] text-muted">{preloader.label}</p>
        <p
          aria-hidden
          className="font-display text-[clamp(4rem,16vw,12rem)] leading-[0.8] font-extrabold tabular-nums"
        >
          {String(count).padStart(3, "0")}
        </p>
      </div>
    </div>
  );
}
