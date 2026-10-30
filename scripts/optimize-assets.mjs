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

// Frame, focusX/focusY and trim come from data/projects.ts (Node strips the TypeScript types on import).
const { projects } = await import("../data/projects.ts");

// Output size per frame kind: one table in data/frames.ts, shared with check-assets and the components.
const { FRAME_SIZE } = await import("../data/frames.ts");
// WebP quality per frame kind. The monitor output is larger, so it is encoded a little lower.
const FRAME_QUALITY = { laptop: 82, phone: 82, monitor: 80 };

// The owner's source, one per project folder. The first one found is used.
const COVER_NAMES = ["cover.webp", "cover.png", "cover.jpg"];

async function findCover(slug) {
  for (const name of COVER_NAMES) {
    try {
      await fs.access(out("projects", slug, name));
      return name;
    } catch {}
  }
  return null;
}

// Every project must have a cover. Check all of them before writing anything.
const covers = {};
const missing = [];
for (const p of projects) {
  const name = await findCover(p.slug);
  if (name) covers[p.slug] = name;
  else missing.push(p.slug);
}
if (missing.length) {
  console.error(
    `ERROR: missing public/projects/<slug>/${COVER_NAMES.join(" | ")} for: ${missing.join(", ")}`,
  );
  process.exit(1);
}

const clampPct = (v, fallback) => Math.min(100, Math.max(0, v ?? fallback));
const report = [];

for (const project of projects) {
  const { slug } = project;
  const coverName = covers[slug];
  const source = await fs.readFile(out("projects", slug, coverName)); // read only, never written
  const meta = await sharp(source).rotate().metadata();
  const turned = (meta.orientation ?? 1) >= 5;
  const fullW = turned ? meta.height : meta.width;
  const fullH = turned ? meta.width : meta.height;

  const frame = project.frame ?? "laptop";
  if (!FRAME_SIZE[frame]) throw new Error(`${slug}: unknown frame "${frame}" (see data/frames.ts)`);
  const { width: W, height: H } = FRAME_SIZE[frame];
  const focusX = clampPct(project.focusX, 50);
  const focusY = clampPct(project.focusY, 0);
  const t = {
    top: Math.max(0, project.trim?.top ?? 0),
    bottom: Math.max(0, project.trim?.bottom ?? 0),
    left: Math.max(0, project.trim?.left ?? 0),
    right: Math.max(0, project.trim?.right ?? 0),
  };

  // 1) Trim browser and OS chrome (pixels of the source) before anything is scaled.
  const srcW = fullW - t.left - t.right;
  const srcH = fullH - t.top - t.bottom;
  if (srcW <= 0 || srcH <= 0) throw new Error(`${slug}: trim removes the whole image`);
  let pipeline = sharp(source).rotate();
  const trimmed = t.top || t.bottom || t.left || t.right;
  if (trimmed) pipeline = pipeline.extract({ left: t.left, top: t.top, width: srcW, height: srcH });

  // 2) Fit the frame.
  const ratioDiff = Math.abs(srcW / srcH / (W / H) - 1);
  let method;
  let visibleW;
  let visibleH;
  if (ratioDiff <= 0.01) {
    // Same shape as the frame (within 1%): resize only, no crop.
    pipeline = pipeline.resize(W, H, { fit: "fill" });
    method = "resize only (ratio within 1%)";
    visibleW = 100;
    visibleH = 100;
  } else {
    // Scale so the image covers the frame, then cut the window at focusX / focusY.
    const scale = Math.max(W / srcW, H / srcH);
    const sw = Math.round(srcW * scale);
    const sh = Math.round(srcH * scale);
    const left = Math.round(((sw - W) * focusX) / 100);
    const top = Math.round(((sh - H) * focusY) / 100);
    pipeline = pipeline.resize(sw, sh).extract({ left, top, width: W, height: H });
    visibleW = (W / sw) * 100;
    visibleH = (H / sh) * 100;
    method =
      sw > W
        ? `cover, sides cut at focusX ${focusX} (left ${left}px)`
        : `cover, window at focusY ${focusY} (top ${top}px)`;
  }

  const info = await writeWebp(pipeline, out("projects", slug, "frame.webp"), FRAME_QUALITY[frame] ?? 82);
  manifest[slug] = {
    src: `/projects/${slug}/frame.webp`,
    ...info,
    frame,
    source: coverName,
    sourceHash: sha1(source),
  };
  const upscale = Math.max(W / srcW, H / srcH);
  report.push({
    slug,
    frame,
    source: `${fullW}x${fullH}`,
    trim: trimmed ? `t${t.top} b${t.bottom} l${t.left} r${t.right}` : "none",
    trimmed: `${srcW}x${srcH}`,
    output: `${info.width}x${info.height}`,
    "width visible": `${visibleW.toFixed(1)}%`,
    "height visible": `${visibleH.toFixed(1)}%`,
    method,
    resolution: upscale > 1.001 ? `LOW RESOLUTION (upscaled ${upscale.toFixed(2)}x), please retake` : "ok",
  });
}
console.table(report);
await fs.mkdir(path.join(root, "data"), { recursive: true });
await fs.writeFile(path.join(root, "data", "image-manifest.json"), JSON.stringify(manifest, null, 2));
console.log("manifest written");
