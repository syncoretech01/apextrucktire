"use client";

/**
 * anime.js v4 surface used on the site. Import from here so the import set
 * stays small and tree-shaken, and so easing strings come from tokens.
 */
export { animate, stagger, utils, svg, createTimeline, createTimer } from "animejs";
export { ANIME_EASE, MS } from "./tokens";
