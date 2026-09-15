/**
 * Pre-renders the responsive WebP variants that next/image serves through
 * the custom loader (src/lib/imageLoader.ts), so no image is resized at
 * request time by Vercel's optimizer (which is metered and returns 402 once
 * the plan's quota is used up — phones were getting no photos at all).
 *
 * Run after scripts/photos.mjs or scripts/render-hero.mjs change a source:
 *   node scripts/responsive.mjs
 *
 * For every source JPEG under public/images it writes <name>-<w>.webp
 * siblings at each site breakpoint width that does not exceed the source
 * (plus the source width itself), and records the available widths in
 * src/lib/images.manifest.json for the loader. Outputs are committed; the
 * build does not regenerate them.
 */
import sharp from "sharp";
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const MANIFEST = path.join(ROOT, "src", "lib", "images.manifest.json");

/** Keep in sync with images.deviceSizes in next.config.ts. */
const WIDTHS = [360, 414, 640, 768, 1024, 1280, 1536, 1920];
const QUALITY = 78;

async function* jpegs(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* jpegs(full);
    else if (/\.jpe?g$/i.test(entry.name)) yield full;
  }
}

/** Sources that are never rendered with next/image (OG input only). */
const SKIP = new Set(["/images/fleet-side-profile.jpg"]);

const manifest = {};
for await (const file of jpegs(path.join(PUBLIC, "images"))) {
  const src = "/" + path.relative(PUBLIC, file).split(path.sep).join("/");
  if (SKIP.has(src)) continue;
  const { width: max } = await sharp(file).metadata();
  const widths = [...new Set([...WIDTHS.filter((w) => w < max), max])].sort((a, b) => a - b);
  const stem = file.replace(/\.jpe?g$/i, "");
  let total = 0;
  for (const w of widths) {
    const info = await sharp(file).resize({ width: w, withoutEnlargement: true }).webp({ quality: QUALITY, effort: 5 }).toFile(`${stem}-${w}.webp`);
    total += info.size;
  }
  manifest[src] = widths;
  console.log(`${src.padEnd(46)} ${widths.join(" ")}  (${(total / 1024).toFixed(0)} kB total)`);
}

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(MANIFEST, JSON.stringify(sorted, null, 2) + "\n");
console.log(`\n${Object.keys(sorted).length} sources → ${path.relative(ROOT, MANIFEST)}`);
