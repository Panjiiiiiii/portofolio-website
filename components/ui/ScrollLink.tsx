"use client";

import { scrollToHash } from "@/lib/scroll";

type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: `#${string}`;
};

/** In-page anchor. Real href (works without JS), upgraded to Lenis scroll + history entry. */
export function ScrollLink({ href, onClick, children, ...rest }: Props) {
  return (
    <a
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        scrollToHash(href);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
