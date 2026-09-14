"use client";

import { useEffect, useRef } from "react";
import { animate, svg, ANIME_EASE, MS } from "@/lib/motion/anime";
import { heroState } from "./heroState";
import { CALLOUTS, type CalloutSpec } from "./wheelConfig";

/**
 * Technical callouts over the 3D scene: a leader line (label → elbow → part
 * anchor) drawn with anime.js as each component reaches its exploded slot.
 * Positions are written straight to the DOM from the scene's frame emitter —
 * no React renders per frame.
 *
 * The list is real content: screen readers get the spec list regardless of
 * scroll state; sighted users see it appear as the wheel explodes.
 */
export function Callouts() {
  const root = useRef<HTMLDivElement>(null);
  const lines = useRef(new Map<string, SVGPolylineElement>());
  const dots = useRef(new Map<string, SVGCircleElement>());
  const labels = useRef(new Map<string, HTMLLIElement>());
  const shown = useRef(new Set<string>());

  useEffect(() => {
    const el = root.current!;
    // Initial hidden state
    labels.current.forEach((li) => {
      li.style.opacity = "0";
    });
    lines.current.forEach((ln) => {
      ln.style.opacity = "0";
    });
    dots.current.forEach((d) => {
      d.style.opacity = "0";
    });

    const show = (c: CalloutSpec) => {
      const line = lines.current.get(c.id)!;
      const li = labels.current.get(c.id)!;
      const dot = dots.current.get(c.id)!;
      line.style.opacity = "1";
      const [drawable] = svg.createDrawable(line);
      if (drawable) {
        animate(drawable, { draw: ["0 0", "0 1"], duration: MS.lg, ease: ANIME_EASE.out });
      }
      animate(dot, { opacity: [0, 1], scale: [0.4, 1], duration: MS.md, ease: ANIME_EASE.out });
      animate(li, {
        opacity: [0, 1],
        translateX: [c.side === "left" ? -10 : 10, 0],
        duration: MS.lg,
        delay: MS.xs,
        ease: ANIME_EASE.out,
      });
    };
    const hide = (c: CalloutSpec) => {
      const line = lines.current.get(c.id)!;
      const li = labels.current.get(c.id)!;
      const dot = dots.current.get(c.id)!;
      const [drawable] = svg.createDrawable(line);
      if (drawable) {
        animate(drawable, { draw: ["0 1", "0 0"], duration: MS.md, ease: ANIME_EASE.snap });
      }
      animate(dot, { opacity: 0, duration: MS.sm, ease: ANIME_EASE.snap });
      animate(li, { opacity: 0, duration: MS.sm, ease: ANIME_EASE.snap });
    };

    const update = () => {
      const { width, height } = heroState.size;
      // Callouts belong to the scroll-driven explode, never the load intro.
      const explode = heroState.introActive ? 0 : heroState.explode;
      const gutter = Math.max(20, Math.min(width * 0.06, 64));

      for (const c of CALLOUTS) {
        const p = heroState.projected.get(c.id);
        const line = lines.current.get(c.id);
        const li = labels.current.get(c.id);
        const dot = dots.current.get(c.id);
        if (!p || !line || !li || !dot) continue;

        // Label placement: fixed column + slot
        const labelW = li.offsetWidth || 180;
        const ly = c.slot * height;
        const lx = c.side === "left" ? gutter : width - gutter - labelW;
        li.style.transform = `translate3d(${lx}px, ${ly - li.offsetHeight / 2}px, 0)`;

        const edgeX = c.side === "left" ? lx + labelW + 8 : lx - 8;
        const elbowX = c.side === "left" ? edgeX + 28 : edgeX - 28;
        line.setAttribute("points", `${edgeX},${ly} ${elbowX},${ly} ${p.x},${p.y}`);
        dot.setAttribute("cx", String(p.x));
        dot.setAttribute("cy", String(p.y));

        // Hysteresis so labels don't flicker at the threshold
        const isShown = shown.current.has(c.id);
        if (!isShown && explode >= c.at) {
          shown.current.add(c.id);
          show(c);
        } else if (isShown && explode < c.at - 0.14) {
          shown.current.delete(c.id);
          hide(c);
        }
      }
    };

    const offFrame = heroState.onFrame(update);
    const offHover = heroState.onHover(() => {
      labels.current.forEach((li, id) => {
        const c = CALLOUTS.find((x) => x.id === id)!;
        li.dataset.active = heroState.hovered === c.part ? "true" : "false";
      });
      lines.current.forEach((ln, id) => {
        const c = CALLOUTS.find((x) => x.id === id)!;
        ln.dataset.active = heroState.hovered === c.part ? "true" : "false";
      });
    });
    void el;
    return () => {
      offFrame();
      offHover();
    };
  }, []);

  return (
    <div ref={root} className="pointer-events-none absolute inset-0 z-10" aria-label="Wheel assembly components">
      <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true" focusable="false">
        {CALLOUTS.map((c) => (
          <g key={c.id}>
            <polyline
              ref={(el) => {
                if (el) lines.current.set(c.id, el);
              }}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-steel data-[active=true]:text-accent transition-colors duration-(--dur-sm)"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              ref={(el) => {
                if (el) dots.current.set(c.id, el);
              }}
              r="3"
              className="fill-accent"
              style={{ transformOrigin: "center", transformBox: "fill-box" }}
            />
          </g>
        ))}
      </svg>
      <ul className="absolute inset-0 m-0 list-none p-0">
        {CALLOUTS.map((c) => (
          <li
            key={c.id}
            ref={(el) => {
              if (el) labels.current.set(c.id, el);
            }}
            className="pointer-events-auto absolute left-0 top-0 w-max max-w-[15rem] rounded-xs border border-line bg-base-1/80 px-3 py-2 backdrop-blur-[2px] transition-colors duration-(--dur-sm) data-[active=true]:border-accent/60"
            onPointerEnter={() => heroState.setHovered(c.part)}
            onPointerLeave={() => heroState.setHovered(null)}
          >
            <span className="tech-label block text-ink">{c.label}</span>
            <span className="mt-0.5 block font-mono text-[0.625rem] leading-snug tracking-[0.04em] text-ink-3">
              {c.spec}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
