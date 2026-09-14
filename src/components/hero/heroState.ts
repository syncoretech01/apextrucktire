/**
 * Mutable, render-free store shared by the hero DOM layer (GSAP timelines,
 * callout overlay) and the R3F scene. Nothing here triggers React renders —
 * the scene reads it inside useFrame, the overlay updates DOM via refs.
 */
import type { PartId } from "./wheelConfig";

export type Projected = { x: number; y: number; depth: number };

type Listener = () => void;

export const heroState = {
  /** 1 = fully exploded, 0 = assembled. Intro tween drives this on load. */
  intro: 1,
  introActive: true,
  /** ScrollTrigger progress 0→1 across the pinned hero. */
  scroll: 0,
  /** The value the scene actually renders. */
  explode: 1,
  hovered: null as PartId | null,
  /** Normalized pointer, -1..1, for camera parallax. */
  pointer: { x: 0, y: 0 },
  /** Scene has compiled and rendered its first frame. */
  ready: false,
  /** Screen-space anchors written by the scene each frame. */
  projected: new Map<string, Projected>(),
  /** Viewport size of the canvas, for the overlay. */
  size: { width: 1, height: 1 },
  /** Set by the scene: requests a new frame (frameloop="demand"). */
  invalidate: (() => {}) as () => void,

  _frameListeners: new Set<Listener>(),
  _hoverListeners: new Set<Listener>(),

  onFrame(fn: Listener) {
    this._frameListeners.add(fn);
    return () => {
      this._frameListeners.delete(fn);
    };
  },
  emitFrame() {
    this._frameListeners.forEach((fn) => fn());
  },
  onHover(fn: Listener) {
    this._hoverListeners.add(fn);
    return () => {
      this._hoverListeners.delete(fn);
    };
  },
  setHovered(id: PartId | null) {
    if (this.hovered === id) return;
    this.hovered = id;
    this._hoverListeners.forEach((fn) => fn());
    this.invalidate();
  },
  /** Called by DOM side to reset when the hero unmounts. */
  reset() {
    this.intro = 1;
    this.introActive = true;
    this.scroll = 0;
    this.explode = 1;
    this.hovered = null;
    this.ready = false;
    this.projected.clear();
  },
};
