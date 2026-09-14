import { SITE } from "@/lib/site";

export function StatusStrip({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="inline-flex items-center gap-2 text-ink">
        <span className="relative inline-flex size-2 rounded-pill bg-live motion-safe:animate-pulse-dot" aria-hidden="true" />
        Dispatching now
      </span>
      <span aria-hidden="true" className="text-ink-4">·</span>
      <span>24 / 7</span>
      <span aria-hidden="true" className="text-ink-4">·</span>
      <span>
        Avg. response under <span className="text-ink">{SITE.status.avgResponseMinutes} min</span>
      </span>
    </div>
  );
}
