"use client";

import { useEffect, useRef } from "react";

/** Own horizontal scroll container (no page overflow). Starts at the newest weeks. */
export function HeatmapScroller({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      tabIndex={0}
      className="overflow-x-auto overscroll-x-contain pb-3"
    >
      {children}
    </div>
  );
}
