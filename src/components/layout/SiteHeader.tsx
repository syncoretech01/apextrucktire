"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink, PhoneIcon } from "@/components/ui/Button";
import { SITE } from "@/lib/site";
import { track } from "@/lib/analytics";
import { SoundToggle } from "@/components/layout/SoundToggle";

const NAV = [
  { href: "#services", label: "Services" },
  { href: "#roadside", label: "Roadside" },
  { href: "#tires", label: "Tires" },
  { href: "#service-area", label: "Service area" },
  { href: "#request-service", label: "Request service" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        ticking.current = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-(--nav-height) transition-[background-color,border-color,backdrop-filter] duration-(--dur-md) ease-out-quint ${
        scrolled || open ? "border-b border-line bg-base-0/80 backdrop-blur-md" : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container-x flex h-full items-center justify-between gap-4 xl:gap-6">
        <a href="#hero" className="shrink-0" aria-label={`${SITE.name} home`}>
          <span className="block sm:hidden">
            <Logo height={30} priority />
          </span>
          <span className="hidden sm:block">
            <Logo height={38} priority />
          </span>
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-4 xl:gap-7">
            {NAV.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  className="whitespace-nowrap font-display text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-ink-2 [font-stretch:112%] transition-colors duration-(--dur-sm) hover:text-ink"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <SoundToggle />
          <div className="hidden sm:flex">
            <ButtonLink
              href={SITE.phone.primary.href}
              size="md"
              onClick={() => track("click_to_call", { location: "header", number: SITE.phone.primary.e164 })}
            >
              <PhoneIcon />
              {SITE.phone.primary.display}
            </ButtonLink>
          </div>
          <div className="flex sm:hidden">
            <a
              href={SITE.phone.primary.href}
              className="inline-flex size-11 items-center justify-center rounded-sm bg-accent text-on-accent"
              aria-label={`Call ${SITE.phone.primary.display}`}
              onClick={() => track("click_to_call", { location: "header_mobile", number: SITE.phone.primary.e164 })}
            >
              <PhoneIcon className="size-5" />
            </a>
          </div>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-sm border border-line text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-line bg-base-0/95 backdrop-blur-md lg:hidden"
      >
        <nav aria-label="Mobile" className="container-x py-4">
          <ul className="flex flex-col">
            {NAV.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-line py-4 font-display text-[0.9rem] font-semibold uppercase tracking-[0.14em] text-ink [font-stretch:112%] last:border-0"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <a href={SITE.phone.local.href} className="mt-4 block font-mono text-[0.75rem] tracking-[0.06em] text-ink-3">
            Local line {SITE.phone.local.display}
          </a>
        </nav>
      </div>
    </header>
  );
}
