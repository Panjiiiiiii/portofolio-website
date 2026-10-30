// Runs before `next build`. Stops the build when a project's frame.webp no longer matches its
// cover (the owner replaced a cover), the manifest lists the wrong size, or the frame kind changed.
import sharp from "sharp";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const FIX = "npm run assets";
const MESSAGE = `cover changed or frame.webp is stale: run \`${FIX}\`, then commit public/ and data/image-manifest.json`;

const manifest = JSON.parse(await fs.readFile(path.join(root, "data", "image-manifest.json"), "utf8"));
const { projects } = await import("../data/projects.ts");
const { FRAME_SIZE } = await import("../data/frames.ts");

const size = (w, h) => (w && h ? `${w}x${h}` : "none");
const failures = [];

for (const project of projects) {
  const { slug } = project;
  const dir = path.join(root, "public", "projects", slug);
  const entry = manifest[slug];
  const expected = FRAME_SIZE[project.frame];
  const problems = [];
  let real = null;

  if (!expected) problems.push(`unknown frame "${project.frame}" (see data/frames.ts)`);
  if (!entry || entry.src !== `/projects/${slug}/frame.webp`) {
    problems.push("manifest entry missing or not pointing to frame.webp");
  }

  try {
    const meta = await sharp(await fs.readFile(path.join(dir, "frame.webp"))).metadata();
    real = { width: meta.width, height: meta.height };
  } catch {
    problems.push("frame.webp is missing");
  }

  if (entry) {
    // The source the manifest was built from (cover.webp, cover.png or cover.jpg).
    const coverName = entry.source ?? "cover.webp";
    try {
      const cover = await fs.readFile(path.join(dir, coverName));
      const hash = crypto.createHash("sha1").update(cover).digest("hex");
      if (hash !== entry.sourceHash) problems.push(`${coverName} hash does not match sourceHash (the cover was replaced)`);
    } catch {
      problems.push(`${coverName} is missing`);
    }
    // A different cover format added next to it would be picked first by the pipeline.
    for (const name of ["cover.webp", "cover.png", "cover.jpg"]) {
      if (name === coverName) break;
      try {
        await fs.access(path.join(dir, name));
        problems.push(`${name} exists but the manifest was built from ${coverName}`);
      } catch {}
    }
    if (entry.frame && entry.frame !== project.frame) {
      problems.push(`frame kind is "${project.frame}" in data/projects.ts but the manifest was built for "${entry.frame}"`);
    }
  }

  if (expected && entry && (entry.width !== expected.width || entry.height !== expected.height)) {
    problems.push(`manifest size does not match the ${project.frame} frame`);
  }
  if (real && entry && (real.width !== entry.width || real.height !== entry.height)) {
    problems.push("frame.webp size does not match the manifest");
  }

  if (problems.length) failures.push({ slug, frame: project.frame, expected, entry, real, problems });
}

if (failures.length) {
  console.error("check-assets: project frames are out of date\n");
  for (const f of failures) {
    console.error(`  ${f.slug} (${f.frame})`);
    console.error(`    expected size: ${f.expected ? size(f.expected.width, f.expected.height) : "unknown frame"}`);
    console.error(`    manifest size: ${f.entry ? size(f.entry.width, f.entry.height) : "no entry"}`);
    console.error(`    real size:     ${f.real ? size(f.real.width, f.real.height) : "frame.webp missing"}`);
    for (const p of f.problems) console.error(`    - ${p}`);
    console.error(`    fix: ${FIX}\n`);
  }
  console.error(MESSAGE);
  process.exit(1);
}
console.log(`check-assets: ${projects.length} project frames up to date`);
