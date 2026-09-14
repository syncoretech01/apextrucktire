"use client";

import { useEffect, useState } from "react";

/**
 * "full"   — WebGL hero, ScrollSmoother, all scrubs.
 * "lite"   — coarse pointer / low memory / few cores: pre-rendered image
 *            sequence scrubbed on scroll instead of the 3D canvas.
 * "static" — prefers-reduced-motion: assembled poster, simple fades only.
 *
 * Resolves on the client after mount; "unknown" during SSR/first paint so the
 * poster image is always what paints first (it is the LCP element).
 */
export type DeviceTier = "unknown" | "full" | "lite" | "static";

type NavigatorExt = Navigator & { deviceMemory?: number };

export function detectDeviceTier(): DeviceTier {
  if (typeof window === "undefined") return "unknown";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "static";

  const nav = navigator as NavigatorExt;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory < 4;
  const fewCores = typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency < 4;
  const saveData = "connection" in nav && Boolean((nav as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

  if (coarse || lowMemory || fewCores || saveData) return "lite";

  // WebGL2 must exist for the full tier.
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!gl) return "lite";
    const ext = gl.getExtension("WEBGL_lose_context");
    ext?.loseContext();
  } catch {
    return "lite";
  }
  return "full";
}

export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>("unknown");
  useEffect(() => {
    setTier(detectDeviceTier());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setTier(detectDeviceTier());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return tier;
}
