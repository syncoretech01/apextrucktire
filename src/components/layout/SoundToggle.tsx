"use client";

import { toggleSound, useSound } from "@/lib/sound";

/**
 * The music on/off button in the header, left of the 877 call button. Icon +
 * "Sound" label where the header has room (sm–md, xl+); icon only on phones
 * and in the lg band where the full nav is showing. The bars always move (an
 * invitation); colour is the state — white off, orange on. State lives in
 * lib/sound.ts.
 */
export function SoundToggle() {
  const { on } = useSound();
  return (
    <button
      type="button"
      aria-pressed={on}
      title={on ? "Turn background music off" : "Play the Apex brand track"}
      onClick={toggleSound}
      className={`inline-flex h-11 w-11 items-center justify-center gap-2.5 rounded-sm border font-display text-[0.75rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-(--dur-sm) ease-out-quint [font-stretch:112%] sm:w-auto sm:px-3.5 lg:w-11 lg:px-0 xl:w-auto xl:px-3.5 ${
        on ? "border-accent/50 text-ink hover:border-accent" : "border-line text-ink-2 hover:border-line-strong hover:text-ink"
      }`}
    >
      <EqBars on={on} />
      <span className="sr-only sm:not-sr-only lg:sr-only xl:not-sr-only">Sound</span>
    </button>
  );
}

/** Four bars, always bouncing (static under reduced motion). */
const BARS = [
  { h: "h-2", d: "0.9s", delay: "0s" },
  { h: "h-3.5", d: "1.15s", delay: "-0.35s" },
  { h: "h-2.5", d: "0.8s", delay: "-0.6s" },
  { h: "h-3", d: "1.05s", delay: "-0.2s" },
];

function EqBars({ on }: { on: boolean }) {
  return (
    <span className="flex h-3.5 items-end gap-[3px]" aria-hidden="true">
      {BARS.map((b, i) => (
        <span
          key={i}
          className={`w-[3px] origin-bottom rounded-[1px] transition-colors duration-(--dur-md) ease-out-quint motion-safe:animate-eq motion-reduce:scale-y-[0.6] ${b.h} ${
            on ? "bg-accent" : "bg-current"
          }`}
          style={{ animationDuration: b.d, animationDelay: b.delay }}
        />
      ))}
    </span>
  );
}
