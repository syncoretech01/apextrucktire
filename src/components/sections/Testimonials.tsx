"use client";

import { useEffect, useRef, useState } from "react";
import type { Draggable as DraggableType } from "gsap/Draggable";
import { gsap } from "@/lib/motion/gsap";
import { DUR, EASE } from "@/lib/motion/tokens";
import { TESTIMONIALS } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";

/**
 * GSAP Draggable + InertiaPlugin horizontal carousel with snap-to-card.
 * Keyboard: the track is focusable; ← → move one card; buttons do the same.
 * Reduced motion: no inertia, instant snaps. Content is PLACEHOLDER copy.
 */
export function Testimonials() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const draggable = useRef<DraggableType | null>(null);
  const positions = useRef<number[]>([]);

  const goTo = (i: number, animateTo = true) => {
    const cards = track.current!.children;
    const n = cards.length;
    const next = Math.max(0, Math.min(n - 1, i));
    const x = positions.current[next] ?? 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(track.current, { x, duration: animateTo && !reduce ? DUR.lg : 0, ease: EASE.out, onUpdate: () => draggable.current?.update() });
    setIndex(next);
  };

  useEffect(() => {
    const t = track.current!;
    let cancelled = false;
    const measure = () => {
      const cards = Array.from(t.children) as HTMLElement[];
      const gutter = parseFloat(getComputedStyle(t).gap || "0");
      let acc = 0;
      positions.current = cards.map((c) => {
        const x = -acc;
        acc += c.offsetWidth + gutter;
        return x;
      });
      const maxScroll = t.scrollWidth - t.parentElement!.clientWidth;
      positions.current = positions.current.map((p) => Math.max(-maxScroll, p));
      draggable.current?.applyBounds({ minX: -maxScroll, maxX: 0 });
    };
    measure();

    // Draggable + InertiaPlugin are only needed here — loaded on demand.
    Promise.all([import("gsap/Draggable"), import("gsap/InertiaPlugin")]).then(([{ Draggable }, { InertiaPlugin }]) => {
      if (cancelled) return;
      gsap.registerPlugin(Draggable, InertiaPlugin);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      draggable.current = Draggable.create(t, {
        type: "x",
        bounds: { minX: -(t.scrollWidth - t.parentElement!.clientWidth), maxX: 0 },
        edgeResistance: 0.75,
        inertia: !reduce,
        dragResistance: 0.05,
        snap: { x: (v) => gsap.utils.snap(positions.current, v) },
        onThrowComplete() {
          const i = positions.current.findIndex((p) => Math.abs(p - this.x) < 2);
          if (i >= 0) setIndex(i);
        },
        onDragEnd() {
          if (reduce) {
            const i = positions.current.reduce((best, p, j) => (Math.abs(p - this.x) < Math.abs(positions.current[best]! - this.x) ? j : best), 0);
            goTo(i, false);
          }
        },
      })[0]!;
    });

    window.addEventListener("resize", measure);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", measure);
      draggable.current?.kill();
      draggable.current = null;
    };
  }, []);

  // Update index on pointer-based drags without inertia end (e.g., touch tap)
  useEffect(() => {
    const t = track.current!;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(index + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(index - 1); }
      if (e.key === "Home") { e.preventDefault(); goTo(0); }
      if (e.key === "End") { e.preventDefault(); goTo(TESTIMONIALS.length - 1); }
    };
    t.addEventListener("keydown", onKey);
    return () => t.removeEventListener("keydown", onKey);
  }, [index]);

  return (
    <section ref={section} id="testimonials" className="relative overflow-hidden border-t border-line bg-base-1 py-section" aria-labelledby="quotes-title">
      <div className="container-x">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            size="md"
            eyebrow="From the people who call us"
            title={<span id="quotes-title">Quotes go here once they&rsquo;re yours to print.</span>}
            lead={<span className="text-small text-ink-4">Placeholder testimonials — swap in real, permissioned quotes (README → Swap points). Never publish invented reviews.</span>}
          />
          <div className="flex items-center gap-2" role="group" aria-label="Carousel controls">
            <button type="button" onClick={() => goTo(index - 1)} disabled={index === 0} className="flex size-11 items-center justify-center rounded-sm border border-line text-ink transition-colors hover:border-steel disabled:opacity-40" aria-label="Previous quote">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" onClick={() => goTo(index + 1)} disabled={index === TESTIMONIALS.length - 1} className="flex size-11 items-center justify-center rounded-sm border border-line text-ink transition-colors hover:border-steel disabled:opacity-40" aria-label="Next quote">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <span className="ml-2 font-mono text-[0.6875rem] tracking-[0.12em] text-ink-3" aria-live="polite">
              {String(index + 1).padStart(2, "0")} / {String(TESTIMONIALS.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      <div className="container-x mt-12 overflow-visible">
        <div
          ref={track}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Customer quotes. Use arrow keys to move between quotes."
          className="flex cursor-grab gap-5 outline-offset-8 active:cursor-grabbing"
        >
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={i}
              aria-hidden={i !== index ? true : undefined}
              className={`w-[min(85vw,34rem)] shrink-0 select-none rounded-sm border bg-surface p-7 shadow-panel transition-[border-color,opacity] duration-(--dur-md) md:p-9 ${
                i === index ? "border-line-strong" : "border-line opacity-60"
              }`}
            >
              <svg viewBox="0 0 24 24" className="size-6 text-accent" aria-hidden="true"><path d="M7 7h4v6H8v4H4v-6l3-4Zm10 0h4v6h-3v4h-4v-6l3-4Z" fill="currentColor" /></svg>
              <blockquote className="mt-5 text-lead text-ink">
                <p>&ldquo;{t.quote}&rdquo;</p>
              </blockquote>
              <figcaption className="mt-6 border-t border-line pt-4">
                <span className="block font-display text-[0.9rem] font-bold uppercase tracking-[0.08em] text-ink [font-stretch:110%]">{t.name}</span>
                <span className="mt-1 block text-small text-ink-3">{t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
