import Image from "next/image";
import type { ProjectItem } from "@/lib/images";

type Props = ProjectItem & {
  /** Images below the fold load lazily. The first stage panel can be eager. */
  eager?: boolean;
};

/**
 * One screenshot in a CSS-built mockup. No second WebGL context.
 * - "laptop": lid with a thin bezel and a base, drawn around a clean web screenshot.
 * - "plane": the screenshot alone as a plane, for images that already contain a phone
 *   bezel or browser chrome (so nothing is framed twice).
 * The screenshot is never edited, only displayed.
 */
export function ProjectMockup({ project, image, eager = false }: Props) {
  if (!image) {
    return (
      <div
        role="img"
        aria-label={`${project.title} screenshot placeholder`}
        className="flex aspect-[4/3] w-full items-center justify-center rounded-card border border-line bg-surface p-6 text-center font-mono text-[13px] text-muted"
      >
        [SCREENSHOT PLACEHOLDER] Run npm run assets after adding the file.
      </div>
    );
  }

  const ratio = image.width / image.height;
  const picture = (
    <Image
      src={image.src}
      alt={`Screenshot of the ${project.title} project`}
      width={image.width}
      height={image.height}
      placeholder="blur"
      blurDataURL={image.blur}
      // Served as exported in /public so the pixels are exactly what was optimized.
      unoptimized
      loading={eager ? "eager" : "lazy"}
      draggable={false}
      className="block h-full w-full select-none"
    />
  );

  return (
    <div className="pj-device-wrap" style={{ ["--ar" as string]: ratio }}>
      <div className="pj-persp">
        <div className="pj-tilt" data-pj-tilt>
          {project.frame === "laptop" ? (
            <div className="pj-device pj-laptop">
              <div className="pj-lid">
                <span className="pj-cam" aria-hidden />
                <div className="pj-screen">{picture}</div>
              </div>
              <div className="pj-base" aria-hidden />
            </div>
          ) : (
            <div className="pj-device pj-plane">
              <div className="pj-plane-img">{picture}</div>
            </div>
          )}
        </div>
      </div>
      <div className="pj-shadow" aria-hidden />
    </div>
  );
}
