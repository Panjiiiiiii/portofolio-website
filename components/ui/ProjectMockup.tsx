import Image from "next/image";
import type { FrameKind } from "@/data/frames";
import type { ProjectItem } from "@/lib/images";

type Props = ProjectItem & {
  /** Images below the fold load lazily. The first stage panel can be eager. */
  eager?: boolean;
};

// Display widths of the screen, used for the responsive srcset.
const SIZES: Record<FrameKind, string> = {
  laptop: "(min-width: 1024px) 660px, (min-width: 768px) 55vw, 90vw",
  monitor: "(min-width: 1024px) 640px, (min-width: 768px) 55vw, 90vw",
  phone: "(min-width: 768px) 240px, 45vw",
};

/**
 * One screenshot in a CSS-only device frame. No images, no brand marks, no second WebGL context.
 * - laptop: the same laptop for those websites; the screen is exactly 1440 / 1024.
 * - monitor: a desktop monitor on a stand; the screen is exactly 1920 / 1080.
 * - phone: an Android-style phone (punch-hole camera, side buttons); the screen is 412 / 915.
 * All frames take their height from the same --pj-h (globals.css), so the stage does not jump.
 * Screen sizes come from data/frames.ts, and `npm run assets` fits each screenshot to them.
 */
export function ProjectMockup({ project, image, eager = false }: Props) {
  const kind = project.frame;

  const picture = image ? (
    <Image
      src={image.src}
      alt={`Screenshot of the ${project.title} project`}
      width={image.width}
      height={image.height}
      sizes={SIZES[kind]}
      placeholder="blur"
      blurDataURL={image.blur}
      loading={eager ? "eager" : "lazy"}
      draggable={false}
      className="block h-full w-full object-cover object-top select-none"
    />
  ) : (
    <span className="flex h-full w-full items-center justify-center bg-surface p-4 text-center font-mono text-[13px] text-muted">
      [SCREENSHOT PLACEHOLDER] Run npm run assets after adding the file.
    </span>
  );

  return (
    <div className="pj-device-wrap">
      <div className="pj-persp">
        <div className="pj-tilt" data-pj-tilt>
          {kind === "laptop" && (
            <div className="pj-device pj-laptop">
              <div className="pj-lid">
                <span className="pj-cam" aria-hidden />
                <div className="pj-screen">{picture}</div>
              </div>
              <div className="pj-base" aria-hidden />
            </div>
          )}
          {kind === "monitor" && (
            <div className="pj-device pj-monitor">
              <div className="pj-mon-panel">
                <div className="pj-mon-screen">{picture}</div>
                <span className="pj-mon-led" aria-hidden />
              </div>
              <div className="pj-mon-neck" aria-hidden />
              <div className="pj-mon-foot" aria-hidden />
            </div>
          )}
          {kind === "phone" && (
            <div className="pj-device pj-phone">
              <span className="pj-btn pj-btn-power" aria-hidden />
              <span className="pj-btn pj-btn-volume" aria-hidden />
              <div className="pj-phone-screen">
                {picture}
                <span className="pj-punch" aria-hidden />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="pj-shadow" aria-hidden />
    </div>
  );
}
