"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";
import { DUR, EASE, STAGGER } from "@/lib/motion/tokens";
import { ROADSIDE_STEPS } from "@/lib/content";
import { SITE } from "@/lib/site";
import { ButtonLink, PhoneIcon } from "@/components/ui/Button";
import { track as trackEvent } from "@/lib/analytics";

const STEP_W = 1000; // viewBox units per step
// Passes through each step marker (x = i*1000 + 160, y = 100) with gentle sweeps.
const ROUTE_PATH =
  "M 160 100 C 520 100, 640 30, 1160 100 S 1720 172, 2160 100 S 2720 28, 3160 100 S 3700 160, 4400 90";

/**
 * Four-step sequence: Call → Locate → Dispatch → Rolling.
 * Desktop: pinned, horizontally scrolled (containerAnimation); the SVG route
 * draws across the track as you scroll; each step's copy reveals when it
 * enters from the right. The phone number sits in the pinned top bar so it
 * never leaves the screen. Mobile / reduced motion: vertical stack.
 */
export function RoadsideFlow() {
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const route = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 64rem) and (prefers-reduced-motion: no-preference)", () => {
        const t = track.current!;
        const path = route.current!;
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });

        const distance = () => t.scrollWidth - viewport.current!.clientWidth;
        const scrollTween = gsap.to(t, {
          x: () => -distance(),
          ease: EASE.scrub,
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance() + window.innerHeight * 0.4}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Route draws in lockstep with the horizontal scroll (slightly ahead).
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: EASE.scrub,
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 0.4,
            invalidateOnRefresh: true,
          },
        });

        // Each step reveals as it enters from the right
        t.querySelectorAll<HTMLElement>("[data-step]").forEach((step) => {
          gsap.from(step.querySelectorAll("[data-stagger]"), {
            y: 30,
            autoAlpha: 0,
            duration: DUR.lg,
            ease: EASE.out,
            stagger: STAGGER.items,
            scrollTrigger: { trigger: step, containerAnimation: scrollTween, start: "left 75%", once: true },
          });
          const marker = step.querySelector("[data-marker]");
          if (marker) {
            gsap.from(marker, {
              scale: 0,
              duration: DUR.md,
              ease: EASE.settle,
              scrollTrigger: { trigger: step, containerAnimation: scrollTween, start: "left 60%", once: true },
            });
          }
        });
      });

      mm.add("(max-width: 63.99rem), (prefers-reduced-motion: reduce)", () => {
        track.current!.querySelectorAll<HTMLElement>("[data-step]").forEach((step) => {
          gsap.from(step.querySelectorAll("[data-stagger]"), {
            autoAlpha: 0,
            y: 12,
            duration: DUR.lg,
            stagger: 0.06,
            scrollTrigger: { trigger: step, start: "top 85%", once: true },
          });
        });
      });

      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section
      ref={section}
      id="roadside"
      className="scroll-anchor relative overflow-hidden border-t border-line bg-base-1 lg:pt-(--nav-height)"
      aria-labelledby="roadside-title"
    >
      {/* Pinned top bar — phone visible throughout */}
      <div className="container-x flex min-h-[5.5rem] flex-wrap items-center justify-between gap-4 border-b border-line py-4">
        <div>
          <p className="eyebrow text-accent">Emergency roadside · how a call goes</p>
          <h2 id="roadside-title" className="display-tight mt-1 text-display-sm text-ink">
            Call to rolling in four moves.
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3 md:inline">
            Stranded now? Skip the reading.
          </span>
          <ButtonLink
            href={SITE.phone.primary.href}
            size="md"
            onClick={() => trackEvent("click_to_call", { location: "roadside_bar", number: SITE.phone.primary.e164 })}
          >
            <PhoneIcon />
            {SITE.phone.primary.display}
          </ButtonLink>
        </div>
      </div>

      {/* Horizontal viewport */}
      <div ref={viewport} className="relative lg:h-[calc(100svh-5.5rem-var(--nav-height))]">
        <div ref={track} className="relative flex flex-col lg:h-full lg:w-max lg:flex-row">
          {/* Route line — spans the whole track on desktop */}
          <svg
            className="pointer-events-none absolute left-0 hidden h-[200px] lg:block"
            style={{ width: `${((STEP_W * ROADSIDE_STEPS.length + 400) / STEP_W) * 26}rem`, top: "calc(12vh - 76px)" }}
            viewBox={`0 0 ${STEP_W * ROADSIDE_STEPS.length + 400} 200`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d={ROUTE_PATH} fill="none" stroke="var(--color-line-strong)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeDasharray="6 10" />
            <path ref={route} d={ROUTE_PATH} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
          </svg>

          <ol className="contents">
            {ROADSIDE_STEPS.map((s, i) => (
              <li
                key={s.n}
                data-step
                className="relative flex w-full flex-col border-b border-line px-(--spacing-gutter) py-14 lg:h-full lg:w-[26rem] lg:justify-start lg:border-b-0 lg:border-r lg:pt-[12vh] lg:pb-0"
              >
                <div className="relative z-10 max-w-[22rem]">
                  <div className="mb-6 flex items-center gap-4">
                    <span
                      data-marker
                      className="relative flex size-12 shrink-0 items-center justify-center rounded-pill border border-accent bg-base-0 font-display text-[1rem] font-bold text-accent [font-stretch:110%]"
                      aria-hidden="true"
                    >
                      {s.n}
                      {i === ROADSIDE_STEPS.length - 1 && (
                        <span className="absolute inset-0 rounded-pill motion-safe:animate-pulse-accent" />
                      )}
                    </span>
                    <span className="tech-label text-ink-4">Step {i + 1} of {ROADSIDE_STEPS.length}</span>
                  </div>
                  <h3 className="display-tight text-display-md text-ink" data-stagger>
                    {s.title}
                  </h3>
                  <p className="mt-4 text-body text-ink-2" data-stagger>
                    {s.body}
                  </p>
                  <p className="mt-4 border-l-2 border-accent pl-3 text-small text-ink-3" data-stagger>
                    {s.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {/* End card: the CTA the whole sequence leads to */}
          <div className="relative flex w-full flex-col bg-surface px-(--spacing-gutter) py-14 lg:h-full lg:w-[30rem] lg:justify-start lg:pt-[12vh] lg:pb-0" data-step>
            <div className="relative z-10 max-w-[22rem]">
              <p className="eyebrow mb-3 text-accent" data-stagger>
                That&rsquo;s the whole process
              </p>
              <p className="display-tight text-display-md text-ink" data-stagger>
                One call. We handle the rest.
              </p>
              <p className="mt-4 text-body text-ink-2" data-stagger>
                Dispatch is staffed around the clock, 365 days. Save the number before you need it.
              </p>
              <div className="mt-7" data-stagger>
                <ButtonLink
                  href={SITE.phone.primary.href}
                  size="lg"
                  onClick={() => trackEvent("click_to_call", { location: "roadside_end", number: SITE.phone.primary.e164 })}
                >
                  <PhoneIcon className="size-[1.1em]" />
                  Call {SITE.phone.primary.display}
                </ButtonLink>
              </div>
              <a
                href={SITE.phone.local.href}
                className="mt-4 block font-mono text-[0.75rem] tracking-[0.06em] text-ink-3 hover:text-ink"
                data-stagger
                onClick={() => trackEvent("click_to_call", { location: "roadside_end_local", number: SITE.phone.local.e164 })}
              >
                Direct line {SITE.phone.local.display}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
