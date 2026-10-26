// Reads raw files from /assets, writes optimized WebP into /public and
// a manifest (dimensions + tiny blur placeholders) into /data/image-manifest.json.
// Screenshots are only resized and re-encoded. Content is never edited.
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const out = (...p) => path.join(root, "public", ...p);

// Asset folder name -> project slug used in /data/projects.ts
const projectFolders = {
  "w-spread-app": "w-spread",
  "sugar-measurer-website": "sugar-measurer",
  "sidigs-app": "sidigs-app",
  "smes-website": "sme-website",
  "exam-website": "ukk-exam-website",
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
  // 4:5 crop that ends above chest level, so the lanyard ID card (starts near y=2590) is outside it.
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

for (const [folder, slug] of Object.entries(projectFolders)) {
  const dir = path.join(root, "assets", "project-galery", folder);
  let files = [];
  try {
    files = (await fs.readdir(dir))
      .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
      .sort((a, b) => parseInt(a) - parseInt(b));
  } catch {
    console.warn(`MISSING: ${dir}`);
    continue;
  }
  manifest[slug] = [];
  let i = 1;
  for (const f of files) {
    const name = String(i).padStart(2, "0") + ".webp";
    const img = sharp(path.join(dir, f)).rotate();
    const { width } = await img.metadata();
    const pipeline = width > MAX_WIDTH ? img.resize({ width: MAX_WIDTH }) : img;
    const info = await writeWebp(pipeline, out("projects", slug, name), 84);
    manifest[slug].push({ src: `/projects/${slug}/${name}`, ...info });
    i++;
  }
  console.log(slug, files.length, "files");
}

await fs.mkdir(path.join(root, "data"), { recursive: true });
await fs.writeFile(
  path.join(root, "data", "image-manifest.json"),
  JSON.stringify(manifest, null, 2),
);
console.log("manifest written");
