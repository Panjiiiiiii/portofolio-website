// Single source of truth for device frames. Output pixel size per frame kind.
// Read by scripts/optimize-assets.mjs, scripts/check-assets.mjs and the mockup components.
// The screen of every frame of a kind has exactly this aspect ratio.

export const FRAME_SIZE = {
  laptop: { width: 1440, height: 1024 },
  phone: { width: 824, height: 1830 }, // 2x of a 412 x 915 Android screen
  monitor: { width: 1920, height: 1080 }, // 16:9 desktop monitor
} as const;

export type FrameKind = keyof typeof FRAME_SIZE;
