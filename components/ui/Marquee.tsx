import { BrandIcon } from "./BrandIcon";

type Props = { ids: string[]; label: string };

/**
 * Logos-only CSS marquee. The track holds two copies and moves by -50% for a seamless loop.
 * Pauses on hover/focus. Under reduced motion it stops and the copy is hidden (see globals.css).
 */
export function Marquee({ ids, label }: Props) {
  const row = (hidden: boolean, className = "") => (
    <ul
      aria-hidden={hidden || undefined}
      className={`flex shrink-0 items-center ${className}`}
    >
      {ids.map((id) => (
        <li key={id} className="flex items-center">
          <span className="text-fg transition-colors duration-200 hover:text-accent">
            <BrandIcon id={id} className="size-[clamp(3.5rem,7vw,6rem)]" />
          </span>
          <span
            aria-hidden
            className="px-[clamp(2rem,5vw,5rem)] font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-none font-light text-line"
          >
            /
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="marquee overflow-hidden" role="group" aria-label={label}>
      <div className="marquee-track flex w-max">
        {row(false)}
        {row(true, "marquee-dup")}
      </div>
    </div>
  );
}
