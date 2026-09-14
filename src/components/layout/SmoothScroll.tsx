"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { ScrollSmoother as ScrollSmootherType } from "gsap/ScrollSmoother";
import { ScrollTrigger, loadScrollSmoother } from "@/lib/motion/gsap";
import { detectDeviceTier } from "@/lib/motion/useDeviceTier";

/**
 * ScrollSmoother provider. One smoother for the whole page.
 *
 * Why ScrollSmoother over Lenis: it is native to ScrollTrigger (pins, scrubs
 * and containerAnimation stay in lockstep with no bridge code), it gives us
 * data-speed parallax for the editorial grid for free, and it is one fewer
 * dependency. Fixed UI (header, call bar) lives OUTSIDE the wrapper.
 *
 * Only created on the "full" tier: touch devices and reduced-motion users get
 * native scrolling — and never download the plugin. ScrollTrigger works
 * identically in both cases.
 */
let smoother: ScrollSmootherType | null = null;

export function SmoothScroll({ children }: { children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (detectDeviceTier() !== "full") return;
    let cancelled = false;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href")!.slice(1);
      const el = id ? document.getElementById(id) : null;
      if (!el || !smoother) return;
      e.preventDefault();
      smoother.scrollTo(el, true, "top top");
      history.replaceState(null, "", `#${id}`);
    };
    loadScrollSmoother().then((ScrollSmoother) => {
      if (cancelled || !wrapper.current || !content.current) return;
      smoother = ScrollSmoother.create({
        wrapper: wrapper.current,
        content: content.current,
        smooth: 1.1,
        effects: true,
        smoothTouch: false,
        normalizeScroll: false,
        ignoreMobileResize: true,
      });
      document.addEventListener("click", onClick);
    });
    return () => {
      cancelled = true;
      document.removeEventListener("click", onClick);
      smoother?.kill();
      smoother = null;
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content" ref={content}>
        {children}
      </div>
    </div>
  );
}

/** Scroll to an element id, using the smoother when present. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (smoother) smoother.scrollTo(el, true, "top top");
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}
