"use client";

import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { ANIME_EASE, MS } from "@/lib/motion/tokens";
import { prefersReducedMotion } from "@/lib/motion/useReducedMotion";
import { POSITIONS, type TirePosition } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/lib/motion/Reveal";
import { ButtonLink, ArrowIcon } from "@/components/ui/Button";
import { track } from "@/lib/analytics";

const ORDER: TirePosition[] = ["steer", "drive", "trailer"];

/** Wheel centers in the 1200×360 viewBox. */
const WHEELS: Record<TirePosition, { cx: number; cy: number }[]> = {
  steer: [{ cx: 250, cy: 268 }],
  drive: [
    { cx: 470, cy: 268 },
    { cx: 562, cy: 268 },
  ],
  trailer: [
    { cx: 985, cy: 268 },
    { cx: 1077, cy: 268 },
  ],
};

/** Visible viewBox (cropped to the truck) and hotspot anchors as % of it. */
const VB = { x: 130, y: 44, w: 1060, h: 286 };
const pct = (cx: number, cy: number) => ({ x: ((cx - VB.x) / VB.w) * 100, y: ((cy - VB.y) / VB.h) * 100 });
const HOTSPOTS: Record<TirePosition, { x: number; y: number }> = {
  steer: pct(250, 268),
  drive: pct(516, 268),
  trailer: pct(1031, 268),
};

/**
 * Interactive side-view truck diagram. Steer / drive / trailer hotspots are
 * real buttons (roving tabindex, arrow keys) layered over a decorative SVG;
 * selecting one filters the recommended tires with anime.js transitions.
 */
export function TirePositions() {
  const [pos, setPos] = useState<TirePosition>("steer");
  const list = useRef<HTMLUListElement>(null);
  const diagram = useRef<SVGSVGElement>(null);
  const hotspotRefs = useRef<Record<TirePosition, HTMLButtonElement | null>>({ steer: null, drive: null, trailer: null });
  const uid = useId();
  const first = useRef(true);

  // Animate cards + wheel highlight when the position changes
  useEffect(() => {
    const cards = list.current?.querySelectorAll<HTMLElement>("[data-pick]") ?? [];
    const rings = diagram.current?.querySelectorAll<SVGCircleElement>(`[data-ring="${pos}"]`) ?? [];
    if (prefersReducedMotion() || first.current) {
      first.current = false;
      return;
    }
    import("@/lib/motion/anime").then(({ animate, stagger, svg }) => {
      animate(cards, {
        opacity: [0, 1],
        translateY: [14, 0],
        duration: MS.lg,
        delay: stagger(60),
        ease: ANIME_EASE.out,
      });
      if (rings.length) {
        const drawables = svg.createDrawable(Array.from(rings));
        animate(drawables, { draw: ["0 0", "0 1"], duration: MS.xl, ease: ANIME_EASE.out, delay: stagger(80) });
      }
    });
  }, [pos]);

  const select = (p: TirePosition, source: string) => {
    if (p !== pos) track("form_step", { step: `tire_position_${p}`, source });
    setPos(p);
  };

  const onKey = (e: React.KeyboardEvent, p: TirePosition) => {
    const i = ORDER.indexOf(p);
    let next: TirePosition | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = ORDER[(i + 1) % ORDER.length]!;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = ORDER[(i - 1 + ORDER.length) % ORDER.length]!;
    if (e.key === "Home") next = ORDER[0]!;
    if (e.key === "End") next = ORDER[ORDER.length - 1]!;
    if (!next) return;
    e.preventDefault();
    select(next, "keyboard");
    hotspotRefs.current[next]?.focus();
  };

  const current = POSITIONS[pos];

  return (
    <section id="tires" className="scroll-anchor relative border-t border-line bg-base-0 py-section" aria-labelledby="tires-title">
      <div className="container-x">
        <SectionHeader
          eyebrow="Tires by position"
          title={<span id="tires-title">Pick the axle. We&rsquo;ll show you what belongs on it.</span>}
          lead="Steer, drive and trailer positions wear differently and want different tread. Tap a position on the truck to see what we recommend and stock."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Diagram */}
          <Reveal className="relative lg:col-span-7">
            <div className="relative" role="group" aria-label="Truck tire positions">
              <TruckSvg ref={diagram} selected={pos} />
              {ORDER.map((p) => {
                const h = HOTSPOTS[p];
                const active = p === pos;
                return (
                  <button
                    key={p}
                    ref={(el) => {
                      hotspotRefs.current[p] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`${uid}-tab-${p}`}
                    aria-selected={active}
                    aria-controls={`${uid}-panel`}
                    tabIndex={active ? 0 : -1}
                    onClick={() => select(p, "hotspot")}
                    onKeyDown={(e) => onKey(e, p)}
                    className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 outline-offset-4"
                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                  >
                    <span
                      className={`relative flex size-9 items-center justify-center rounded-pill border transition-[background-color,border-color,transform] duration-(--dur-sm) ease-out-quint group-hover:scale-110 ${
                        active ? "border-accent bg-accent text-on-accent" : "border-steel bg-base-0/90 text-steel-2"
                      }`}
                    >
                      <span className="font-display text-[0.7rem] font-bold uppercase tracking-[0.06em] [font-stretch:110%]">
                        {p === "steer" ? "S" : p === "drive" ? "D" : "T"}
                      </span>
                      {active && <span className="absolute inset-0 rounded-pill motion-safe:animate-pulse-accent" aria-hidden="true" />}
                    </span>
                    <span
                      className={`whitespace-nowrap rounded-xs border px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.1em] transition-colors duration-(--dur-sm) ${
                        active ? "border-accent/60 bg-base-0 text-ink" : "border-line bg-base-0/80 text-ink-3"
                      }`}
                    >
                      {POSITIONS[p].label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Text tabs for small screens / assistive tech */}
            <div className="mt-6 flex gap-2 lg:hidden" role="tablist" aria-label="Tire position">
              {ORDER.map((p) => (
                <button
                  key={p}
                  type="button"
                  role="tab"
                  aria-selected={p === pos}
                  onClick={() => select(p, "tab")}
                  className={`flex-1 rounded-sm border px-3 py-2.5 font-display text-[0.75rem] font-semibold uppercase tracking-[0.12em] [font-stretch:110%] ${
                    p === pos ? "border-accent bg-accent-dim text-ink" : "border-line text-ink-3"
                  }`}
                >
                  {POSITIONS[p].label}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Recommendations */}
          <div className="lg:col-span-5" id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${pos}`}>
            <div className="border-l-2 border-accent pl-4">
              <p className="eyebrow text-ink-3">{current.label} position</p>
              <p className="mt-2 text-body text-ink-2">{current.role}</p>
            </div>
            <ul ref={list} className="mt-6 space-y-3" aria-live="polite">
              {current.picks.map((pick) => (
                <li
                  key={pick.name}
                  data-pick
                  className="group/pick grid grid-cols-[auto_1fr] gap-4 rounded-sm border border-line bg-surface p-4 transition-colors duration-(--dur-sm) hover:border-line-strong"
                >
                  <span className="mt-1 block size-2 bg-accent" aria-hidden="true" />
                  <div>
                    <p className="text-[1.05rem] font-semibold text-ink">{pick.name}</p>
                    <p className="tech-label mt-1 text-steel">{pick.type}</p>
                    <p className="mt-1.5 text-small text-ink-3">{pick.note}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="#request-service" variant="secondary" size="md" onClick={() => track("cta_request_service", { location: "tires", position: pos })}>
                Quote {current.label.toLowerCase()} tires
                <ArrowIcon className="size-[1em]" />
              </ButtonLink>
              <p className="text-small text-ink-4">Sizes 22.5 and 24.5 in stock. Retreads on drive and trailer only.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


/** Decorative schematic — a Class 8 day cab with a 53' van trailer. */
const TruckSvg = forwardRef<SVGSVGElement, { selected: TirePosition }>(function TruckSvg({ selected }, ref) {
  const stroke = "var(--color-steel)";
  return (
    <svg ref={ref} viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} className="w-full" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="truck-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-surface-3)" />
          <stop offset="1" stopColor="var(--color-surface)" />
        </linearGradient>
      </defs>

      {/* Ground */}
      <line x1="40" y1="304" x2="1160" y2="304" stroke="var(--color-line-strong)" strokeWidth="1.5" />
      <line x1="40" y1="312" x2="1160" y2="312" stroke="var(--color-line)" strokeWidth="1" strokeDasharray="10 14" />

      {/* Trailer */}
      <rect x="400" y="62" width="770" height="176" rx="4" fill="url(#truck-body)" stroke={stroke} strokeWidth="1.5" />
      <line x1="400" y1="222" x2="1170" y2="222" stroke="var(--color-line-strong)" />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={470 + i * 84} y1="70" x2={470 + i * 84} y2="216" stroke="var(--color-line)" />
      ))}
      <rect x="1150" y="240" width="24" height="12" fill="var(--color-surface-3)" stroke={stroke} />
      <line x1="905" y1="238" x2="905" y2="268" stroke={stroke} strokeWidth="1.5" />
      <line x1="905" y1="268" x2="1160" y2="268" stroke={stroke} strokeWidth="2" />
      {/* landing gear */}
      <rect x="640" y="238" width="8" height="44" fill="var(--color-surface-3)" stroke={stroke} />
      <rect x="628" y="280" width="32" height="6" fill="var(--color-surface-3)" stroke={stroke} />

      {/* Tractor: chassis, hood, cab */}
      <rect x="150" y="238" width="470" height="14" fill="var(--color-surface-3)" stroke={stroke} strokeWidth="1.5" />
      <path d="M160 238 V180 Q160 168 172 168 H286 V238 Z" fill="url(#truck-body)" stroke={stroke} strokeWidth="1.5" />
      <path d="M286 238 V104 Q286 92 298 92 H384 Q400 92 400 108 V238 Z" fill="url(#truck-body)" stroke={stroke} strokeWidth="1.5" />
      <path d="M298 104 H380 V158 H298 Z" fill="var(--color-base-0)" stroke={stroke} />
      <rect x="392" y="80" width="10" height="158" fill="var(--color-surface-3)" stroke={stroke} />
      <rect x="150" y="226" width="12" height="26" fill="var(--color-surface-3)" stroke={stroke} />
      {/* fifth wheel */}
      <path d="M492 238 h48 l-6 -10 h-36 Z" fill="var(--color-surface-3)" stroke={stroke} />
      {/* fuel tank */}
      <rect x="296" y="252" width="120" height="30" rx="15" fill="var(--color-surface-2)" stroke={stroke} />

      {/* Wheels */}
      {ORDER.map((p) =>
        WHEELS[p].map((w, i) => {
          const active = p === selected;
          return (
            <g key={`${p}-${i}`}>
              <circle cx={w.cx} cy={w.cy} r="36" fill="var(--color-base-0)" stroke={active ? "var(--color-accent)" : stroke} strokeWidth={active ? 3 : 2} className="transition-[stroke] duration-(--dur-md)" />
              <circle cx={w.cx} cy={w.cy} r="27" fill="none" stroke="var(--color-line-strong)" strokeDasharray="4 5" />
              <circle cx={w.cx} cy={w.cy} r="14" fill="var(--color-surface-3)" stroke={stroke} />
              <circle cx={w.cx} cy={w.cy} r="4" fill={active ? "var(--color-accent)" : stroke} className="transition-[fill] duration-(--dur-md)" />
              {/* Draw ring, animated by anime.js on selection */}
              <circle
                data-ring={p}
                cx={w.cx}
                cy={w.cy}
                r="46"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="1.5"
                opacity={active ? 1 : 0}
                className="transition-opacity duration-(--dur-sm)"
                transform={`rotate(-90 ${w.cx} ${w.cy})`}
              />
            </g>
          );
        }),
      )}
    </svg>
  );
});
