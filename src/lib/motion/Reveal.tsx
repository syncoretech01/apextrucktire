"use client";

import { createElement, useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, loadSplitText } from "@/lib/motion/gsap";
import { DUR, EASE, STAGGER } from "@/lib/motion/tokens";

type Props = {
  as?: keyof React.JSX.IntrinsicElements;
  children: ReactNode;
  className?: string;
  /** "lines" splits text (headings). "block" fades/rises the element. "stagger" reveals direct children. */
  mode?: "lines" | "block" | "stagger";
  delay?: number;
  /** ScrollTrigger start. */
  start?: string;
  once?: boolean;
};

/**
 * Generic scroll reveal used by every section. Respects reduced motion via
 * gsap.matchMedia: reduced-motion users get a plain opacity fade with no
 * transforms. Triggers clean themselves up on unmount.
 */
export function Reveal({
  as: Tag = "div",
  children,
  className = "",
  mode = "block",
  delay = 0,
  start = "top 82%",
  once = true,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current!;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (mode === "lines") {
          // SplitText is loaded on demand; hide until it arrives so nothing flashes.
          gsap.set(el, { autoAlpha: 0 });
          let split: { revert: () => void } | null = null;
          let cancelled = false;
          loadSplitText().then((SplitText) => {
            if (cancelled) return;
            const s = SplitText.create(el, { type: "lines", mask: "lines", autoSplit: true });
            split = s;
            gsap.set(el, { autoAlpha: 1 });
            gsap.from(s.lines, {
              yPercent: 100,
              opacity: 0,
              duration: DUR.xl,
              ease: EASE.out,
              stagger: STAGGER.lines,
              delay,
              scrollTrigger: { trigger: el, start, once },
            });
          });
          return () => {
            cancelled = true;
            split?.revert();
          };
        }
        if (mode === "stagger") {
          gsap.from(el.children, {
            y: 26,
            autoAlpha: 0,
            duration: DUR.lg,
            ease: EASE.out,
            stagger: STAGGER.items,
            delay,
            scrollTrigger: { trigger: el, start, once },
          });
          return;
        }
        gsap.from(el, {
          y: 28,
          autoAlpha: 0,
          duration: DUR.lg,
          ease: EASE.out,
          delay,
          scrollTrigger: { trigger: el, start, once },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.from(mode === "stagger" ? el.children : el, {
          autoAlpha: 0,
          duration: DUR.lg,
          ease: "none",
          scrollTrigger: { trigger: el, start, once },
        });
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return createElement(Tag, { ref, className }, children);
}
