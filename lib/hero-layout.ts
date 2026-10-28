// Shared layout for the three hero objects (glyph, gamepad, helmet).
// The 3D scene and the static SVG fallback both read this table, so they sit in the same places.
// Positions are tuned so no object overlaps the NJOEL title, the tagline or the CTAs.

export type ObjectId = "glyph" | "gamepad" | "helmet";

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
  /** Vertical centre in px from the top of the hero: base + perF * f. */
  cy: { base: number; perF: number };
  slots: Record<ObjectId, Slot | null>;
};

// Mobile first. Later modes override earlier ones from their `min` width.
export const MODES: Mode[] = [
  {
    min: 0,
    ref: 375,
    fMin: 0.85,
    fMax: 1.5,
    cy: { base: 0, perF: 135 },
    slots: {
      glyph: { cx: 0.2, size: 100 },
      gamepad: { cx: 0.5, size: 92 },
      helmet: { cx: 0.8, size: 86 },
    },
  },
  {
    min: 600,
    ref: 768,
    fMin: 0.8,
    fMax: 1.25,
    cy: { base: 90, perF: 85 },
    slots: {
      glyph: { cx: 0.22, size: 190 },
      gamepad: { cx: 0.52, size: 160 },
      helmet: { cx: 0.8, size: 150 },
    },
  },
  {
    min: 1024,
    ref: 1440,
    fMin: 0.7,
    fMax: 1.2,
    cy: { base: 64, perF: 131 },
    slots: {
      glyph: { cx: 0.58, size: 250 },
      gamepad: { cx: 0.75, size: 210 },
      helmet: { cx: 0.905, size: 180 },
    },
  },
];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function modeFor(width: number): Mode {
  let current = MODES[0];
  for (const m of MODES) if (width >= m.min) current = m;
  return current;
}

export type Anchor = { cx: number; cy: number; size: number };

/**
 * Pixel centres and sizes for the objects.
 * - `sectionW`: hero width (for horizontal placement)
 * - `viewportW`: window width (the CSS media queries use this, so modes always agree with the static layer)
 * - `limitY`: top (px from the hero top) of the first text the objects must stay above, if any.
 *   When the band above it is too short, the objects shrink and move up so they never overlap text.
 */
export function computeAnchors(
  sectionW: number,
  viewportW: number,
  limitY: number | null,
): Record<ObjectId, Anchor | null> {
  const m = modeFor(viewportW);
  const f = clamp(viewportW / m.ref, m.fMin, m.fMax);
  const out = {} as Record<ObjectId, Anchor | null>;
  const ids = Object.keys(m.slots) as ObjectId[];
  const top = viewportW >= 768 ? 76 : 16; // clear of the fixed top nav
  const gap = 14;
  // If there is no room above the text at all (short landscape screens), show none rather than overlap.
  const noRoom = limitY !== null && limitY - gap - top < 90;
  ids.forEach((id) => {
    const s = m.slots[id];
    if (!s || noRoom) {
      out[id] = null;
      return;
    }
    let size = s.size * f;
    let cy = m.cy.base + m.cy.perF * f;
    if (limitY !== null) {
      const band = limitY - gap - top;
      const needed = size; // half height is about half the width for the tallest object
      if (band < needed) size = Math.max(band, 48);
      cy = Math.min(Math.max(cy, top + size / 2), limitY - gap - size / 2);
    }
    out[id] = { cx: s.cx * sectionW, cy, size };
  });
  return out;
}
const px = (n: number) => `${+n.toFixed(2)}px`;
const vw = (n: number) => `${+n.toFixed(3)}vw`;

function clampCss(value: number, m: Mode) {
  // value is for f = 1; f = clamp(100vw / ref, fMin, fMax)
  return `clamp(${px(value * m.fMin)}, ${vw((value / m.ref) * 100)}, ${px(value * m.fMax)})`;
}

/** CSS for the static SVG layer, generated from the same table. */
export function heroLayoutCss(): string {
  const ids: ObjectId[] = ["glyph", "gamepad", "helmet"];
  // Decorative only: never intercept pointer, touch or wheel events.
  let css = ".hero-obj{position:absolute;transform:translate(-50%,-50%);pointer-events:none}";
  MODES.forEach((m) => {
    const rules = ids
      .map((id) => {
        const s = m.slots[id];
        if (!s) return `.hero-obj-${id}{display:none}`;
        const top = `calc(${px(m.cy.base)} + ${clampCss(m.cy.perF, m)})`;
        return `.hero-obj-${id}{display:block;left:${+(s.cx * 100).toFixed(2)}%;top:${top};width:${clampCss(s.size, m)}}`;
      })
      .join("");
    css += m.min > 0 ? `@media (min-width:${m.min}px){${rules}}` : rules;
  });
  return css;
}
