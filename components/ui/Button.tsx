import { ScrollLink } from "./ScrollLink";

// Narrower side padding below 768px so three hero buttons fit two to a row at 375px.
const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-pill px-5 font-sans text-[15px] font-medium transition-colors duration-200 ease-out md:px-7";

const variants = {
  // Text on the teal fill is the background color: 6.2:1. White would be 3.2:1.
  primary: "bg-accent text-bg hover:bg-accent-hover",
  secondary: "border border-line text-fg hover:border-accent",
} as const;

type Variant = keyof typeof variants;

type Props = {
  href: `#${string}`;
  variant?: Variant;
  children: React.ReactNode;
};

/** In-page anchor styled as a button (Lenis scroll + history entry). */
export function ButtonLink({ href, variant = "primary", children }: Props) {
  return (
    <ScrollLink href={href} className={`${base} ${variants[variant]}`}>
      {children}
    </ScrollLink>
  );
}

/** Plain link styled as a button, for files and other non-hash destinations. */
export function AnchorButton({
  variant = "secondary",
  className = "",
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant }) {
  return (
    <a className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </a>
  );
}
