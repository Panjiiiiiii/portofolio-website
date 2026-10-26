"use client";

import { ArrowUp } from "@phosphor-icons/react/dist/ssr";
import { footerCopy } from "@/data/contact";
import { scrollToTop } from "@/lib/scroll";

export function BackToTop() {
  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="inline-flex min-h-11 items-center gap-3 rounded-pill border border-line px-6 text-[15px] font-medium transition-colors duration-200 hover:border-accent"
    >
      {footerCopy.backToTop}
      <ArrowUp size={18} aria-hidden />
    </button>
  );
}
