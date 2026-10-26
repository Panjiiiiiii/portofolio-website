# DESIGN.md: NJOEL

Dial: ENERGY 3 / RHYTHM 3 / MOTION 3

Design Read: personal developer portfolio for hiring managers and freelance clients, in a dark cinematic editorial style, dial ENERGY 3 / RHYTHM 3 / MOTION 3.

## Direction in one sentence

A dark, scroll-driven film of one developer's work: oversized NJOEL type, three floating 3D objects, short manifesto-style copy, numbered chapters (01/07) and hairline rules, with every other surface kept quiet so the work in Projects carries the page.

## Why these dials

- ENERGY 3: the portfolio is the product. The hero has to say hello loudly, once. Everything after it recedes.
- RHYTHM 3: sections must not share one composition. Hero is oversized type with three floating 3D objects, About is an asymmetric photo and text split, Stack is a logo marquee over uneven cards, Projects is a pinned stage with one project per scroll step, Experience is a stepped timeline, Contact is a heatmap strip plus a large CTA, the footer is a parallax reveal.
- MOTION 3: the brief asks for cinematic. Max one signature motion per section, so choreography stays readable.

## Palette (tokens from the brief, not negotiable)

| Role | Hex | Reason |
|---|---|---|
| Background | `#09090B` | Near-black with a slight cool tint. Dark only: cinematic mood and a developer audience, not a default. |
| Surface | `#131316` | One step up for cards, dock, the Projects stage, heatmap level 0. |
| Text | `#ECEAF2` | Soft off-white, avoids pure-white glare on near-black. |
| Muted | `#8B8A96` | Labels, secondary copy. 5.8:1 on background. |
| Line | `#25242C` | Hairlines, borders, section rules. |
| Accent | `#00A19B` | The single accent: teal, a colour nod to the owner's favourite F1 team (no logo, star, sponsor, driver or livery is used). Solid only. 6.2:1 on background, 5.8:1 on surface. For CTAs, section numbers, hover and active states, 3D objects and heatmap steps. Never small body text. |

Rules that follow from the tokens:
- Text on a teal fill is `#09090B`, not white (white on teal is 3.2:1, dark is 6.2:1). Hover fill is `#14B8B1`.
- No gradients anywhere. No glow. No glassmorphism. Elevation is expressed by surface color and a 1px line, not shadow.
- Palette is 3 neutrals plus 1 accent, which sits inside antislop R-29.
- Accent decision (revision): the accent moved from violet `#8B5CF6` to teal `#00A19B`. Teal on near-black is a plain brand colour, no longer on the R-01 "purple-and-black" watch list, and it has better contrast.

## Type pairing

| Use | Font | Reason |
|---|---|---|
| Display | Bricolage Grotesque | Tight, slightly quirky grotesque with optical sizing. At hero scale it has character that a neutral grotesque lacks. |
| Body | Geist | Clean at small sizes on dark backgrounds. Owner's choice. |
| Labels, numbers | JetBrains Mono | Section numbers, facts, dates, heatmap legend. Small sizes only, modest tracking, never a large "terminal" headline. |

Scale: hero `clamp(6rem, 22vw, 22rem)`, section headings `clamp(2.5rem, 6vw, 5.5rem)`, body 16 to 18px, mono labels 12 to 13px with at most 0.08em tracking. Body line length 60 to 70 characters.

Geist and JetBrains Mono appear on antislop's "common AI default" list (R-06). The owner chose them explicitly, so they stay. The reason is written above.

## Shape

Mixed radius, as specified: pill (9999px) for buttons and tags, 4px for cards and project images, 0px for the portrait frame and all section lines. Pills are not allowed on cards, inputs or images, so R-11 holds.

## Identity motif

Two repeated gestures:
1. Section index in teal mono, `01 / 07`, sitting on a 0px hairline that spans the content width.
2. The `/` separator: top nav links, breadcrumb-like labels, and the `</>` glyph in the hero. Slash is the typographic voice.

## Motion principles

- Tokens: durations 200 / 400 / 700ms only. Ease set: `power3.out` for entrances, `power2.inOut` for transitions, `expo.out` for kinetic type. Exits run at about 65% of the entrance.
- One signature motion per section:
  - Hero: kinetic NJOEL letter reveal, plus three floating 3D objects (the </> glyph, a gamepad, a racing helmet) in one canvas with scroll parallax at three depths.
  - About: portrait grayscale to color.
  - Stack: logos-only marquee.
  - Projects: a sticky stage, one project per scroll step, clip-reveal on a CSS 3D mockup with staggered text and a segmented progress line. Below 768px an accordion. Reduced motion: plain stacked blocks.
  - Experience: scroll-driven step reveal on the timeline.
  - GitHub: heatmap cells reveal once.
  - CTA/Footer: magnetic buttons and parallax footer reveal.
- Preloader: "Initialising..." overlay on top of already-rendered content, under about 1.2s, skippable, once per session. It does not gate LCP.
- Lenis smooth scroll with GSAP ScrollTrigger. No scroll-jacking: native scroll, keyboard and the back button always work.
- Everything respects `prefers-reduced-motion`: Lenis off, marquee static, parallax off, 3D replaced by a static glyph, final states shown immediately.
- Animate transform and opacity only.

## Layout principles

- Generous negative space. Section vertical padding is large and not identical across sections.
- Content max width about 1200px, hero and footer allowed to bleed.
- Top nav on desktop. Below 768px a bottom dock with icon and label, 44px targets.
- One focal point per screen.

## Icons

One set only: Phosphor (regular weight). It has the brand marks needed for LinkedIn, Instagram and GitHub, plus the dock glyphs, in one visual language. Not Lucide, not sparkle or star glyphs. Icons only where they carry meaning: dock items, social links, copy action.

## Imagery

- Portrait: the real photo, grayscale to color, 0px corners, 1px line border.
- Project screenshots: one per project, shown unmodified inside a CSS mockup (laptop) or as a tilted plane when the image already has a phone bezel or browser chrome.
- No stock images, no generated faces, no illustrations, no decorative imagery.
- Logo and favicon: a plain NJOEL wordmark set in Bricolage Grotesque.

## What to avoid

- Gradients of any kind, glow, glassmorphism, blurred orbs.
- Dense multi-color follow.art chaos. Only its oversized type and the single 3D object are borrowed.
- Cloning titangatequity.com or osmo.supply. Principles only, no layouts or copy.
- Background grids, dot patterns, noise overlays.
- Eyebrow pills above the H1, "New" or "Beta" badges, sparkle icons.
- Arrow glyphs on every button.
- Hype words (cutting-edge, seamless, passionate), emoji bullets, invented stats, testimonials, fake percentages or "years of experience".
- Card grids with identical content patterns in every section.
- Copy beyond what the owner supplied. Any gap is a short placeholder marked `TODO`.
- Em dashes in any UI text.
- Skeleton blocks or fake screens used as product shots.

## Copy rules

English only, kept in `/data` so a second language can be added. Plain, specific, first person. Owner-supplied text is used verbatim.

## Decision log (R-31, one line each)

- Dark only: cinematic mood, developer audience, OLED-friendly.
- Teal accent: owner's identity color, used for numbers, CTAs, active states, 3D glyph, heatmap.
- Bricolage Grotesque for display: character at large sizes.
- Mono for labels: signals data and index, kept small.
- Marquee in Stack: shows the stack at a glance without percentage bars.
- Pinned stage in Projects: one project at a time lets each mockup lead, with no overlay or new page.
- Stepped timeline: Osmo-style, handles overlapping periods as parallel items.
- Bottom dock under 768px: one-thumb navigation, 44px targets.
- Phosphor icons: one set with brand marks, no library-default look.
- Parallax footer: closes the narrative, off for reduced motion.
