// Builds the site's images and writes /data/image-manifest.json (sizes, blur placeholders, hashes).
//
// Sources:
//  - Portrait: assets/photo-personal.jpeg -> public/images/njoel-portrait.webp
//  - CV:       assets/cv/...              -> public/cv/ (copied byte for byte)
//  - Projects: public/projects/<slug>/cover.webp is the SOURCE OF TRUTH, placed by the owner.
//              It is only ever read. The cropped result goes to frame.webp in the same folder.
//
// Pixels are never edited: images are only trimmed, scaled, cropped to their device frame and
// re-encoded. Nothing in /assets is modified, and cover.webp is never deleted or overwritten.
import sharp from "sharp";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const out = (...p) => path.join(root, "public", ...p);
const sha1 = (buf) => crypto.createHash("sha1").update(buf).digest("hex");

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

/* ---------- Portrait ---------- */

// 4:5 window defined in percent, so it works for any photo size.
// w: window width as % of the source width. x, y: top-left of the window as % of the free space
// (0 = left/top edge, 100 = right/bottom edge). The window is clamped to the image.
const PORTRAIT_CROP = { x: 0, y: 0, w: 100 };

const photoSrc = path.join(root, "assets", "photo-personal.jpeg");
try {
  await fs.access(photoSrc);
  const meta = await sharp(photoSrc).rotate().metadata();
  // .rotate() applies EXIF orientation, so swap the sides for 90/270 degree photos.
  const turned = (meta.orientation ?? 1) >= 5;
  const srcW = turned ? meta.height : meta.width;
  const srcH = turned ? meta.width : meta.height;

  let winW = Math.round((srcW * Math.min(100, Math.max(1, PORTRAIT_CROP.w))) / 100);
  let winH = Math.round((winW * 5) / 4);
  if (winH > srcH) {
    winH = srcH;
    winW = Math.round((winH * 4) / 5);
  }
  const left = Math.round(((srcW - winW) * Math.min(100, Math.max(0, PORTRAIT_CROP.x))) / 100);
  const top = Math.round(((srcH - winH) * Math.min(100, Math.max(0, PORTRAIT_CROP.y))) / 100);

  const pipeline = sharp(photoSrc)
    .rotate()
    .extract({ left, top, width: winW, height: winH })
    .resize(1000, 1250, { fit: "cover" });
  manifest["portrait"] = {
    src: "/images/njoel-portrait.webp",
    ...(await writeWebp(pipeline, out("images", "njoel-portrait.webp"), 82)),
  };
  const kept = ((winW * winH) / (srcW * srcH)) * 100;
  console.log(
    `portrait: source ${srcW}x${srcH}, window ${winW}x${winH} at (${left}, ${top}), ${kept.toFixed(1)}% of the image kept`,
  );
} catch (err) {
  if (err?.code === "ENOENT") console.warn("MISSING: assets/photo-personal.jpeg (a placeholder will render)");
  else throw err;
}

/* ---------- CV ---------- */

// Copied byte for byte (never edited or re-encoded). The hero shows the button only if it exists.
const CV_FILE = "CV ATS Panji Putra Ardian.pdf";
const cvCandidates = [
  path.join(root, "assets", "cv", `${CV_FILE}.pdf`),
  path.join(root, "assets", "cv", CV_FILE),
];
let cvSrc = null;
for (const c of cvCandidates) {
  try {
    await fs.access(c);
    cvSrc = c;
    break;
  } catch {}
}
if (cvSrc) {
  await fs.mkdir(out("cv"), { recursive: true });
  await fs.copyFile(cvSrc, out("cv", CV_FILE));
  console.log("cv copied:", path.relative(root, cvSrc), "->", `public/cv/${CV_FILE}`);
} else {
  console.warn("MISSING: assets/cv/ CV file (the Download CV button will not render)");
}

/* ---------- Project frames ---------- */

// Frame, focusY and trim come from data/projects.ts (Node strips the TypeScript types on import).
const { projects } = await import("../data/projects.ts");

// Output size per frame kind. The screen of every frame of a kind has exactly this ratio.
const FRAME_SIZE = {
  laptop: { width: 1440, height: 1024 },
  phone: { width: 824, height: 1830 }, // 2x of a 412 x 915 Android screen
};

// Every project must have its cover.webp. Check all of them before writing anything.
const missing = [];
for (const p of projects) {
  try {
    await fs.access(out("projects", p.slug, "cover.webp"));
  } catch {
    missing.push(p.slug);
  }
}
if (missing.length) {
  console.error(`ERROR: missing public/projects/<slug>/cover.webp for: ${missing.join(", ")}`);
  process.exit(1);
}

const report = [];

for (const project of projects) {
  const { slug } = project;
  const coverPath = out("projects", slug, "cover.webp");
  const source = await fs.readFile(coverPath); // read only, never written
  const meta = await sharp(source).metadata();

  const frame = project.frame ?? "laptop";
  const focusY = Math.min(100, Math.max(0, project.focusY ?? 0));
  const trimTop = Math.max(0, project.trim?.top ?? 0);
  const trimBottom = Math.max(0, project.trim?.bottom ?? 0);
  const { width: W, height: H } = FRAME_SIZE[frame];

  const srcW = meta.width;
  const srcH = meta.height - trimTop - trimBottom;
  if (srcH <= 0) throw new Error(`${slug}: trim removes the whole image`);

  // Trim browser/OS chrome first (pixels of the source), then scale and crop.
  let pipeline = sharp(source);
  if (trimTop || trimBottom) pipeline = pipeline.extract({ left: 0, top: trimTop, width: srcW, height: srcH });

  const scaledH = Math.round((srcH * W) / srcW);
  let method;
  let keptPct;
  if (scaledH >= H) {
    // Scale to the frame width, then cut a frame-tall window at focusY (0 = top, 100 = bottom).
    const top = Math.round(((scaledH - H) * focusY) / 100);
    pipeline = pipeline.resize({ width: W }).extract({ left: 0, top, width: W, height: H });
    method = `window, focusY ${focusY} (top ${top}px)`;
    keptPct = (H / scaledH) * 100;
  } else {
    // Too short for a window: fill the frame and crop the sides evenly.
    pipeline = pipeline.resize(W, H, { fit: "cover", position: "centre" });
    method = "center crop (cover), image shorter than the frame";
    keptPct = (W / ((srcW * H) / srcH)) * 100;
  }

  const info = await writeWebp(pipeline, out("projects", slug, "frame.webp"), 82);
  manifest[slug] = { src: `/projects/${slug}/frame.webp`, ...info, sourceHash: sha1(source) };
  const removedOfSource = 100 - (keptPct * srcH) / meta.height; // includes the trimmed rows
  report.push({
    slug,
    frame,
    source: `${meta.width}x${meta.height}`,
    trim: trimTop || trimBottom ? `top ${trimTop}, bottom ${trimBottom}` : "none",
    output: `${info.width}x${info.height}`,
    removed: `${removedOfSource.toFixed(1)}%`,
    method,
    resolution: srcW < W ? "LOW RESOLUTION (upscaled), please retake" : "ok",
  });
}
console.table(report);

await fs.mkdir(path.join(root, "data"), { recursive: true });
await fs.writeFile(path.join(root, "data", "image-manifest.json"), JSON.stringify(manifest, null, 2));
console.log("manifest written");
