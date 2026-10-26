import { brandIcons } from "@/lib/brand-icons";

type Props = {
  id: string;
  className?: string;
  /** Decorative when the visible label already names it (cards, tags). */
  decorative?: boolean;
};

/** Monochrome logo in currentColor, so the parent decides text color and hover color. */
export function BrandIcon({ id, className = "size-8", decorative = false }: Props) {
  const icon = brandIcons[id];
  if (!icon) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...(decorative
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": icon.title })}
    >
      <path d={icon.path} />
    </svg>
  );
}
