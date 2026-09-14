# Motion system

One motion signature for the whole page: every duration and easing comes from a single token scale, shared between CSS (`src/app/globals.css` → `@theme`), GSAP and anime.js (`src/lib/motion/tokens.ts`).

## Tokens

### Durations

| Token | CSS | GSAP (s) | anime.js (ms) | Use |
| --- | --- | --- | --- | --- |
| `xs` | `--dur-xs` 120 ms | `DUR.xs` 0.12 | `MS.xs` | Hover/press feedback |
| `sm` | `--dur-sm` 200 ms | `DUR.sm` 0.2 | `MS.sm` | Color/border transitions, step exits |
| `md` | `--dur-md` 320 ms | `DUR.md` 0.32 | `MS.md` | Default UI motion (GSAP default) |
| `lg` | `--dur-lg` 560 ms | `DUR.lg` 0.56 | `MS.lg` | Reveals, cross-fades |
| `xl` | `--dur-xl` 900 ms | `DUR.xl` 0.9 | `MS.xl` | Headline character reveals, line reveals |
| `xxl` | `--dur-xxl` 1400 ms | `DUR.xxl` 1.4 | `MS.xxl` | Counters, route draws |
| hero | — | `DUR.heroAssemble` 1.7 | — | Load-time assembly snap |

### Easing

| Token | Curve | GSAP | anime.js | Character |
| --- | --- | --- | --- | --- |
| `out` | `cubic-bezier(0.16, 1, 0.3, 1)` | `expo.out` / `"apexOut"` | `outExpo` | Default "arrive" |
| `outSoft` | `cubic-bezier(0.22, 1, 0.36, 1)` | `power4.out` | `outQuart` | Text |
| `inOut` | `cubic-bezier(0.85, 0, 0.15, 1)` | `power3.inOut` / `"apexInOut"` | `inOutCirc` | Weight on both ends |
| `snap` | `cubic-bezier(0.7, 0, 0.2, 1)` | `power4.inOut` / `"apexSnap"` | `inOutQuart` | Mechanical snap (hero assembly, panels) |
| `settle` | — | `back.out(1.4)` | — | Marker pops, ring reveals |
| `scrub` | — | `none` | `linear` | Scroll-driven timelines: the scroll is the ease |

Custom eases `apexOut`, `apexSnap`, `apexInOut` are registered once in `lib/motion/gsap.ts` with the exact CSS beziers.

### Stagger & scrub

`STAGGER`: chars 0.018 · words 0.045 · lines 0.09 · items 0.08 · cards 0.12.
`SCRUB` (seconds of catch-up): tight 0.4 · hero 0.9 · loose 1.4.

## Architecture

- `lib/motion/gsap.ts` — registers gsap core + ScrollTrigger + CustomEase once, sets defaults, exports lazy loaders for **ScrollSmoother** and **SplitText**. Flip (Services), Draggable + InertiaPlugin (Testimonials) are imported on demand inside those components. Result: phones never download the smoother, the splitter or the drag plugins.
- `lib/motion/anime.ts` — the anime.js v4 surface (`animate`, `stagger`, `utils`, `svg`, `createTimeline`). Always imported dynamically (`import("@/lib/motion/anime")`) so it stays out of the initial bundle.
- `lib/motion/Reveal.tsx` — the generic scroll reveal (`lines` | `block` | `stagger`) used by every section header and card. Uses `gsap.matchMedia`: reduced motion gets a plain opacity fade.
- `lib/motion/useDeviceTier.ts` — `full` (WebGL hero, smoother) / `lite` (image sequence; coarse pointer, < 4 GB, < 4 cores, Save-Data, or no WebGL2) / `static` (reduced motion). Resolves on the client; SSR paints the poster.
- `components/layout/SmoothScroll.tsx` — ScrollSmoother on the full tier only (`smooth: 1.1`, `effects: true`). Chosen over Lenis because it is native to ScrollTrigger (pins/scrubs/`containerAnimation` need no bridge), provides `data-speed` parallax for free, and is one fewer dependency. Fixed UI (header, sticky call) lives outside the wrapper.
- Cleanup: every `useGSAP`/effect returns a revert; `gsap.matchMedia().revert()` kills triggers on unmount; the hero resets `heroState` and disposes geometry/materials; Draggable is killed; the sequence canvas cancels its rAF. Nothing animates off-screen: scroll-driven work only runs while its trigger is active, the 3D canvas is `frameloop="demand"`, counters/route draws run once via IntersectionObserver/`once: true`.

## Section-by-section inventory

| Section | Motion | Reduced motion |
| --- | --- | --- |
| **Hero** | Load: poster → canvas cross-fade (`lg`) → assembly snap 1→0 (`heroAssemble`, `apexSnap`) → SplitText chars (`xl`, `out`, stagger chars, masked lines) → lead/CTAs/status (`lg`, stagger items) → scroll hint. Scroll: section pinned for `+=170%`, scrub `SCRUB.hero`; explode 0→1 with staggered part arrival, spin, lug-nut fan-out, camera dolly 6.1→8.3, yaw −0.62→−1.12 rad; hint exits 0–8%, copy exits 3–33%, portrait shade fades. Callouts: leader lines drawn by anime.js `svg.createDrawable` (`lg`), labels slide (`lg`), with hysteresis (show at `at`, hide at `at−0.14`). Hover: part tint + others dim to 0.28 (`md`), labels light up. Pointer parallax damped 0.07/frame. | Static assembled poster, copy visible at first paint, no pin, no canvas. Phones (lite): 32-frame WebP sequence cross-blended on a 2D canvas, assembly plays from frames, scroll scrubs; copy visible at first paint. |
| **Trust bar** | CSS marquee 48 s linear, pauses on hover; counters via anime.js (`xxl` + 120 ms per item, `outExpo`) on first view. | Marquee static; counters render final values. |
| **Services** | Desktop: each panel pins `+=75%`, scrub 0.6; `Flip.fit` computes the card→full-bleed transform, scrubbed over the first 50% with a subtle image scale 1.18→1; copy staggers (`lg`, items) at `top 55%`. | Stacked layout, opacity fades only. |
| **Roadside flow** | Pinned horizontal `containerAnimation` (scrub 1) across 4 steps + end card; SVG route `strokeDashoffset` scrubbed 0.4 ahead; per-step copy staggers and marker pops (`settle`) via `containerAnimation` triggers. Phone number pinned in the top bar. | Vertical stack, fades. |
| **Tire positions** | Hotspot pulse (CSS); on selection anime.js staggers the cards (`lg`, 60 ms) and draws the wheel rings (`xl`, 80 ms). | Instant swap, CSS transitions off. |
| **Service area** | On first view: highways draw (`xxl`, `inOut`, stagger 0.18) → shields pop → cities fade → core ring settles → shop pin settles; pin ping (CSS). Hover highlights a highway + readout. | Everything visible immediately. |
| **Why Apex** | ScrollSmoother `data-speed` 0.9–1.06 parallax on cards/images; block reveals. | No smoother → attributes inert; fades only. |
| **Testimonials** | GSAP Draggable + InertiaPlugin, snap to card positions, buttons/keyboard tween `lg` `out`. | Inertia off, instant snap. |
| **Form** | Step transitions via anime.js (out `sm` `inOutQuart`, in `md` `outExpo`), progress bar `lg` `expo`, error rows animate height via `grid-template-rows` (`md`), success check drawn (`lg`) then lines stagger. | Steps swap instantly; CSS transitions collapse to ~0. |
| **Sticky call** | Translate/opacity `md` `outQuint` on hero exit; hides over the form. | Same, instant. |
| **Global** | Film grain overlay (`animate-grain`, 0.7 s steps), focus rings, button hover `sm`. | Grain static. |

## Tuning the hero explode

All knobs live in `src/components/hero/wheelConfig.ts`; the pin length lives in `Hero.tsx`.

| Knob | Where | Effect |
| --- | --- | --- |
| `PARTS[].explodeZ` | wheelConfig | Distance each part travels along the axle at explode = 1 (+ toward camera). `EXPLODE_CENTER_Z` recenters automatically. |
| `PARTS[].stagger` | wheelConfig | 0–1. Higher = the part starts moving later on the scrub (`t = (explode − 0.22·stagger)/(1 − 0.22)`). |
| `PARTS[].spin` | wheelConfig | Radians of spin about the axle at full explode. |
| `CALLOUTS[].at` | wheelConfig | Explode progress at which a label appears (hides at `at − 0.14`). `slot` = vertical position, `side` = column, `anchor` = local point on the part. |
| `CAMERA.distanceAssembled/Exploded`, `fov` | wheelConfig | Dolly range. Portrait multiplies by `portraitDolly`. |
| `CAMERA.parallaxX/Y`, `parallaxDamp` | wheelConfig | Pointer parallax amplitude (world units) and per-frame lerp. |
| `RIG.yawAssembled/yawExploded`, `pitch`, `offsetXAssembled` | wheelConfig | Landscape composition: how far the face turns as it explodes, and how far right the assembled wheel sits next to the headline. |
| `RIG.portrait.*` | wheelConfig | Portrait composition: the exploded line runs diagonally down the phone (`pitchExploded`), wheel sits above the copy (`offsetY`, `scale`). |
| `COLORS`, `MATERIALS` | wheelConfig / WheelAssembly | Rubber, painted steel (dielectric + clearcoat + anisotropy), hub, nuts, drum, brass. |
| Lights, environment, post | HeroScene | Key 3.0 / fill 0.55 (steel) / rim 3.2 (accent); Lightformer studio env at 0.42; Bloom threshold 1.0 · intensity 0.36; chromatic aberration 0.0007. |
| `end: "+=170%"` | Hero.tsx | Pin length = scroll distance for the full explode. Hint exits at 0–8%, copy at 3–33% of it. |
| `DUR.heroAssemble` | tokens | Length of the load-time snap. |
| `HERO_SEQ.count` | sequence.ts + `--frames` | Phone sequence frame count (32). |

After changing geometry, materials, lighting or rig values: `pnpm dev` then `pnpm render:hero` to regenerate the poster and the phone frames, and `node scripts/brand-assets.mjs` for the OG image.

### Performance guardrails in the hero

- `frameloop="demand"`; frames are requested only by scroll progress, pointer movement (self-sustaining while the parallax settles), hover tweens and the intro tween.
- `dpr={[1, 2]}`, no MSAA on the default framebuffer (`antialias: false`; the composer does 4× multisampling), `powerPreference: high-performance`.
- Canvas mounts after `requestIdleCallback` and only when the hero is within 200 px; poster stays until 4 frames have rendered (environment + shadows settled), then cross-fades.
- Context loss → poster comes back, no canvas.
- Instanced tread (320 instances per tire), a handful of lathes/extrudes; whole scene compiles in one shader pass.
- Three.js/R3F/drei/postprocessing is a lazy chunk (~700 kB raw) that phones and reduced-motion users never request.
