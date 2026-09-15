/**
 * Crops and exports the section photography from the full-size generated
 * images in ../generated-images (kept out of the repo's public/ folder).
 * Re-run after replacing any source image:
 *   node scripts/photos.mjs
 *
 * Fixed-aspect slots (why/*) are pre-cropped here. The three service panels
 * stay 3:2 because their desktop container is fluid — their focal point is
 * set with `image.position` in lib/content.ts instead.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "..", "generated-images");
const OUT = path.join(ROOT, "public", "images");

/** { src, out, crop?: { left, top, width, height } } — sources are 1536×1024. */
const PHOTOS = [
  // Service panels — full frame, 3:2
  { src: "06-tech-trailer-dual-roadside.png", out: "services/roadside-trailer-dual.jpg" },
  { src: "10-tech-rolling-tire-compartments-open.png", out: "services/sales-tire-stock.jpg" },
  { src: "04-tech-impact-front-wheel.png", out: "services/install-shop-bay.jpg" },

  // Why Apex grid — fixed aspects
  { src: "05-tech-rolling-tire-yard-dusk.png", out: "why/yard-dusk.jpg", crop: { left: 60, top: 0, width: 819, height: 1024 } }, // 4:5
  { src: "02-front-quarter-bay-lit.png", out: "why/truck-unit15.jpg", crop: { left: 0, top: 48, width: 1536, height: 960 } }, // 16:10
  { src: "09-rear-quarter-tires-loaded.png", out: "why/detail-compartments.jpg", crop: { left: 380, top: 0, width: 1024, height: 1024 } }, // 1:1

  // Source for the OG image (scripts/brand-assets.mjs)
  { src: "01-side-profile-warehouse.png", out: "fleet-side-profile.jpg" },
];

for (const p of PHOTOS) {
  const file = path.join(OUT, p.out);
  await mkdir(path.dirname(file), { recursive: true });
  let img = sharp(path.join(SRC, p.src));
  if (p.crop) img = img.extract(p.crop);
  const info = await img.jpeg({ quality: 82, mozjpeg: true }).toFile(file);
  console.log(`${p.out.padEnd(28)} ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} kB`);
}
