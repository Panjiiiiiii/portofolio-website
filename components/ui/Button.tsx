import { ScrollLink } from "./ScrollLink";

const base =
  "inline-flex min-h-12 items-center justify-center rounded-pill px-7 font-sans text-[15px] font-medium transition-colors duration-200 ease-out";

const variants = {
  // Text on the violet fill is the background color: 4.7:1. White would be 4.2:1.
  primary: "bg-accent text-bg hover:bg-[#9d75f8]",
  secondary: "border border-line text-fg hover:border-accent",
} as const;

type Props = {
  href: `#${string}`;
  variant?: keyof typeof variants;
  children: React.ReactNode;
};

export function ButtonLink({ href, variant = "primary", children }: Props) {
  return (
    <ScrollLink href={href} className={`${base} ${variants[variant]}`}>
      {children}
    </ScrollLink>
  );
}
