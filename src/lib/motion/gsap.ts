"use client";

/**
 * Registers the core GSAP plugins once and re-exports gsap. Import gsap from
 * here everywhere on the client — never from "gsap" directly — so plugin
 * registration and the global defaults happen exactly once.
 *
 * Only gsap core + ScrollTrigger + CustomEase are in the initial bundle.
 * ScrollSmoother, SplitText, Flip, Draggable and InertiaPlugin are imported
 * on demand by the components that need them (SmoothScroll, Hero, Reveal,
 * Services, Testimonials) via loadPlugin(), so phones — which never run the
 * smoother or the character reveals — never download them.
 *
 * License: GSAP 3.13+ (incl. SplitText, ScrollSmoother, Flip, Draggable,
 * InertiaPlugin) ships free under the Webflow "no charge" license in the
 * public npm package. No auth token is required or used. See MOTION.md.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { DUR, EASE } from "./tokens";

let registered = false;

if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  // Custom eases mirroring the CSS tokens exactly
  CustomEase.create("apexOut", "0.16, 1, 0.3, 1");
  CustomEase.create("apexSnap", "0.7, 0, 0.2, 1");
  CustomEase.create("apexInOut", "0.85, 0, 0.15, 1");
  gsap.defaults({ ease: EASE.out, duration: DUR.md });
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

/** Lazy plugin loaders — each resolves once and registers the plugin. */
export const loadSplitText = () =>
  import("gsap/SplitText").then(({ SplitText }) => {
    gsap.registerPlugin(SplitText);
    return SplitText;
  });
export const loadScrollSmoother = () =>
  import("gsap/ScrollSmoother").then(({ ScrollSmoother }) => {
    gsap.registerPlugin(ScrollSmoother);
    return ScrollSmoother;
  });

export { gsap, ScrollTrigger, CustomEase };
