import type Lenis from "lenis";
import { prefersReducedMotion } from "./gsap";

let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

/**
 * Scrolls to an in-page hash. Uses Lenis when active, native smooth scroll otherwise.
 * Pushes a history entry so the back button returns to the previous section.
 */
// Old hashes that still work after a section was renamed.
const ALIASES: Record<string, string> = { evidence: "projects" };

export function scrollToHash(hash: string, opts: { push?: boolean } = {}) {
  const { push = true } = opts;
  const raw = hash.replace(/^#/, "");
  const id = ALIASES[raw] ?? raw;
  const target = id === "home" || id === "" ? document.documentElement : document.getElementById(id);
  if (!target) return;

  if (push && window.location.hash !== `#${id}`) {
    window.history.pushState(null, "", id === "home" ? window.location.pathname : `#${id}`);
  }

  if (lenis) {
    lenis.scrollTo(id === "home" || id === "" ? 0 : target, { duration: 1.1 });
  } else {
    const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
    if (id === "home" || id === "") window.scrollTo({ top: 0, behavior });
    else target.scrollIntoView({ behavior, block: "start" });
  }

  // Move keyboard focus to the section heading so tab order continues from there.
  const focusTarget = (target.querySelector("[data-focus-target]") ??
    (target.hasAttribute("data-focus-target") ? target : null)) as HTMLElement | null;
  focusTarget?.focus({ preventScroll: true });
}

export function scrollToTop() {
  scrollToHash("#home");
}
