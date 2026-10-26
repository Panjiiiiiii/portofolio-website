/** Canonical site URL. Set NEXT_PUBLIC_SITE_URL when a real domain exists. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
  /\/+$/,
  "",
);
