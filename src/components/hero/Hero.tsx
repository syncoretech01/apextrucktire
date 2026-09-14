"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, loadSplitText } from "@/lib/motion/gsap";
import { DUR, EASE, SCRUB, STAGGER } from "@/lib/motion/tokens";
import { useDeviceTier } from "@/lib/motion/useDeviceTier";
import { CTA, SITE } from "@/lib/site";
import { ButtonLink, PhoneIcon, ArrowIcon } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { heroState } from "./heroState";
import { HeroPoster } from "./HeroPoster";
import { StatusStrip } from "./StatusStrip";

// Three.js + R3F never enter the initial bundle.
const HeroScene = dynamic(() => import("./HeroScene").then((m) => m.HeroScene), { ssr: false });
const HeroSequence = dynamic(() => import("./HeroSequence").then((m) => m.HeroSequence), { ssr: false });
const Callouts = dynamic(() => import("./Callouts").then((m) => m.Callouts), { ssr: false });

export function Hero() {
  const tier = useDeviceTier();
  const section = useRef<HTMLElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const copyOuter = useRef<HTMLDivElement>(null);
  const poster = useRef<HTMLDivElement>(null);
  const canvasWrap = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const [mountScene, setMountScene] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const revealTl = useRef<gsap.core.Timeline | null>(null);
  const revealed = useRef(false);

  // Lazy-init the canvas: after the page is idle and the hero is in view.
  useEffect(() => {
    if (tier !== "full") return;
    void loadSplitText(); // warm the chunk; the reveal awaits it after the assembly
    let cancelled = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const start = () => !cancelled && setMountScene(true);
        if ("requestIdleCallback" in window) {
          (window as Window & { requestIdleCallback: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback(start, { timeout: 1200 });
        } else setTimeout(start, 300);
      },
      { rootMargin: "200px" },
    );
    io.observe(section.current!);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [tier]);

  // Copy reveal — runs once, after the assembly snaps together (full tier).
  // If the copy is already visible (phones / reduced motion: see globals.css),
  // there is nothing to reveal — never hide text a driver can already read.
  const revealCopy = (delay = 0) => {
    if (revealed.current || !copy.current) return;
    revealed.current = true;
    const alreadyVisible = getComputedStyle(copy.current).visibility !== "hidden";
    const q = gsap.utils.selector(copy.current);
    const tl = gsap.timeline({ delay, defaults: { ease: EASE.outSoft } });
    revealTl.current = tl;

    if (alreadyVisible) {
      gsap.set(copy.current, { autoAlpha: 1 });
      tl.to(hint.current, { autoAlpha: 1, y: 0, duration: DUR.lg });
      return;
    }
    if (tier === "static") {
      gsap.set(copy.current, { autoAlpha: 1 });
      tl.from(q("[data-reveal]"), { autoAlpha: 0, duration: DUR.lg, stagger: 0.05 }).to(hint.current, { autoAlpha: 1, duration: DUR.lg });
      return;
    }
    // SplitText arrives with the scene chunk on the full tier; the copy stays
    // hidden until the split exists so the characters never flash whole.
    const copyEl = copy.current;
    loadSplitText().then((SplitText) => {
      if (!copyEl?.isConnected || !title.current) return;
      const split = SplitText.create(title.current, { type: "lines,words,chars", mask: "lines", autoSplit: true });
      gsap.set(copyEl, { autoAlpha: 1 });
      tl.from(split.chars, {
        yPercent: 110,
        rotateX: -30,
        opacity: 0,
        duration: DUR.xl,
        ease: EASE.out,
        stagger: { each: STAGGER.chars, from: "start" },
      })
        .from(q("[data-reveal]"), { y: 18, autoAlpha: 0, duration: DUR.lg, stagger: STAGGER.items }, "-=0.55")
        .to(hint.current, { autoAlpha: 1, y: 0, duration: DUR.lg }, "-=0.2");
    });
  };

  // Scene ready → cross-fade poster, run the assembly, then reveal copy
  const onSceneReady = () => {
    setSceneReady(true);
    const tl = gsap.timeline();
    tl.to(canvasWrap.current, { autoAlpha: 1, duration: DUR.lg, ease: "power1.inOut" })
      .to(poster.current, { autoAlpha: 0, duration: DUR.lg, ease: "power1.inOut" }, "<")
      // The snap: exploded → assembled with a mechanical ease and a settle
      .to(
        heroState,
        {
          intro: 0,
          duration: DUR.heroAssemble,
          ease: "apexSnap",
          onUpdate: () => heroState.invalidate(),
          onComplete: () => {
            heroState.introActive = false;
            heroState.invalidate();
          },
        },
        "-=0.15",
      )
      .add(() => revealCopy(0), "-=0.35");
  };

  // Lite / static tiers reveal copy right away — never wait on assets on a phone.
  // Full tier: if the scene has not reported ready within 4s, reveal anyway.
  useEffect(() => {
    if (tier === "lite" || tier === "static") {
      heroState.introActive = false;
      revealCopy(0.2);
      return;
    }
    if (tier === "full") {
      const t = window.setTimeout(() => revealCopy(0), 4000);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier]);

  // Pin + scrub. The explode progress maps 0→1 across the pin.
  useGSAP(
    () => {
      if (tier === "unknown") return;
      const el = section.current!;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // One pinned, scrubbed timeline drives everything: the 3D explode
        // (via progress → heroState) and the DOM exits (hint, then copy).
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "+=170%",
            pin: true,
            pinSpacing: true,
            scrub: SCRUB.hero,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              heroState.scroll = self.progress;
              if (heroState.introActive && self.progress > 0.02) {
                // User scrolled before the intro finished: hand over gracefully.
                gsap.killTweensOf(heroState);
                gsap.to(heroState, {
                  intro: heroState.scroll,
                  duration: DUR.md,
                  ease: EASE.out,
                  onUpdate: () => heroState.invalidate(),
                  onComplete: () => {
                    heroState.introActive = false;
                  },
                });
                revealCopy(0);
              }
              heroState.invalidate();
            },
          },
        });
        // Timeline duration is 1 = full pin distance.
        tl.to(hint.current, { autoAlpha: 0, y: -10, duration: 0.08, ease: EASE.scrub }, 0)
          .to(copyOuter.current, { yPercent: -18, autoAlpha: 0, duration: 0.3, ease: EASE.scrub }, 0.03)
          .to(shade.current, { opacity: 0.35, duration: 0.3, ease: EASE.scrub }, 0.03)
          .to({}, { duration: 0.67 }); // hold: explode continues to 1

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: section, dependencies: [tier] },
  );

  // Pointer parallax (full tier only) — normalized, damped in the scene.
  useEffect(() => {
    if (tier !== "full") return;
    const el = section.current!;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      heroState.pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      heroState.pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1;
      heroState.invalidate();
    };
    const onLeave = () => {
      heroState.pointer.x = 0;
      heroState.pointer.y = 0;
      heroState.invalidate();
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [tier]);

  useEffect(() => () => heroState.reset(), []);

  const showScene = tier === "full" && mountScene && !sceneFailed;

  return (
    <section
      ref={section}
      id="hero"
      className="relative h-svh min-h-[640px] overflow-hidden bg-base-0 text-ink"
      aria-labelledby="hero-title"
    >
      {/* Visual layer */}
      <div className="absolute inset-0" aria-hidden={tier === "full" ? undefined : true}>
        <div ref={poster} className="absolute inset-0 z-0">
          <HeroPoster variant={tier === "static" ? "assembled" : "exploded"} priority className="block h-full w-full" />
        </div>
        {showScene && (
          <div ref={canvasWrap} className="absolute inset-0 z-1 opacity-0" style={{ visibility: "hidden" }}>
            <HeroScene onReady={onSceneReady} onContextLost={() => setSceneFailed(true)} className="!h-full !w-full" />
          </div>
        )}
        {tier === "lite" && <HeroSequence posterRef={poster} />}
        {/* Depth vignette + horizon glow */}
        <div className="pointer-events-none absolute inset-0 z-2 bg-[radial-gradient(70%_60%_at_65%_50%,transparent_0%,rgb(7_9_13/0.55)_100%)]" />
        <div ref={shade} className="pointer-events-none absolute inset-x-0 bottom-0 z-2 h-1/3 bg-linear-to-t from-base-0 to-transparent portrait:h-[62%] portrait:from-base-0 portrait:via-base-0/70" />
      </div>

      {tier === "full" && sceneReady && <Callouts />}

      {/* Copy — outer wrapper exits on scroll, inner wrapper is revealed on load */}
      <div ref={copyOuter} className="relative z-20 h-full">
      <div
        ref={copy}
        className="container-x flex h-full flex-col justify-end pb-[max(7vh,4.5rem)] pt-[calc(var(--nav-height)+2rem)]"
        data-hero-copy
      >
        <div className="max-w-[47rem] portrait:max-w-none">
          <p className="eyebrow mb-5 text-accent" data-reveal>
            Bloomington, CA · I-10 / I-215 / I-15 · Inland Empire
          </p>
          <h1 ref={title} id="hero-title" className="display-tight text-display-xl text-ink">
            Blown tire. Loaded trailer. 3 a.m. We&rsquo;re already rolling.
          </h1>
          <p className="mt-6 max-w-[36rem] text-lead text-ink-2" data-reveal>
            24/7 mobile truck tire service across the Inland Empire freight corridor. One call gets a
            truck dispatched to your shoulder, yard, or dock — with the tire on it.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" data-reveal>
            <ButtonLink
              href={SITE.phone.primary.href}
              size="lg"
              onClick={() => track("click_to_call", { location: "hero", number: SITE.phone.primary.e164 })}
            >
              <PhoneIcon className="size-[1.1em]" />
              {CTA.callLabel}
            </ButtonLink>
            <ButtonLink href={CTA.formAnchor} variant="secondary" size="lg" onClick={() => track("cta_request_service", { location: "hero" })}>
              {CTA.requestLabel}
              <ArrowIcon className="size-[1em] transition-transform duration-(--dur-sm) group-hover/btn:translate-x-0.5" />
            </ButtonLink>
          </div>
          <div data-reveal>
            <StatusStrip className="mt-7" />
          </div>
        </div>
      </div>
      </div>

      {/* Scroll hint */}
      <div
        ref={hint}
        className="pointer-events-none absolute bottom-6 right-(--spacing-gutter) z-20 hidden items-center gap-3 opacity-0 md:flex"
        style={{ visibility: "hidden", transform: "translateY(-8px)" }}
        aria-hidden="true"
      >
        <span className="tech-label">Scroll to explode the assembly</span>
        <span className="relative block h-10 w-px overflow-hidden bg-line-strong">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-accent motion-safe:animate-[scroll-hint_1.8s_var(--ease-in-out-circ)_infinite]" />
        </span>
      </div>
    </section>
  );
}
