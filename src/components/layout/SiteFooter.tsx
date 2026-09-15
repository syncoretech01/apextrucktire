"use client";

import { Logo } from "@/components/ui/Logo";
import { ButtonLink, PhoneIcon, ArrowIcon } from "@/components/ui/Button";
import { CTA, SITE } from "@/lib/site";
import { track } from "@/lib/analytics";

const NAV = [
  { href: "#services", label: "Services" },
  { href: "#roadside", label: "Emergency roadside" },
  { href: "#tires", label: "Tires by position" },
  { href: "#service-area", label: "Service area" },
  { href: "#why-apex", label: "Why Apex" },
  { href: "#request-service", label: "Request service" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-line bg-base-1" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Contact Apex Truck Tire
      </h2>

      {/* Compact final CTA */}
      <div className="container-x flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="eyebrow mb-2 text-accent">Downed truck? Don&rsquo;t scroll. Call.</p>
          <p className="display-tight text-display-sm text-ink">One number. Dispatch answers 24/7.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink
            href={SITE.phone.primary.href}
            size="lg"
            onClick={() => track("click_to_call", { location: "footer_cta", number: SITE.phone.primary.e164 })}
          >
            <PhoneIcon className="size-[1.1em]" />
            {CTA.callLabel}
          </ButtonLink>
          <ButtonLink href={CTA.formAnchor} variant="secondary" size="lg">
            {CTA.requestLabel}
            <ArrowIcon className="size-[1em]" />
          </ButtonLink>
        </div>
      </div>

      <div className="tread-strip" aria-hidden="true" />

      {/* NAP + navigation */}
      <div className="container-x grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo height={52} />
          <p className="mt-5 max-w-[30ch] text-small text-ink-3">
            Commercial truck tire service for the Inland Empire freight corridor — roadside, sales and
            installation from Bloomington, CA.
          </p>
        </div>

        <address className="not-italic md:col-span-4">
          <h3 className="eyebrow mb-4">Contact</h3>
          <ul className="space-y-3 text-body">
            <li>
              <span className="tech-label block text-ink-4">Dispatch · 24/7</span>
              <a
                href={SITE.phone.primary.href}
                className="font-display text-[1.375rem] font-bold text-ink [font-stretch:92%] hover:text-accent"
                onClick={() => track("click_to_call", { location: "footer", number: SITE.phone.primary.e164 })}
              >
                {SITE.phone.primary.display}
              </a>
            </li>
            <li>
              <span className="tech-label block text-ink-4">Direct / local</span>
              <a
                href={SITE.phone.local.href}
                className="text-ink-2 hover:text-accent"
                onClick={() => track("click_to_call", { location: "footer_local", number: SITE.phone.local.e164 })}
              >
                {SITE.phone.local.display}
              </a>
            </li>
            <li>
              <span className="tech-label block text-ink-4">Email</span>
              <a href={SITE.email.href} className="text-ink-2 hover:text-accent">
                {SITE.email.display}
              </a>
            </li>
            <li>
              <span className="tech-label block text-ink-4">Shop</span>
              <a
                href={SITE.address.directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-2 hover:text-accent"
              >
                {SITE.address.street}
                <br />
                {SITE.address.city}, {SITE.address.region} {SITE.address.postalCode}
                <span className="mt-1 block text-small text-steel underline underline-offset-4">Get directions ↗</span>
              </a>
            </li>
          </ul>
        </address>

        <div className="md:col-span-2">
          <h3 className="eyebrow mb-4">Hours</h3>
          <dl className="space-y-3 text-small">
            <div>
              <dt className="tech-label text-ink-4">Emergency roadside</dt>
              <dd className="mt-1 text-ink">24 hours · 7 days · 365</dd>
            </div>
            <div>
              <dt className="tech-label text-ink-4">Shop &amp; sales</dt>
              <dd className="mt-1 text-ink-2">
                Mon–Fri 7:00 AM – 6:00 PM
                <br />
                Sat 8:00 AM – 2:00 PM
                <br />
                Sun — roadside only
              </dd>
            </div>
          </dl>
        </div>

        <nav aria-label="Footer" className="md:col-span-2">
          <h3 className="eyebrow mb-4">On this page</h3>
          <ul className="space-y-2 text-small">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="text-ink-2 hover:text-ink">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Legal + credit. Bottom padding clears the StickyCall element so the
          credit is never covered at the end of the page: the mobile bar is
          ~4.75rem + safe-area, the desktop pill sits 1.5rem up and is ~2.75rem tall. */}
      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-3 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] text-micro text-ink-4 md:flex-row md:items-center md:justify-between md:pb-[5.75rem]">
          <p>
            © {year} {SITE.legalName}. Serving {SITE.corridor} · San Bernardino &amp; Riverside Counties.
          </p>
          <p className="flex items-center gap-3 whitespace-nowrap">
            <a href="/.well-known/security.txt" className="transition-colors hover:text-ink-2">
              Security
            </a>
            <span aria-hidden="true">·</span>
            <span>
              Site by{" "}
              <a
                href="https://syncoretech.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent transition-colors hover:text-accent-hot"
              >
                Syncore
              </a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
