# Design System Master File: NJOEL

> **LOGIC:** When building a section, first check `design-system/njoel/pages/[page-name].md`.
> If it exists, its rules override this file. If not, follow this file.

**Project:** NJOEL (Panji Putra Ardian)
**Generated:** 2026-10-26 with `ui-ux-pro-max` (`--design-system`, query "developer portfolio dark cinematic", variance 7, motion 7, density 3), then reconciled with the brief.
**Dials (antislop):** ENERGY 3 / RHYTHM 3 / MOTION 3

## Reconciliation with the brief (read first)

The raw skill output classified this as a developer tool and suggested: "FAQ/Documentation Landing" pattern, a slate and green palette (`#22C55E` accent, `#0F172A` background), IBM Plex Sans, 8px/12px radii, a `back.out` stagger, and a text-shadow glow. All of that is **rejected**. Priority order: owner content, then owner tokens and art direction, then antislop, then this file, then taste-skill.

Kept from the skill: Dark Mode (OLED) as the style family, spacious density, the pre-delivery checklist, the animation rules, the accessibility rules, and the motion framework notes.

| Skill suggestion | Decision | Reason |
|---|---|---|
| FAQ/Documentation page pattern | Rejected | Portfolio has no FAQ. antislop R-28 forbids generic FAQ. |
| Green `#22C55E` accent, slate palette | Rejected | Owner tokens below. One teal accent. |
| JetBrains Mono / IBM Plex Sans | Replaced | Owner fonts: Bricolage Grotesque, Geist, JetBrains Mono (mono only). |
| text-shadow glow | Rejected | No glow anywhere (owner rule, antislop R-13). |
| `back.out(1.4)` stagger, scale 0.92 | Replaced | Overshoot reads as template. Use `power3.out` and `expo.out`. |
| Lucide / Heroicons | Replaced | Phosphor, one set, has brand marks. |
| 8px / 12px / 16px radii | Replaced | Owner radius: pill, 4px, 0px. |
| Shadow scale | Dropped | Elevation uses surface color plus a 1px line. |

## Color tokens (authoritative)

| Role | Hex | CSS variable | Tailwind name | Use |
|---|---|---|---|---|
| Background | `#09090B` | `--color-bg` | `bg` | Page |
| Surface | `#131316` | `--color-surface` | `surface` | Cards, dock, Projects stage, heatmap level 0, preloader |
| Text | `#ECEAF2` | `--color-fg` | `fg` | Primary text |
| Muted | `#8B8A96` | `--color-muted` | `muted` | Labels, secondary copy (5.8:1 on bg) |
| Line | `#25242C` | `--color-line` | `line` | Borders, rules, dividers |
| Accent | `#00A19B` | `--color-accent` | `accent` | CTAs, section numbers, hover, active, 3D objects, heatmap level 4. Hover fill `--color-accent-hover` `#14B8B1`. Revision note: accent changed from violet `#8B5CF6` to teal `#00A19B` (owner is an F1 fan, colour nod only, no team marks). |

Accent facts:
- Contrast on `#09090B` is about 4.7:1. Allowed for large type (18px+ or 14px bold+), numbers, borders, fills and focus rings. Never for small body text.
- Text placed on a teal fill is `#09090B` (6.2:1). White on teal is 3.2:1 and fails.
- Heatmap levels (solid steps, no gradient): L0 `#131316`, L1 `#0E3637`, L2 `#0A5A58`, L3 `#057E7A`, L4 `#00A19B`. These are mixes of surface and accent. They are chart data, not text. Measured against the surface: L1 1.41:1, L2 2.31:1, so low steps are faint by design. Meaning is never carried by color alone: each cell has a text label (date and count) available on focus and hover, and the totals are printed as text. Accent on surface is 5.8:1 and on the background 6.2:1; it still is not used for small body text.
- Dark only. No light mode, no toggle.
- Focus ring: 2px solid `#00A19B` with 3px offset. Meets 3:1 on bg.

## Typography

| Role | Font | CSS variable | Weight | Notes |
|---|---|---|---|---|
| Display | Bricolage Grotesque | `--font-display` | 500 to 800, optical size on | Hero, section headings, project titles |
| Body | Geist | `--font-body` | 400, 500 | Paragraphs, nav, UI |
| Mono | JetBrains Mono | `--font-mono` | 400, 500 | Section index, facts, dates, tags, legend |

Loaded with `next/font/google`, `display: swap`, subsets `latin`. Scale: 12, 14, 16, 18, 24, 32, 48, then fluid display sizes. Body line height 1.6, display 0.9 to 1.0. Line length 60 to 70 characters. Tabular numbers on mono. Mono labels uppercase only for 12 to 13px with at most 0.08em tracking.

## Radius

| Element | Radius |
|---|---|
| Buttons, tags, dock items | 9999px |
| Cards, project images, mockup frames, toast | 4px |
| Portrait frame, section lines, timeline rules | 0 |

## Spacing (density 3, spacious)

4pt base: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160. Section vertical padding `clamp(96px, 14vw, 200px)`, varied per section on purpose. Content max width 1200px with 24px side gutter on mobile, 48px on desktop.

## Elevation and layers

No box shadows, with one exception: the soft contact shadow under the Projects mockups. Elevation = surface color + 1px `line` border. Z-index scale: content 0, sticky nav 40, dock 40, modal 100, toast 110, preloader 1000, skip link 1100.

## Components

**Button (primary):** pill, height 48px (min target 44px), padding 0 28px, background `accent`, text `#09090B`, Geist 500 15px. Hover: translate by magnetic offset (max 8px) and a 200ms background shift to `#9D75F8`. Focus ring as above.

**Button (secondary):** pill, 1px `line` border, text `fg`, transparent. Hover: border `accent`, text `fg`.

**Tag:** pill, 1px `line` border, mono 12px, text `muted`, height 28px. Not a badge. No dot, no glow.

**Card:** 4px radius, `surface` background, 1px `line` border, padding 24 to 32px. Hover: border `accent`, 200ms. Cards in the Stack section differ in size by role (main stack larger than additional tools).

**Section header:** mono index `01 / 07` in `accent`, then a 0px 1px hairline in `line` spanning the content width, then display heading.

**Top nav:** fixed, 64px, bg `bg` at 80% opacity is NOT used (no blur). Solid `bg` with bottom 1px `line` after scroll. Links separated by `/` in `muted`. Active link `fg` with a 2px accent underline.

**Dock (below 768px):** fixed bottom, `surface`, 1px `line` top, 6 items, icon 22px plus 11px label (labels use `fg` and `muted` only, never accent text), 44px+ targets, safe-area inset padding. Active item: accent 2px top indicator and `fg` text.

**Projects stage (desktop):** `surface` background, sticky (not pinned) for about 90vh of scroll per project, one project per step. `role="tablist"` index (01-05) with arrow, Home and End keys, panels are `role="tabpanel"` and `inert` unless active. Mockups are CSS 3D frames: one identical laptop for websites (screen 1440 / 1024), a desktop monitor for Sidigs (screen 1920 / 1080) and one Android phone for mobile apps (screen 412 / 915, punch-hole camera, side buttons, no notch). Both use the same frame height (`--pj-h`). Pointer tilt about 6 degrees, flat for reduced motion. The only shadow on the site is the soft contact shadow under these mockups. Below 768px an accordion with real buttons (`aria-expanded`, `aria-controls`, 44px rows). Reduced motion: stacked blocks, no sticky.

**Toast:** `surface`, 1px `line`, 4px radius, `role="status"`, `aria-live="polite"`, auto-dismiss at 3 to 4s, does not steal focus.

## Motion

Durations 200, 400, 700ms. Ease set: `power3.out` (enter), `power2.inOut` (transition), `expo.out` (kinetic type), `power2.in` (exit). Exit at about 65% of enter. Transform and opacity only. One signature motion per section (see DESIGN.md). Stagger 30 to 50ms. Interruptible. All motion off or reduced to final state under `prefers-reduced-motion: reduce`. No blocking animation, no scroll-jacking.

Framework notes kept from the skill: use `gsap.matchMedia` with `(prefers-reduced-motion: reduce)`; group DOM writes and avoid layout reads between staggered tweens; code-split GSAP and Three.js.

## Page pattern (replaces "FAQ/Documentation")

Single route, seven chapters: Hero, About, Specialty, Projects, Experience, GitHub contributions (inside Contact anchor), CTA and footer. Composition changes per section (RHYTHM 3).

## Anti-patterns

- Gradients, glow, glassmorphism, blur, text-shadow
- Light mode, theme toggle
- Emojis as icons, sparkle or star icons, mixed icon sets
- Card grids that repeat one pattern in every section
- Layout-shifting hovers (use transform only), animating width or height
- Missing `cursor: pointer` on clickable elements
- Low contrast text, invisible focus
- Hover-only interactions (touch needs an equivalent)
- Invented copy, stats, testimonials, client names

## Pre-delivery checklist

- [ ] No emojis as icons, one icon set (Phosphor)
- [ ] `cursor: pointer` on all clickable elements
- [ ] Hover and state transitions 200 to 400ms
- [ ] Text contrast 4.5:1 minimum, accent never used for small body text
- [ ] Visible focus on every interactive element, focus not hidden behind fixed nav or dock
- [ ] `prefers-reduced-motion` respected (Lenis, marquee, parallax, 3D, grayscale transition)
- [ ] Projects stage: tabs are keyboard operable (arrows, Home, End), inactive panels are inert, accordion uses real buttons with aria-expanded
- [ ] Responsive at 375, 768, 1024, 1440, no horizontal overflow
- [ ] Fixed nav and dock reserve padding for underlying content
- [ ] Images have width, height, alt, and lazy-load below the fold
- [ ] `min-h-dvh` instead of `100vh` on mobile
