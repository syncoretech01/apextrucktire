"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";
import { track } from "@/lib/analytics";
import { PhoneIcon } from "@/components/ui/Button";

/**
 * Persistent click-to-call: a bottom bar on mobile, a floating button on
 * desktop. Appears after the hero leaves the viewport; hides while the form
 * section is on screen so it never covers the form.
 */
export function StickyCall() {
  const [pastHero, setPastHero] = useState(false);
  const [overForm, setOverForm] = useState(false);
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const hero = document.getElementById("hero");
    const form = document.querySelector("[data-form-section]");
    if (hero) {
      const io = new IntersectionObserver(([e]) => setPastHero(!e!.isIntersecting), { threshold: 0, rootMargin: "-25% 0px 0px 0px" });
      io.observe(hero);
      observers.push(io);
    }
    if (form) {
      const io = new IntersectionObserver(([e]) => setOverForm(e!.isIntersecting), { threshold: 0.05 });
      io.observe(form);
      observers.push(io);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const visible = pastHero && !overForm;

  return (
    <>
      {/* Mobile bottom bar */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-base-0/90 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-[transform,opacity] duration-(--dur-md) ease-out-quint md:hidden ${
          visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
        }`}
        aria-hidden={!visible}
      >
        <a
          href={SITE.phone.primary.href}
          tabIndex={visible ? 0 : -1}
          className="flex h-13 items-center justify-center gap-3 rounded-sm bg-accent font-display text-[0.9rem] font-bold uppercase tracking-[0.08em] text-on-accent [font-stretch:110%] shadow-glow-accent"
          onClick={() => track("click_to_call", { location: "sticky_mobile", number: SITE.phone.primary.e164 })}
        >
          <PhoneIcon className="size-5" />
          Call dispatch · {SITE.phone.primary.display}
        </a>
      </div>

      {/* Desktop floating button */}
      <a
        href={SITE.phone.primary.href}
        tabIndex={visible ? 0 : -1}
        aria-hidden={!visible}
        className={`fixed bottom-6 right-6 z-40 hidden items-center gap-3 rounded-pill bg-accent py-3 pl-4 pr-5 font-display text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-on-accent shadow-glow-accent transition-[transform,opacity] duration-(--dur-md) ease-out-quint [font-stretch:110%] hover:bg-accent-hot md:flex ${
          visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
        onClick={() => track("click_to_call", { location: "sticky_desktop", number: SITE.phone.primary.e164 })}
      >
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full rounded-pill bg-on-accent/60 motion-safe:animate-ping" />
          <span className="relative inline-flex size-2 rounded-pill bg-on-accent" />
        </span>
        <PhoneIcon />
        {SITE.phone.primary.display}
      </a>
    </>
  );
}
