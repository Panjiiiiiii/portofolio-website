"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { evidenceCopy } from "@/data/projects";
import { loadGsap, prefersReducedMotion } from "@/lib/gsap";
import type { ImageMeta } from "@/lib/images";

type Api = { go: (i: number) => void };

const SLIDE_HEIGHT = "min(58vh, 560px)";

/**
 * Draggable screenshot slider (GSAP Draggable + inertia, snapping to slides).
 * Works with mouse drag, touch swipe, the Previous/Next buttons, and the arrow keys.
 * Screenshots are shown unmodified.
 */
export function Gallery({ images, label }: { images: ImageMeta[]; label: string }) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const api = useRef<Api | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const [{ gsap }, { Draggable }, { InertiaPlugin }] = await Promise.all([
        loadGsap(),
        import("gsap/Draggable"),
        import("gsap/InertiaPlugin"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(Draggable, InertiaPlugin);

      const vp = viewport.current;
      const tr = track.current;
      if (!vp || !tr) return;
      const slides = Array.from(tr.children) as HTMLElement[];
      const reduce = prefersReducedMotion();

      let offsets: number[] = [];
      let current = 0;
      const measure = () => {
        const min = Math.min(0, vp.clientWidth - tr.scrollWidth);
        offsets = slides.map((s) => Math.max(min, -s.offsetLeft));
        return min;
      };
      const nearest = (x: number) =>
        offsets.reduce((best, o, i) => (Math.abs(o - x) < Math.abs(offsets[best] - x) ? i : best), 0);

      const min = measure();
      gsap.set(tr, { x: 0 });

      const [drag] = Draggable.create(tr, {
        type: "x",
        bounds: { minX: min, maxX: 0 },
        inertia: !reduce,
        edgeResistance: 0.9,
        minimumMovement: 4,
        cursor: "grab",
        activeCursor: "grabbing",
        snap: { x: (v: number) => offsets[nearest(v)] },
        onDrag() {
          current = nearest(this.x);
          setIndex(current);
        },
        onThrowUpdate() {
          current = nearest(this.x);
          setIndex(current);
        },
      });

      const go = (i: number) => {
        const target = Math.max(0, Math.min(offsets.length - 1, i));
        current = target;
        setIndex(target);
        gsap.killTweensOf(tr);
        gsap.to(tr, {
          x: offsets[target],
          duration: reduce ? 0 : 0.4,
          ease: "power3.out",
          onUpdate: () => drag.update(),
          onComplete: () => drag.update(),
        });
      };
      api.current = { go };

      const ro = new ResizeObserver(() => {
        const newMin = measure();
        drag.applyBounds({ minX: newMin, maxX: 0 });
        gsap.set(tr, { x: offsets[current] ?? 0 });
        drag.update();
      });
      ro.observe(vp);

      cleanup = () => {
        ro.disconnect();
        drag.kill();
        api.current = null;
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [images]);

  const last = images.length - 1;

  return (
    <div>
      <div
        ref={viewport}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            api.current?.go(index + 1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            api.current?.go(index - 1);
          } else if (e.key === "Home") {
            e.preventDefault();
            api.current?.go(0);
          } else if (e.key === "End") {
            e.preventDefault();
            api.current?.go(last);
          }
        }}
        className="overflow-hidden"
      >
        <ul ref={track} className="flex w-max gap-4">
          {images.map((img, i) => {
            const ratio = img.width / img.height;
            return (
              <li
                key={img.src}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${images.length}`}
                className="shrink-0 select-none"
                style={{
                  aspectRatio: ratio,
                  width: `min(calc(100vw - 3rem), calc(${SLIDE_HEIGHT} * ${ratio}))`,
                }}
              >
                <Image
                  src={img.src}
                  alt={`${label}, screenshot ${i + 1} of ${images.length}`}
                  width={img.width}
                  height={img.height}
                  placeholder="blur"
                  blurDataURL={img.blur}
                  // Served as optimized in /public so the pixels are exactly what was exported.
                  unoptimized
                  loading={i === 0 ? "eager" : "lazy"}
                  draggable={false}
                  className="h-full w-full rounded-card border border-line"
                />
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="font-mono text-[13px] text-muted tabular-nums" aria-live="polite">
          {index + 1} / {images.length}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => api.current?.go(index - 1)}
            disabled={index === 0}
            aria-label={evidenceCopy.prevLabel}
            className="inline-flex size-11 items-center justify-center rounded-pill border border-line transition-colors duration-200 hover:border-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line"
          >
            <CaretLeft size={20} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => api.current?.go(index + 1)}
            disabled={index === last}
            aria-label={evidenceCopy.nextLabel}
            className="inline-flex size-11 items-center justify-center rounded-pill border border-line transition-colors duration-200 hover:border-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line"
          >
            <CaretRight size={20} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
