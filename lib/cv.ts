// Server only: checks at build time whether the CV is in /public, so the hero never ships a dead link.
import fs from "node:fs";
import path from "node:path";
import { CV_FILE } from "./cv-name";

/** URL-encoded href to the CV, or null when the file is missing. */
export function getCvHref(): string | null {
  const file = path.join(process.cwd(), "public", "cv", CV_FILE);
  return fs.existsSync(file) ? `/cv/${encodeURIComponent(CV_FILE)}` : null;
}
