import Image from "next/image";
import { SITE } from "@/lib/site";

/** The 480 px-tall brand PNG (28 kB, alpha) — plenty for ≤ 52 px display at 3× DPR. */
const WORDMARK = { src: "/brand/apex-wordmark-on-dark-480h.png", width: 1252, height: 480 };
const RATIO = WORDMARK.width / WORDMARK.height;

/**
 * The Apex Truck Tire wordmark — the brand PNG, unchanged, sized per use and
 * served as-is (no resizing). Source files: /public/brand (on-dark and
 * on-light variants, icon sizes).
 */
export function Logo({ height = 40, className = "", priority = false }: { height?: number; className?: string; priority?: boolean }) {
  const width = Math.round(height * RATIO);
  return (
    <Image
      src={WORDMARK.src}
      alt={SITE.name}
      width={width}
      height={height}
      priority={priority}
      unoptimized
      className={`h-auto w-auto ${className}`}
      style={{ height, width }}
      draggable={false}
    />
  );
}
