// Runs before `next build`. Stops the build when a project's frame.webp no longer matches its
// cover.webp (the owner replaced a cover) or the manifest lists the wrong size.
import sharp from "sharp";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const MESSAGE =
  "cover.webp changed or frame.webp is stale: run npm run assets, then commit public/ and data/image-manifest.json";

const manifest = JSON.parse(await fs.readFile(path.join(root, "data", "image-manifest.json"), "utf8"));
const { projects } = await import("../data/projects.ts");

const problems = [];
for (const { slug } of projects) {
  const dir = path.join(root, "public", "projects", slug);
  const entry = manifest[slug];
  if (!entry || entry.src !== `/projects/${slug}/frame.webp`) {
    problems.push(`${slug}: manifest entry missing or not pointing to frame.webp`);
    continue;
  }
  let frame;
  let cover;
  try {
    frame = await fs.readFile(path.join(dir, "frame.webp"));
  } catch {
    problems.push(`${slug}: frame.webp is missing`);
    continue;
  }
  try {
    cover = await fs.readFile(path.join(dir, "cover.webp"));
  } catch {
    problems.push(`${slug}: cover.webp is missing`);
    continue;
  }
  const meta = await sharp(frame).metadata();
  if (meta.width !== entry.width || meta.height !== entry.height) {
    problems.push(`${slug}: frame.webp is ${meta.width}x${meta.height}, manifest says ${entry.width}x${entry.height}`);
  }
  const hash = crypto.createHash("sha1").update(cover).digest("hex");
  if (hash !== entry.sourceHash) problems.push(`${slug}: cover.webp hash does not match sourceHash`);
}

if (problems.length) {
  for (const p of problems) console.error(`  - ${p}`);
  console.error(MESSAGE);
  process.exit(1);
}
console.log(`check-assets: ${projects.length} project frames up to date`);
