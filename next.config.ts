import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optional: lets a test build use its own folder so it never collides with a running `next dev`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [375, 640, 768, 1024, 1440, 1920],
  },
};
export default nextConfig;
