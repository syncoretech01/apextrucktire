/**
 * Renders the hero poster images and the lite-tier image sequence from the
 * live procedural scene, so the static assets match the WebGL hero exactly.
 *
 * Usage:  pnpm dev   (in another terminal, on port 3600)
 *         pnpm render:hero [--base http://localhost:3600] [--frames 32] [--only portrait]
 *
 * Output: public/images/hero-poster-{exploded,assembled}-{landscape,portrait}.jpg
 *         public/hero-seq/{landscape,portrait}/NN.webp
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = Object.fromEntries(
  process.argv.slice(2).map((a, i, arr) => (a.startsWith("--") ? [a.slice(2), arr[i + 1] ?? "true"] : [])).filter((x) => x.length),
);
const BASE = args.base ?? "http://localhost:3600";
const FRAMES = Number(args.frames ?? 32);
const ONLY = args.only; // "landscape" | "portrait" | undefined
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const POSTERS = {
  landscape: { width: 1920, height: 1080 },
  portrait: { width: 1080, height: 1920 },
};
const SEQ = {
  landscape: { width: 1280, height: 720 },
  portrait: { width: 720, height: 1280 },
};

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--use-angle=metal", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});

async function capture(page, explode) {
  await page.goto(`${BASE}/hero-render?explode=${explode}`, { waitUntil: "networkidle" });
  await page.waitForSelector('[data-render-ready="1"]', { timeout: 60000 });
  await page.waitForTimeout(250);
  return page.screenshot({ type: "png" });
}

for (const [orientation, size] of Object.entries(POSTERS)) {
  if (ONLY && ONLY !== orientation) continue;
  const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
  for (const [variant, explode] of [["exploded", 1], ["assembled", 0]]) {
    const png = await capture(page, explode);
    const out = path.join(ROOT, "public/images", `hero-poster-${variant}-${orientation}.jpg`);
    await mkdir(path.dirname(out), { recursive: true });
    await sharp(png).jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: "4:4:4" }).toFile(out);
    console.log("poster", variant, orientation, "→", path.relative(ROOT, out));
  }
  await page.close();
}

for (const [orientation, size] of Object.entries(SEQ)) {
  if (ONLY && ONLY !== orientation) continue;
  const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
  const dir = path.join(ROOT, "public/hero-seq", orientation);
  await mkdir(dir, { recursive: true });
  for (let i = 0; i < FRAMES; i++) {
    const explode = i / (FRAMES - 1);
    const png = await capture(page, explode.toFixed(4));
    const out = path.join(dir, `${String(i).padStart(2, "0")}.webp`);
    await sharp(png).webp({ quality: 74, effort: 6 }).toFile(out);
    process.stdout.write(`\rsequence ${orientation} ${i + 1}/${FRAMES}`);
  }
  process.stdout.write("\n");
  await page.close();
}

await browser.close();
console.log("done");
