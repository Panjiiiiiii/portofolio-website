// Reads raw files from /assets, writes optimized WebP into /public and
// a manifest (dimensions + tiny blur placeholders) into /data/image-manifest.json.
// Screenshots are resized, cropped to their device frame and re-encoded. Pixels are never edited,
// and nothing in /assets is ever modified.
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

// CV: copied byte for byte (never edited or re-encoded). The hero shows the button only if it exists.
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

// Start clean so only the chosen screenshots stay in /public/projects.
await fs.rm(out("projects"), { recursive: true, force: true });

// Frame and focusY come from data/projects.ts (Node strips the TypeScript types on import).
const { projects } = await import("../data/projects.ts");

// Output size per frame kind. The screen of every frame of a kind has exactly this ratio.
const FRAME_SIZE = {
  laptop: { width: 1440, height: 1024 },
  phone: { width: 824, height: 1830 }, // 2x of a 412 x 915 Android screen
};

const report = [];

for (const [slug, { folder, file }] of Object.entries(projectImages)) {
  const src = path.join(root, "assets", "project-galery", folder, file);
  try {
    await fs.access(src);
  } catch {
    console.warn(`MISSING: ${src}`);
    continue;
  }
  const project = projects.find((p) => p.slug === slug);
  const frame = project?.frame ?? "laptop";
  const focusY = Math.min(100, Math.max(0, project?.focusY ?? 0));
  const { width: W, height: H } = FRAME_SIZE[frame];

  const meta = await sharp(src).rotate().metadata();
  const scaledH = Math.round((meta.height * W) / meta.width);
  let pipeline;
  let method;
  let keptPct;
  if (scaledH >= H) {
    // Scale to the frame width, then cut a frame-tall window at focusY (0 = top, 100 = bottom).
    const top = Math.round(((scaledH - H) * focusY) / 100);
    pipeline = sharp(src).rotate().resize({ width: W }).extract({ left: 0, top, width: W, height: H });
    method = `window at focusY ${focusY} (top ${top}px)`;
    keptPct = (H / scaledH) * 100;
  } else {
    // Too short for a window: fill the frame and crop the sides evenly.
    pipeline = sharp(src).rotate().resize(W, H, { fit: "cover", position: "centre" });
    method = "center crop (cover)";
    const scaledW = (meta.width * H) / meta.height;
    keptPct = (W / scaledW) * 100;
  }

  const info = await writeWebp(pipeline, out("projects", slug, "cover.webp"), 82);
  manifest[slug] = { src: `/projects/${slug}/cover.webp`, ...info };
  report.push({
    slug,
    frame,
    source: `${meta.width}x${meta.height}`,
    output: `${info.width}x${info.height}`,
    cropped: `${(100 - keptPct).toFixed(1)}% removed`,
    method,
    upscaled: meta.width < W ? "yes, low resolution, please retake" : "no",
  });
}
console.table(report);

await fs.mkdir(path.join(root, "data"), { recursive: true });
await fs.writeFile(
  path.join(root, "data", "image-manifest.json"),
  JSON.stringify(manifest, null, 2),
);
console.log("manifest written");
