"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";
import { DUR, EASE } from "@/lib/motion/tokens";
import { SITE } from "@/lib/site";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/lib/motion/Reveal";
import { ButtonLink, PhoneIcon } from "@/components/ui/Button";
import { track } from "@/lib/analytics";

/* Stylized projection of the Inland Empire. Not survey-accurate — a diagram. */
const LON0 = -117.85, LON1 = -116.8, LAT0 = 33.7, LAT1 = 34.25;
const W = 1000, H = 630;
const px = (lon: number, lat: number) => ({ x: ((lon - LON0) / (LON1 - LON0)) * W, y: ((LAT1 - lat) / (LAT1 - LAT0)) * H });
const P = (lon: number, lat: number) => `${px(lon, lat).x.toFixed(1)},${px(lon, lat).y.toFixed(1)}`;

type Highway = { id: string; label: string; kind: "interstate" | "state"; d: string; labelAt: [number, number]; eta: string };

const HIGHWAYS: Highway[] = [
  {
    id: "i10",
    label: "I-10",
    kind: "interstate",
    d: `M ${P(-117.85, 34.075)} L ${P(-117.65, 34.07)} L ${P(-117.45, 34.07)} L ${P(-117.32, 34.065)} L ${P(-117.18, 34.06)} L ${P(-117.05, 34.03)} L ${P(-116.98, 33.935)} L ${P(-116.8, 33.93)}`,
    labelAt: [-117.08, 34.055],
    eta: "Pomona → Banning. Core zone Ontario to Redlands.",
  },
  {
    id: "i215",
    label: "I-215",
    kind: "interstate",
    d: `M ${P(-117.4, 34.25)} L ${P(-117.33, 34.16)} L ${P(-117.29, 34.11)} L ${P(-117.31, 34.05)} L ${P(-117.35, 33.97)} L ${P(-117.3, 33.93)} L ${P(-117.23, 33.78)} L ${P(-117.2, 33.7)}`,
    labelAt: [-117.3, 34.17],
    eta: "Devore → Perris. San Bernardino, Colton, Riverside.",
  },
  {
    id: "i15",
    label: "I-15",
    kind: "interstate",
    d: `M ${P(-117.45, 34.25)} L ${P(-117.55, 34.14)} L ${P(-117.58, 34.03)} L ${P(-117.56, 33.97)} L ${P(-117.57, 33.88)} L ${P(-117.47, 33.72)} L ${P(-117.45, 33.7)}`,
    labelAt: [-117.585, 33.93],
    eta: "Cajon Pass → Corona. Rancho, Ontario, Eastvale.",
  },
  {
    id: "sr60",
    label: "SR-60",
    kind: "state",
    d: `M ${P(-117.85, 34.03)} L ${P(-117.68, 34.02)} L ${P(-117.5, 34.0)} L ${P(-117.4, 33.97)} L ${P(-117.23, 33.94)} L ${P(-116.98, 33.93)}`,
    labelAt: [-117.33, 33.955],
    eta: "Pomona → Beaumont. Jurupa Valley, Riverside, Moreno Valley.",
  },
  {
    id: "sr210",
    label: "SR-210",
    kind: "state",
    d: `M ${P(-117.62, 34.14)} L ${P(-117.45, 34.14)} L ${P(-117.29, 34.13)} L ${P(-117.18, 34.07)}`,
    labelAt: [-117.4, 34.145],
    eta: "Rancho → Redlands along the foothills.",
  },
];

const CITIES: { name: string; lon: number; lat: number; core?: boolean; anchor?: "start" | "end" }[] = [
  { name: "Bloomington", lon: -117.4, lat: 34.07, core: true },
  { name: "Fontana", lon: -117.44, lat: 34.1, core: true, anchor: "end" },
  { name: "Rialto", lon: -117.37, lat: 34.11, core: true },
  { name: "Colton", lon: -117.32, lat: 34.055, core: true },
  { name: "San Bernardino", lon: -117.29, lat: 34.11, core: true },
  { name: "Redlands", lon: -117.18, lat: 34.055, core: true },
  { name: "Ontario", lon: -117.65, lat: 34.06, core: true, anchor: "end" },
  { name: "Rancho Cucamonga", lon: -117.58, lat: 34.12, core: true, anchor: "end" },
  { name: "Riverside", lon: -117.4, lat: 33.95, core: true },
  { name: "Jurupa Valley", lon: -117.5, lat: 34.0, core: true, anchor: "end" },
  { name: "Moreno Valley", lon: -117.23, lat: 33.94 },
  { name: "Perris", lon: -117.23, lat: 33.78 },
  { name: "Corona", lon: -117.57, lat: 33.88, anchor: "end" },
  { name: "Chino", lon: -117.69, lat: 34.01, anchor: "end" },
  { name: "Pomona", lon: -117.75, lat: 34.06, anchor: "end" },
  { name: "Beaumont", lon: -116.98, lat: 33.93 },
  { name: "Banning", lon: -116.88, lat: 33.93 },
  { name: "Yucaipa", lon: -117.04, lat: 34.03 },
];

const SHOP = px(-117.395, 34.068);
/** ≈ 18 mi core radius in map units (1° lon ≈ 57 mi here). */
const CORE_R = (18 / 57) * (W / (LON1 - LON0));

export function ServiceArea() {
  const section = useRef<HTMLElement>(null);
  const [hover, setHover] = useState<string | null>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(section.current!);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const roads = q<SVGPathElement>("[data-road]");
        roads.forEach((p) => {
          const len = p.getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: q("[data-map]")[0], start: "top 70%", once: true },
          defaults: { ease: EASE.out },
        });
        tl.to(roads, { strokeDashoffset: 0, duration: DUR.xxl, stagger: 0.18, ease: EASE.inOut })
          .from(q("[data-shield]"), { autoAlpha: 0, scale: 0.6, duration: DUR.md, stagger: 0.08, transformOrigin: "50% 50%" }, "-=0.9")
          .from(q("[data-city]"), { autoAlpha: 0, duration: DUR.md, stagger: 0.03 }, "-=0.6")
          .from(q("[data-ring]"), { scale: 0, autoAlpha: 0, duration: DUR.xl, ease: EASE.settle, transformOrigin: `${SHOP.x}px ${SHOP.y}px` }, "-=0.8")
          .from(q("[data-pin]"), { scale: 0, duration: DUR.lg, ease: EASE.settle, transformOrigin: `${SHOP.x}px ${SHOP.y}px` }, "-=0.5");
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  const hovered = HIGHWAYS.find((h) => h.id === hover);

  return (
    <section ref={section} id="service-area" className="scroll-anchor relative border-t border-line bg-base-1 py-section" aria-labelledby="area-title">
      <div className="container-x">
        <SectionHeader
          eyebrow="Service area"
          title={<span id="area-title">The Inland Empire corridor, covered from the middle of it.</span>}
          lead="Slover Ave. sits a mile off I-10 and four miles off I-215. That is why the core-zone ETA is what it is."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Map */}
          <Reveal className="relative lg:col-span-8">
            <div data-map className="relative overflow-hidden rounded-sm border border-line bg-base-0 vignette">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-labelledby="map-title map-desc">
                <title id="map-title">Map of the Apex Truck Tire service area</title>
                <desc id="map-desc">
                  Stylized map of the Inland Empire showing Interstates 10, 215 and 15, State Routes 60 and 210, a 25-mile core response zone around the Bloomington shop, and covered cities from Pomona to Banning and Perris.
                </desc>
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="var(--color-line)" strokeWidth="0.6" />
                  </pattern>
                  <radialGradient id="core-fill">
                    <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.16" />
                    <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0.02" />
                  </radialGradient>
                </defs>
                <rect width={W} height={H} fill="url(#grid)" />

                {/* Core zone */}
                <g data-ring>
                  <circle cx={SHOP.x} cy={SHOP.y} r={CORE_R} fill="url(#core-fill)" stroke="var(--color-accent)" strokeOpacity="0.5" strokeWidth="1.2" strokeDasharray="4 6" />
                  <text x={SHOP.x} y={SHOP.y + CORE_R - 14} textAnchor="middle" className="fill-accent font-mono text-[11px] uppercase tracking-[0.12em]">
                    Core zone · under 45 min
                  </text>
                </g>

                {/* Highways */}
                {HIGHWAYS.map((h) => {
                  const active = hover === h.id;
                  return (
                    <g key={h.id} className="cursor-pointer" onPointerEnter={() => setHover(h.id)} onPointerLeave={() => setHover(null)}>
                      <path d={h.d} fill="none" stroke="transparent" strokeWidth="22" />
                      <path d={h.d} fill="none" stroke="var(--color-base-0)" strokeWidth={h.kind === "interstate" ? 7 : 5} strokeLinecap="round" strokeLinejoin="round" />
                      <path
                        data-road
                        d={h.d}
                        fill="none"
                        stroke={active ? "var(--color-accent)" : h.kind === "interstate" ? "var(--color-steel-2)" : "var(--color-steel)"}
                        strokeWidth={h.kind === "interstate" ? 3.5 : 2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-[stroke] duration-(--dur-sm)"
                      />
                      <g data-shield transform={`translate(${px(h.labelAt[0], h.labelAt[1]).x} ${px(h.labelAt[0], h.labelAt[1]).y})`}>
                        <rect x="-24" y="-11" width="48" height="22" rx="3" fill={active ? "var(--color-accent)" : "var(--color-surface-3)"} stroke={active ? "var(--color-accent)" : "var(--color-steel)"} className="transition-[fill,stroke] duration-(--dur-sm)" />
                        <text textAnchor="middle" dominantBaseline="central" className={`font-display text-[11px] font-bold ${active ? "fill-on-accent" : "fill-ink"}`} style={{ fontStretch: "110%" }}>
                          {h.label}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Cities */}
                {CITIES.map((c) => {
                  const p = px(c.lon, c.lat);
                  const isShop = c.name === "Bloomington";
                  if (isShop) return null;
                  const anchor = c.anchor ?? "start";
                  return (
                    <g key={c.name} data-city>
                      <circle cx={p.x} cy={p.y} r={c.core ? 4 : 3} fill={c.core ? "var(--color-ink)" : "var(--color-ink-3)"} />
                      <text x={anchor === "end" ? p.x - 8 : p.x + 8} y={p.y + 4} textAnchor={anchor} className={`font-mono text-[11px] tracking-[0.04em] ${c.core ? "fill-ink-2" : "fill-ink-4"}`}>
                        {c.name}
                      </text>
                    </g>
                  );
                })}

                {/* Shop pin */}
                <g data-pin>
                  <circle cx={SHOP.x} cy={SHOP.y} r="16" fill="var(--color-accent)" fillOpacity="0.18" className="motion-safe:animate-[ping-soft_2.4s_var(--ease-soft)_infinite]" style={{ transformOrigin: `${SHOP.x}px ${SHOP.y}px` }} />
                  <circle cx={SHOP.x} cy={SHOP.y} r="7" fill="var(--color-accent)" stroke="var(--color-base-0)" strokeWidth="2" />
                  <text x={SHOP.x - 14} y={SHOP.y + 24} textAnchor="end" className="fill-ink font-display text-[13px] font-bold uppercase tracking-[0.06em]" style={{ fontStretch: "110%" }}>
                    Apex · Bloomington
                  </text>
                  <text x={SHOP.x - 14} y={SHOP.y + 38} textAnchor="end" className="fill-ink-3 font-mono text-[10px] tracking-[0.06em]">
                    17553 Slover Ave.
                  </text>
                </g>
              </svg>

              {/* Hover readout */}
              <div className="absolute bottom-3 left-3 right-3 flex min-h-9 items-center gap-3 rounded-xs border border-line bg-base-1/85 px-3 py-2 text-small backdrop-blur-[2px]" aria-live="polite">
                {hovered ? (
                  <>
                    <span className="font-display font-bold text-accent [font-stretch:110%]">{hovered.label}</span>
                    <span className="text-ink-2">{hovered.eta}</span>
                  </>
                ) : (
                  <span className="text-ink-4">Hover a highway for coverage notes. Dots are cities we run to daily.</span>
                )}
              </div>
            </div>
          </Reveal>

          {/* Coverage list */}
          <div className="lg:col-span-4">
            <Reveal mode="stagger" className="space-y-7">
              <div>
                <h3 className="tech-label mb-3 text-accent">Core zone · under 45 min</h3>
                <p className="text-small text-ink-2">
                  Bloomington, Fontana, Rialto, Colton, San Bernardino, Loma Linda, Redlands, Ontario, Rancho Cucamonga, Jurupa Valley, Riverside.
                </p>
              </div>
              <div>
                <h3 className="tech-label mb-3 text-steel">Extended · 45–90 min</h3>
                <p className="text-small text-ink-2">
                  Moreno Valley, Perris, Corona, Chino, Pomona, Yucaipa, Beaumont, Banning, the Cajon Pass and the truck stops along it.
                </p>
              </div>
              <div>
                <h3 className="tech-label mb-3 text-ink-4">Outside the map?</h3>
                <p className="text-small text-ink-3">
                  Call anyway. We run to the High Desert and the Coachella Valley for fleet accounts and for anyone stuck with a load that cannot wait.
                </p>
              </div>
              <address className="not-italic">
                <h3 className="tech-label mb-3 text-ink-4">The shop</h3>
                <a href={SITE.address.directionsHref} target="_blank" rel="noopener noreferrer" className="block text-body text-ink hover:text-accent">
                  {SITE.address.street}
                  <br />
                  {SITE.address.city}, {SITE.address.region} {SITE.address.postalCode}
                  <span className="mt-1 block text-small text-steel underline underline-offset-4">Directions in Google Maps ↗</span>
                </a>
              </address>
              <div className="pt-1">
                <ButtonLink href={SITE.phone.primary.href} size="md" onClick={() => track("click_to_call", { location: "service_area", number: SITE.phone.primary.e164 })}>
                  <PhoneIcon />
                  {SITE.phone.primary.display}
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
