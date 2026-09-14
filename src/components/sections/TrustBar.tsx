"use client";

import { useEffect, useRef } from "react";
import { ANIME_EASE, MS } from "@/lib/motion/tokens";
import { prefersReducedMotion } from "@/lib/motion/useReducedMotion";
import { BRANDS, CREDENTIALS } from "@/lib/content";
import { Reveal } from "@/lib/motion/Reveal";

/**
 * Trust bar: infinite brand marquee (CSS transform loop, pauses on hover and
 * is static under reduced motion) + anime.js counters that run once when the
 * bar first enters the viewport.
 */
export function TrustBar() {
  const counters = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = counters.current!;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-count]"));
    const format = (n: number) => Math.round(n).toLocaleString("en-US");

    if (prefersReducedMotion()) {
      els.forEach((el) => (el.textContent = format(Number(el.dataset.count))));
      return;
    }
    els.forEach((el) => (el.textContent = "0"));
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        // anime.js is loaded on demand — it never sits in the initial bundle.
        import("@/lib/motion/anime").then(({ animate, utils }) => {
          els.forEach((el, i) => {
            const target = Number(el.dataset.count);
            const obj = { v: 0 };
            animate(obj, {
              v: target,
              duration: MS.xxl + i * 120,
              delay: i * 90,
              ease: ANIME_EASE.out,
              modifier: utils.round(0),
              onUpdate: () => {
                el.textContent = format(obj.v);
              },
            });
          });
        });
      },
      { threshold: 0.4 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  const items = [...BRANDS, ...BRANDS];

  return (
    <section aria-label="Brands carried and track record" className="relative border-y border-line bg-base-1">
      {/* Marquee */}
      <div
        className="group/marquee relative overflow-hidden py-5"
        style={{ "--marquee-duration": "48s" } as React.CSSProperties}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-base-1 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-base-1 to-transparent" />
        <ul
          className="flex w-max items-center gap-14 whitespace-nowrap motion-safe:animate-marquee group-hover/marquee:[animation-play-state:paused]"
          aria-label="Tire brands carried"
        >
          {items.map((b, i) => (
            <li
              key={`${b}-${i}`}
              aria-hidden={i >= BRANDS.length ? true : undefined}
              className="display-wide text-[0.95rem] tracking-[0.2em] text-ink-3 transition-colors duration-(--dur-sm) hover:text-ink"
            >
              {b}
            </li>
          ))}
        </ul>
      </div>

      {/* Counters */}
      <div ref={counters} className="border-t border-line">
        <Reveal
          mode="stagger"
          className="container-x grid grid-cols-2 divide-line md:grid-cols-4 md:divide-x"
        >
          {CREDENTIALS.map((c) => (
              <div key={c.label} className="py-8 md:px-8 md:first:pl-0 md:last:pr-0">
                <p className="display-tight text-display-sm text-ink tabular-nums">
                  {c.prefix && <span className="text-ink-3">{c.prefix}</span>}
                  <span data-count={c.value}>{c.value.toLocaleString("en-US")}</span>
                  <span className="text-accent">{c.suffix}</span>
                </p>
                <p className="mt-2 font-display text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-ink-2 [font-stretch:110%]">
                  {c.label}
                </p>
                <p className="mt-1 text-micro text-ink-4">{c.note}</p>
              </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
