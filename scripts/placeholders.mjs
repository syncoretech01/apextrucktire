/**
 * Generates intentional-looking dark placeholder imagery for sections that
 * need photography. Swap the outputs for real photos (README → Swap points).
 *   node scripts/placeholders.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function svg({ w, h, glowX, glowY, label, hue = "#ff6b1a" }) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="base" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#12171f"/><stop offset="1" stop-color="#07090d"/>
    </linearGradient>
    <radialGradient id="glow" cx="${glowX}" cy="${glowY}" r="0.55">
      <stop offset="0" stop-color="${hue}" stop-opacity="0.32"/>
      <stop offset="0.5" stop-color="${hue}" stop-opacity="0.06"/>
      <stop offset="1" stop-color="${hue}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="cold" cx="${1 - glowX}" cy="${1 - glowY}" r="0.6">
      <stop offset="0" stop-color="#8fa3b8" stop-opacity="0.14"/><stop offset="1" stop-color="#8fa3b8" stop-opacity="0"/>
    </radialGradient>
    <pattern id="tread" width="46" height="46" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
      <rect x="0" y="0" width="26" height="46" fill="#ffffff" fill-opacity="0.028"/>
    </pattern>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.06 0"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#base)"/>
  <rect width="100%" height="100%" fill="url(#tread)"/>
  <rect width="100%" height="100%" fill="url(#cold)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <rect width="100%" height="100%" filter="url(#grain)"/>
  <text x="${w - 28}" y="${h - 22}" text-anchor="end" font-family="Menlo, monospace" font-size="18" fill="#8fa3b8" fill-opacity="0.55" letter-spacing="2">PLACEHOLDER · ${label}</text>
</svg>`;
}

const out = path.join(ROOT, "public/images");
await mkdir(path.join(out, "services"), { recursive: true });
await mkdir(path.join(out, "why"), { recursive: true });

const jobs = [
  ["services/roadside.jpg", { w: 1600, h: 1100, glowX: 0.25, glowY: 0.7, label: "ROADSIDE PHOTO 16:11" }],
  ["services/sales.jpg", { w: 1600, h: 1100, glowX: 0.75, glowY: 0.35, label: "TIRE STOCK PHOTO 16:11" }],
  ["services/install.jpg", { w: 1600, h: 1100, glowX: 0.5, glowY: 0.85, label: "INSTALL PHOTO 16:11" }],
  ["why/yard.jpg", { w: 1200, h: 1500, glowX: 0.4, glowY: 0.2, label: "YARD PHOTO 4:5" }],
  ["why/truck.jpg", { w: 1600, h: 1000, glowX: 0.7, glowY: 0.6, label: "SERVICE TRUCK 16:10" }],
  ["why/detail.jpg", { w: 1000, h: 1000, glowX: 0.5, glowY: 0.5, label: "DETAIL 1:1", hue: "#8fa3b8" }],
];
for (const [file, opts] of jobs) {
  await sharp(Buffer.from(svg(opts))).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(out, file));
  console.log("wrote", file);
}
