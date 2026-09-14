import localFont from "next/font/local";

/**
 * Self-hosted variable fonts. Only the display face is preloaded (it paints
 * the hero headline); Manrope swaps in with size-adjusted fallback metrics so
 * the swap does not shift layout.
 *
 * Archivo is a glyph-limited subset (A–Z, digits, punctuation; wdth + wght
 * axes intact) because every display use on the site is uppercase — it keeps
 * the LCP-critical font under 40 KB. Regenerate via README → Fonts if you add
 * lowercase display text.
 */
export const archivo = localFont({
  src: "../../public/fonts/archivo-display-caps.woff2",
  variable: "--font-archivo",
  weight: "100 900",
  display: "swap",
  preload: true,
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
  fallback: ["Arial Narrow", "Impact", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const manrope = localFont({
  src: "../../public/fonts/manrope-variable-latin.woff2",
  variable: "--font-manrope",
  weight: "200 800",
  display: "swap",
  preload: false,
  fallback: ["system-ui", "Segoe UI", "Helvetica Neue", "sans-serif"],
  adjustFontFallback: "Arial",
});
