"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { DUR } from "@/lib/motion/tokens";
import { heroState } from "./heroState";
import { HERO_SEQ } from "./sequence";

/**
 * Lite-tier hero: a 2D canvas scrubbing a pre-rendered image sequence of the
 * same explode. Frames load after the poster (the LCP element), highest
 * explode first so the assembly can play as soon as the set is complete.
 * Adjacent frames are cross-blended for a smooth scrub from 32 stills.
 */
export function HeroSequence({ posterRef }: { posterRef: RefObject<HTMLDivElement | null> }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvas.current!;
    const ctx = c.getContext("2d", { alpha: false })!;
    const portrait = window.innerWidth / window.innerHeight < 1.05;
    const orientation = portrait ? "portrait" : "landscape";
    const frames: (HTMLImageElement | null)[] = new Array(HERO_SEQ.count).fill(null);
    let loaded = 0;
    let raf = 0;
    let active = true;
    let started = false;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = c.getBoundingClientRect();
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      draw();
    };

    const drawFrame = (img: HTMLImageElement, alpha: number) => {
      // cover-fit
      const cw = c.width;
      const ch = c.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const draw = () => {
      raf = 0;
      if (!started) return;
      const explode = heroState.introActive ? heroState.intro : heroState.scroll;
      heroState.explode = explode;
      const f = explode * (HERO_SEQ.count - 1);
      const i0 = Math.floor(f);
      const i1 = Math.min(HERO_SEQ.count - 1, i0 + 1);
      const t = f - i0;
      const a = frames[i0];
      const b = frames[i1];
      if (!a) return;
      ctx.globalAlpha = 1;
      drawFrame(a, 1);
      if (b && t > 0.01) drawFrame(b, t);
      ctx.globalAlpha = 1;
    };

    const requestDraw = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    heroState.invalidate = requestDraw;

    const start = () => {
      if (started || !active) return;
      started = true;
      resize();
      // Poster (exploded) → canvas (frame N-1, identical) → assemble
      gsap.to(c, { autoAlpha: 1, duration: DUR.md, ease: "power1.inOut" });
      if (posterRef.current) gsap.to(posterRef.current, { autoAlpha: 0, duration: DUR.md, delay: 0.1 });
      heroState.introActive = true;
      heroState.intro = 1;
      gsap.to(heroState, {
        intro: 0,
        duration: DUR.heroAssemble,
        ease: "apexSnap",
        onUpdate: requestDraw,
        onComplete: () => {
          heroState.introActive = false;
          requestDraw();
        },
      });
    };

    // Load highest explode first, then the rest.
    const order = Array.from({ length: HERO_SEQ.count }, (_, i) => HERO_SEQ.count - 1 - i);
    const loadNext = (idx: number) => {
      if (!active || idx >= order.length) return;
      const i = order[idx]!;
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        frames[i] = img;
        loaded += 1;
        if (loaded === HERO_SEQ.count) start();
        loadNext(idx + 1);
      };
      img.onerror = () => {
        // Missing frames: keep the poster, disable the scrub silently.
        active = false;
      };
      img.src = HERO_SEQ.path(orientation, i);
    };
    // Two in flight
    loadNext(0);
    loadNext(1);

    window.addEventListener("resize", resize);
    return () => {
      active = false;
      window.removeEventListener("resize", resize);
      if (raf) cancelAnimationFrame(raf);
      heroState.invalidate = () => {};
    };
  }, [posterRef]);

  return <canvas ref={canvas} className="absolute inset-0 z-1 h-full w-full opacity-0" style={{ visibility: "hidden" }} aria-hidden="true" />;
}
