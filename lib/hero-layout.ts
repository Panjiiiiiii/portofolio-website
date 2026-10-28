// Layout for the hero's one 3D statement: the floating "</>" glyph.
// The 3D scene and the static SVG fallback both read this table, so they sit in the same place.
// The glyph never overlaps the NJOEL title, the tagline or the CTAs, and stays clear of the fixed nav.

export type ObjectId = "glyph";

type Slot = {
  /** Horizontal centre as a fraction of the hero width. */
  cx: number;
  /** Width in px at the mode's reference width. Scales with the viewport (see `f`). */
  size: number;
};

type Mode = {
  /** Applies from this viewport width up. */
  min: number;
  /** Reference width where scale factor f = 1. */
  ref: number;
  fMin: number;
  fMax: number;
  /** Vertical centre in px from the top of the hero for the first paint: base + perF * f. */
  cy: { base: number; perF: number };
  slots: Record<ObjectId, Slot | null>;
};

/** Height of the glyph as a share of its width (SVG viewBox 460 x 260, plus room for 3D rotation). */
const ASPECT = 0.6;

// Mobile first. Later modes override earlier ones from their `min` width.
export const MODES: Mode[] = [
  // Phones: centred above the copy.
  { min: 0, ref: 375, fMin: 0.85, fMax: 1.5, cy: { base: 0, perF: 150 }, slots: { glyph: { cx: 0.5, size: 300 } } },
  // Tablets: centred above the copy, larger.
  { min: 600, ref: 768, fMin: 0.8, fMax: 1.25, cy: { base: 0, perF: 290 }, slots: { glyph: { cx: 0.5, size: 420 } } },
  // Desktop: to the right of the tagline and CTAs, above the title.
  { min: 1024, ref: 1440, fMin: 0.7, fMax: 1.2, cy: { base: 0, perF: 225 }, slots: { glyph: { cx: 0.72, size: 440 } } },
];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function modeFor(width: number): Mode {
  let current = MODES[0];
  for (const m of MODES) if (width >= m.min) current = m;
  return current;
}

export type Anchor = { cx: number; cy: number; size: number };

/**
 * Pixel centre and size of the glyph.
 * - `sectionW`: hero width (for horizontal placement)
 * - `viewportW`: window width (the CSS media queries use this, so modes always agree with the static layer)
 * - `limitY`: top (px from the hero top) of the first text the glyph must stay above, if any.
 *   The glyph is centred in the free band between the nav and that text, and shrinks to fit it.
 */
export function computeAnchors(
  sectionW: number,
  viewportW: number,
  limitY: number | null,
): Record<ObjectId, Anchor | null> {
  const m = modeFor(viewportW);
  const f = clamp(viewportW / m.ref, m.fMin, m.fMax);
  const s = m.slots.glyph;
  if (!s) return { glyph: null };

  const top = viewportW >= 768 ? 76 : 16; // clear of the fixed top nav
  const gap = 16;
  let size = Math.min(s.size * f, sectionW * 0.9);
  let cy = m.cy.base + m.cy.perF * f;
  if (limitY !== null) {
    const band = limitY - gap - top;
    // No room above the text at all (short landscape screens): show nothing rather than overlap.
    if (band < 90) return { glyph: null };
    size = Math.min(size, (band * 0.92) / ASPECT);
    cy = top + band / 2;
  }
  return { glyph: { cx: s.cx * sectionW, cy, size } };
}

const px = (n: number) => `${+n.toFixed(2)}px`;
const vw = (n: number) => `${+n.toFixed(3)}vw`;

function clampCss(value: number, m: Mode) {
  // value is for f = 1; f = clamp(100vw / ref, fMin, fMax)
  return `clamp(${px(value * m.fMin)}, ${vw((value / m.ref) * 100)}, ${px(value * m.fMax)})`;
}

/** CSS for the static SVG glyph's first paint, generated from the same table. */
export function heroLayoutCss(): string {
  // Decorative only: never intercept pointer, touch or wheel events.
  let css = ".hero-obj{position:absolute;transform:translate(-50%,-50%);pointer-events:none}";
  MODES.forEach((m) => {
    const s = m.slots.glyph;
    const rule = !s
      ? ".hero-obj-glyph{display:none}"
      : `.hero-obj-glyph{display:block;left:${+(s.cx * 100).toFixed(2)}%;top:calc(${px(m.cy.base)} + ${clampCss(m.cy.perF, m)});width:${clampCss(s.size, m)}}`;
    css += m.min > 0 ? `@media (min-width:${m.min}px){${rule}}` : rule;
  });
  return css;
}
