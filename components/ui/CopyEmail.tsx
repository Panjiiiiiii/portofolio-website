"use client";

import { useEffect, useRef, useState } from "react";
import { Copy } from "@phosphor-icons/react/dist/ssr";
import { email, footerCopy } from "@/data/contact";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for insecure contexts or blocked clipboard permission.
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** Email link plus a copy button. The toast is a polite live region and never takes focus. */
export function CopyEmail() {
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function onCopy() {
    const ok = await copyText(email);
    setToast({ text: ok ? footerCopy.copied : footerCopy.copyFailed, ok });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 3500);
  }

  return (
    <div>
      <p className="font-mono text-[13px] text-muted">{footerCopy.emailLabel}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <a
          href={`mailto:${email}`}
          className="font-display text-[clamp(1.25rem,3.4vw,2.5rem)] font-bold tracking-[-0.02em] break-all transition-colors duration-200 hover:text-accent"
        >
          {email}
        </a>
        <button
          type="button"
          onClick={onCopy}
          aria-label={footerCopy.copyButton}
          className="inline-flex size-11 items-center justify-center rounded-pill border border-line transition-colors duration-200 hover:border-accent"
        >
          <Copy size={20} aria-hidden />
        </button>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-[calc(72px+env(safe-area-inset-bottom))] left-1/2 z-[110] -translate-x-1/2 md:bottom-8"
      >
        {toast && (
          <p
            className={`rounded-card border bg-surface px-5 py-3 text-[15px] ${
              toast.ok ? "border-line" : "border-accent"
            }`}
          >
            {toast.text}
          </p>
        )}
      </div>
    </div>
  );
}
