// Reads raw files from /assets, writes optimized WebP into /public and
// a manifest (dimensions + tiny blur placeholders) into /data/image-manifest.json.
// Screenshots are only resized and re-encoded. Content is never edited.
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const out = (...p) => path.join(root, "public", ...p);

// One screenshot per project. slug -> { folder under assets/project-galery, file }.
// To change the picture a project uses, change `file` and run `npm run assets`.
const projectImages = {
  "w-spread": { folder: "w-spread-app", file: "2.png" },
  "sugar-measurer": { folder: "sugar-measurer-website", file: "1.png" },
  "sidigs-app": { folder: "sidigs-app", file: "3.png" },
  "sme-website": { folder: "smes-website", file: "1.png" },
  "ukk-exam-website": { folder: "exam-website", file: "1.png" },
};

const MAX_WIDTH = 1920;
const manifest = {};

async function blur(buf) {
  const tiny = await sharp(buf).resize(16).webp({ quality: 40 }).toBuffer();
  return `data:image/webp;base64,${tiny.toString("base64")}`;
}

async function writeWebp(pipeline, dest, quality) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  const buf = await pipeline.webp({ quality, effort: 6 }).toBuffer();
  await fs.writeFile(dest, buf);
  const meta = await sharp(buf).metadata();
  return { width: meta.width, height: meta.height, blur: await blur(buf) };
}

// Portrait: 4:5 crop around the face. Source is 3024x4032.
const photoSrc = path.join(root, "assets", "photo-personal.jpeg");
try {
  await fs.access(photoSrc);
  // The card holder's badge starts near y=2500, so the crop stops at y=2380 with margin.
  const crop = { left: 1032, top: 1300, width: 864, height: 1080 };
  const pipeline = sharp(photoSrc)
    .rotate()
    .extract(crop)
    .resize(1000, 1250, { fit: "cover" });
  manifest["portrait"] = {
    src: "/images/njoel-portrait.webp",
    ...(await writeWebp(pipeline, out("images", "njoel-portrait.webp"), 82)),
  };
  console.log("portrait ok");
} catch {
  console.warn("MISSING: assets/photo-personal.jpeg (a placeholder will render)");
}

// Start clean so only the chosen screenshots stay in /public/projects.
await fs.rm(out("projects"), { recursive: true, force: true });

for (const [slug, { folder, file }] of Object.entries(projectImages)) {
  const src = path.join(root, "assets", "project-galery", folder, file);
  try {
    await fs.access(src);
  } catch {
    console.warn(`MISSING: ${src}`);
    continue;
  }
  const img = sharp(src).rotate();
  const { width } = await img.metadata();
  const pipeline = width > MAX_WIDTH ? img.resize({ width: MAX_WIDTH }) : img;
  const info = await writeWebp(pipeline, out("projects", slug, "cover.webp"), 90);
  manifest[slug] = { src: `/projects/${slug}/cover.webp`, ...info };
  console.log(slug, `${info.width}x${info.height}`);
}

await fs.mkdir(path.join(root, "data"), { recursive: true });
await fs.writeFile(
  path.join(root, "data", "image-manifest.json"),
  JSON.stringify(manifest, null, 2),
);
console.log("manifest written");
