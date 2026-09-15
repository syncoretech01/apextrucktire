import manifest from "./images.manifest.json";

/**
 * next/image loader: maps a source photo + requested width to the WebP
 * variant pre-rendered by scripts/responsive.mjs, so nothing is resized at
 * request time. Picks the smallest variant at least as wide as requested and
 * caps at the source width (large srcset entries then repeat the widest
 * file, which browsers handle). Anything not in the manifest is served as-is.
 */
const WIDTHS: Record<string, number[]> = manifest;

export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  const widths = WIDTHS[src];
  if (!widths) return src;
  const w = widths.find((x) => x >= width) ?? widths[widths.length - 1];
  return `${src.replace(/\.jpe?g$/i, "")}-${w}.webp`;
}
