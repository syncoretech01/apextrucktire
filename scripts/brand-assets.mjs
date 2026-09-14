/**
 * Derives favicon / apple icon / OG image from the brand PNGs and the hero
 * poster. Run after re-rendering the hero: node scripts/brand-assets.mjs
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

// OG image 1200×630: exploded poster + gradient + wordmark + tagline.
// Crop toward the right so the wordmark gets clean dark space on the left.
const bg = await sharp(P("public/images/hero-poster-exploded-landscape.jpg")).resize(1460, 820, { fit: "cover" }).extract({ left: 0, top: 110, width: 1200, height: 630 }).toBuffer();
const wordmark = await sharp(P("public/brand/apex-wordmark-on-dark-1200h.png")).resize({ height: 150 }).toBuffer();
const overlay = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0.35" stop-color="#07090d" stop-opacity="0"/><stop offset="1" stop-color="#07090d" stop-opacity="0.92"/></linearGradient>
    <linearGradient id="h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#07090d" stop-opacity="0.95"/><stop offset="0.42" stop-color="#07090d" stop-opacity="0.7"/><stop offset="0.7" stop-color="#07090d" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#h)"/>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="72" y="452" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="700" fill="#ff6b1a" letter-spacing="4">24/7 MOBILE TRUCK TIRE SERVICE · INLAND EMPIRE</text>
  <text x="72" y="500" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="#c5cfda">Roadside · Tire sales · On-site installation · Bloomington, CA</text>
  <text x="72" y="560" font-family="Helvetica, Arial, sans-serif" font-size="40" font-weight="700" fill="#f2f5f8">(877) 512-0301</text>
</svg>`);
await sharp(bg).composite([{ input: overlay, left: 0, top: 0 }, { input: wordmark, left: 72, top: 268 }]).png({ quality: 90 }).toFile(P("public/og.png"));
console.log("wrote apple-icon.png, favicon.ico, og.png");
