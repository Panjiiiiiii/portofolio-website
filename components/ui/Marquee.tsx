type Props = { items: string[]; label: string };

/**
 * CSS-only marquee. The track holds two copies and moves by -50% for a seamless loop.
 * Pauses on hover/focus. Under reduced motion it stops and the copy is hidden (see globals.css).
 */
export function Marquee({ items, label }: Props) {
  const row = (hidden: boolean, className = "") => (
    <ul
      aria-hidden={hidden || undefined}
      className={`flex shrink-0 items-center ${className}`}
    >
      {items.map((item) => (
        <li key={item} className="flex items-center whitespace-nowrap">
          <span className="font-display text-[clamp(3rem,9vw,8.5rem)] leading-none font-bold tracking-[-0.03em]">
            {item}
          </span>
          <span
            aria-hidden
            className="px-[clamp(1.25rem,3vw,3rem)] font-display text-[clamp(3rem,9vw,8.5rem)] leading-none font-light text-line"
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
