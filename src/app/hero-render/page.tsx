import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { RenderClient } from "./RenderClient";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Development-only render tool used by scripts/render-hero.mjs to capture the
 * poster and the lite-tier image sequence from the exact same scene.
 * 404s in production.
 */
export default function HeroRenderPage() {
  if (process.env.NODE_ENV === "production" && process.env.HERO_RENDER_TOOL !== "1") notFound();
  return <RenderClient />;
}
