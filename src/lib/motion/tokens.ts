/**
 * Motion tokens — the JS mirror of the CSS scale in globals.css.
 * Every GSAP / anime.js duration and easing on the site comes from here so
 * the whole page shares one motion signature. Durations in seconds (GSAP)
 * with a ms helper for anime.js.
 */
export const DUR = {
  xs: 0.12,
  sm: 0.2,
  md: 0.32,
  lg: 0.56,
  xl: 0.9,
  xxl: 1.4,
  /** Hero assembly snap on load */
  heroAssemble: 1.7,
} as const;

export const MS = {
  xs: 120,
  sm: 200,
  md: 320,
  lg: 560,
  xl: 900,
  xxl: 1400,
} as const;

/** GSAP ease strings. Keep in sync with the CSS cubic-beziers. */
export const EASE = {
  /** cubic-bezier(0.16, 1, 0.3, 1) — the default "arrive" curve */
  out: "expo.out",
  /** cubic-bezier(0.22, 1, 0.36, 1) — softer arrive for text */
  outSoft: "power4.out",
  /** cubic-bezier(0.85, 0, 0.15, 1) — reveals that need weight on both ends */
  inOut: "power3.inOut",
  /** cubic-bezier(0.7, 0, 0.2, 1) — mechanical snap (hero assembly, panels) */
  snap: "power4.inOut",
  /** Linear for scrubbed timelines — the scroll is the ease */
  scrub: "none",
  /** Overshoot for the assembly "click" at the end of the hero snap */
  settle: "back.out(1.4)",
} as const;

/** anime.js ease strings (v4 syntax) */
export const ANIME_EASE = {
  out: "outExpo",
  outSoft: "outQuart",
  inOut: "inOutCirc",
  snap: "inOutQuart",
  linear: "linear",
} as const;

export const STAGGER = {
  chars: 0.018,
  words: 0.045,
  lines: 0.09,
  items: 0.08,
  cards: 0.12,
} as const;

/** Scroll scrub smoothing (seconds of catch-up). 0 = locked to scroll. */
export const SCRUB = {
  tight: 0.4,
  hero: 0.9,
  loose: 1.4,
} as const;
