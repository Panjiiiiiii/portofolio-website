/**
 * Canonical site URL, used for metadataBase, canonical, Open Graph, sitemap, robots and JSON-LD.
 * NEXT_PUBLIC_SITE_URL wins when set. Without it, production builds use the live domain and
 * only development falls back to localhost.
 */
const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const fallback =
  process.env.NODE_ENV === "production" ? "https://njoel.my.id" : "http://localhost:3000";

export const siteUrl = (fromEnv || fallback).replace(/\/+$/, "");
