import Image from "next/image";
import wordmark from "../../../public/brand/apex-wordmark-on-dark-1200h.png";
import { SITE } from "@/lib/site";

const RATIO = wordmark.width / wordmark.height; // 3130 / 1200

/**
 * The Apex Truck Tire wordmark — the brand PNG, unchanged, sized per use.
 * Source files: /public/brand (on-dark and on-light variants, icon sizes).
 */
export function Logo({ height = 40, className = "", priority = false }: { height?: number; className?: string; priority?: boolean }) {
  const width = Math.round(height * RATIO);
  return (
    <Image
      src={wordmark}
      alt={SITE.name}
      width={width}
      height={height}
      priority={priority}
      sizes={`${width}px`}
      className={`h-auto w-auto ${className}`}
      style={{ height, width }}
      draggable={false}
    />
  );
}
