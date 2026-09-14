import { SITE } from "@/lib/site";

/**
 * Brand lockup rebuilt as SVG so the mark's apex tip uses the accent token.
 * The original PNG wordmarks live in /public/brand for OG images and print.
 */
export function ApexMark({ className = "", size = 32 }: { className?: string; size?: number }) {
  const h = size;
  const w = size;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Apex tip — accent */}
      <path d="M36 0 H64 L73.5 27 H26.5 Z" fill="var(--color-accent)" />
      {/* Tread stripes */}
      <path d="M22 37 H78 L82.5 50 H17.5 Z" fill="currentColor" />
      <path d="M13.5 60 H86.5 L91 73 H9 Z" fill="currentColor" />
      <path d="M5 83 H95 L100 96 H0 Z" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <ApexMark size={30} className="text-ink" />
      <span className="flex flex-col leading-none">
        <span className="display-wide text-[1.05rem] tracking-[0.12em] text-ink">Apex</span>
        <span className="display-wide text-[0.5rem] tracking-[0.34em] text-ink-3">Truck Tire</span>
      </span>
      <span className="sr-only">{SITE.name}</span>
    </span>
  );
}
