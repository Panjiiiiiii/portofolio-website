"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ImageMeta } from "@/lib/images";

type Props = { image?: ImageMeta; alt: string };

/**
 * 4:5 portrait, 0px corners, 1px line border.
 * Grayscale until hovered (desktop). On touch there is no hover, so it turns to
 * color once it enters the viewport. Reduced motion removes the transition (see globals.css).
 */
export function Portrait({ image, alt }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [colored, setColored] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(hover: none)").matches) return;
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setColored(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!image) {
    return (
      <div
        role="img"
        aria-label="Photo placeholder"
        className="flex aspect-[4/5] w-full items-center justify-center border border-line bg-surface p-6 text-center font-mono text-[13px] text-muted"
      >
        [PHOTO PLACEHOLDER] Add assets/photo-personal.jpeg and run npm run assets.
      </div>
    );
  }

  return (
    <div
      ref={box}
      data-colored={colored}
      className="portrait relative aspect-[4/5] w-full overflow-hidden border border-line"
    >
      <Image
        src={image.src}
        alt={alt}
        width={image.width}
        height={image.height}
        placeholder="blur"
        blurDataURL={image.blur}
        sizes="(min-width: 768px) 40vw, 90vw"
        className="h-full w-full object-cover object-top"
      />
    </div>
  );
}
