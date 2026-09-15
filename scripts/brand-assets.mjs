/**
 * Derives favicon / apple icon / OG image from the brand PNGs and the fleet
 * photo. Run after changing either: node scripts/brand-assets.mjs
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P = (...p) => path.join(ROOT, ...p);

// Apple touch icon: brand mark on the base color, 180px.
const mark = await sharp(P("public/brand/apex-icon-on-dark-1024.png")).resize(132, 132).toBuffer();
await sharp({ create: { width: 180, height: 180, channels: 4, background: "#07090d" } })
  .composite([{ input: mark, left: 24, top: 24 }])
  .png()
  .toFile(P("src/app/apple-icon.png"));

// favicon.ico: a 32px PNG wrapped in an ICO container (valid per the spec).
const png32 = await sharp({ create: { width: 32, height: 32, channels: 4, background: "#07090d" } })
  .composite([{ input: await sharp(P("public/brand/apex-icon-on-dark-1024.png")).resize(24, 24).toBuffer(), left: 4, top: 4 }])
  .png()
  .toBuffer();
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
const entry = Buffer.alloc(16);
entry.writeUInt8(32, 0); entry.writeUInt8(32, 1); entry.writeUInt8(0, 2); entry.writeUInt8(0, 3);
entry.writeUInt16LE(1, 4); entry.writeUInt16LE(32, 6); entry.writeUInt32LE(png32.length, 8); entry.writeUInt32LE(22, 12);
await writeFile(P("src/app/favicon.ico"), Buffer.concat([header, entry, png32]));

// OG image 1200×630: side profile of unit 15 (scripts/photos.mjs) with the
// wordmark, tagline and phone in a dark band over the floor reflections, so
// nothing overlaps the truck. Source is 1536×1024 → 1200×800, cropped to the
// band where the truck sits.
const bg = await sharp(P("public/images/fleet-side-profile.jpg")).resize(1200, 800).extract({ left: 0, top: 170, width: 1200, height: 630 }).toBuffer();
const wordmark = await sharp(P("public/brand/apex-wordmark-on-dark-1200h.png")).resize({ height: 80 }).toBuffer();
const overlay = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0.58" stop-color="#07090d" stop-opacity="0"/><stop offset="0.8" stop-color="#07090d" stop-opacity="0.82"/><stop offset="1" stop-color="#07090d" stop-opacity="0.96"/></linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="300" y="500" width="2" height="76" fill="#ff6b1a"/>
  <text x="326" y="526" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="700" fill="#ff6b1a" letter-spacing="3">24/7 MOBILE TRUCK TIRE SERVICE · INLAND EMPIRE</text>
  <text x="326" y="568" font-family="Helvetica, Arial, sans-serif" font-size="36" font-weight="700" fill="#f2f5f8">(877) 512-0301<tspan font-size="24" font-weight="400" fill="#c5cfda"> · Roadside · Sales · Installation · Bloomington, CA</tspan></text>
</svg>`);
await sharp(bg).composite([{ input: overlay, left: 0, top: 0 }, { input: wordmark, left: 72, top: 498 }]).png({ quality: 90 }).toFile(P("public/og-fleet.png"));
console.log("wrote apple-icon.png, favicon.ico, og-fleet.png");
