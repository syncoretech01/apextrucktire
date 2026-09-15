"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { DUR, EASE, STAGGER } from "@/lib/motion/tokens";
import { SERVICES, type Service } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink, PhoneIcon, ArrowIcon } from "@/components/ui/Button";
import { SITE } from "@/lib/site";
import { track } from "@/lib/analytics";

/**
 * Three full-bleed alternating panels. On desktop each panel pins briefly;
 * the image starts as a small card (Flip.fit computes the transform) and
 * expands to full bleed as the scrub progresses, while the copy staggers in.
 * Mobile and reduced motion: stacked layout with simple fades.
 */
export function Services() {
  return (
    <section id="services" className="scroll-anchor relative bg-base-0 pt-section" aria-labelledby="services-title">
      <div className="container-x pb-section-sm">
        <SectionHeader
          eyebrow="Three service lines. One dispatch line."
          title={<span id="services-title">Roadside, tires, installation — spec&rsquo;d for the corridor.</span>}
          lead="Everything a fleet manager needs from a tire shop, and the one thing a stranded driver needs at 3 a.m.: someone who picks up and shows up."
        />
      </div>
      {SERVICES.map((s, i) => (
        <ServicePanel key={s.id} service={s} flip={i % 2 === 1} />
      ))}
    </section>
  );
}

function ServicePanel({ service, flip }: { service: Service; flip: boolean }) {
  const panel = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    let cancelled = false;

    mm.add("(min-width: 64rem) and (prefers-reduced-motion: no-preference)", () => {
      let ctx: gsap.Context | undefined;
      // Flip is only needed here — loaded on demand, registered once.
      import("gsap/Flip").then(({ Flip }) => {
        if (cancelled || !panel.current) return;
        gsap.registerPlugin(Flip);
        ctx = gsap.context(() => {
          // Card → full-bleed: Flip.fit gives the exact transform to sit the
          // full image inside the small thumb box; we scrub from there to identity.
          const vars = Flip.fit(media.current!, thumb.current!, { scale: true, getVars: true }) as gsap.TweenVars;
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: panel.current,
              start: "top top",
              end: "+=75%",
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
          tl.from(media.current, { ...vars, borderRadius: 10, ease: EASE.scrub, duration: 0.5 }, 0)
            .from(media.current!.querySelector("img"), { scale: 1.18, ease: EASE.scrub, duration: 0.5 }, 0)
            .to({}, { duration: 0.5 });

          gsap.from(copy.current!.querySelectorAll("[data-stagger]"), {
            y: 24,
            autoAlpha: 0,
            duration: DUR.lg,
            ease: EASE.out,
            stagger: STAGGER.items,
            scrollTrigger: { trigger: panel.current, start: "top 55%", once: true },
          });
        }, panel);
      });
      return () => ctx?.revert();
    });

    mm.add("(max-width: 63.99rem), (prefers-reduced-motion: reduce)", () => {
      const ctx = gsap.context(() => {
        gsap.from(copy.current!.querySelectorAll("[data-stagger]"), {
          autoAlpha: 0,
          y: 14,
          duration: DUR.lg,
          stagger: 0.06,
          scrollTrigger: { trigger: copy.current, start: "top 85%", once: true },
        });
      }, panel);
      return () => ctx.revert();
    });

    return () => {
      cancelled = true;
      mm.revert();
    };
  }, []);

  const isCall = service.cta.kind === "call";

  return (
    <article
      ref={panel}
      id={`service-${service.id}`}
      className="relative min-h-svh overflow-hidden border-t border-line bg-base-0"
      aria-labelledby={`service-${service.id}-title`}
    >
      <div className={`grid min-h-svh lg:grid-cols-12 ${flip ? "lg:[direction:rtl]" : ""}`}>
        {/* Media column */}
        <div className="relative lg:col-span-7 [direction:ltr]">
          <div className="relative aspect-[16/11] lg:absolute lg:inset-0 lg:aspect-auto">
            <div ref={media} className="absolute inset-0 origin-top-left overflow-hidden will-change-transform">
              <Image
                src={service.image.src}
                alt={service.image.alt}
                fill
                sizes="(min-width: 64rem) 58vw, 100vw"
                className="object-cover"
                style={{ objectPosition: service.image.position }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-base-0/70 via-transparent to-base-0/30" />
              <div className="absolute inset-0 tread-mask bg-accent/6 mix-blend-screen" />
            </div>
            {/* Thumb target for the Flip (desktop only; invisible) */}
            <div
              ref={thumb}
              aria-hidden="true"
              className="pointer-events-none absolute left-[16%] top-[20%] hidden h-[58%] w-[68%] lg:block"
            />
            <span className="tech-label absolute left-5 top-5 z-10 text-ink-3 lg:left-(--spacing-gutter) lg:top-[calc(var(--nav-height)+1.25rem)]">
              {service.index} — {service.eyebrow}
            </span>
          </div>
        </div>

        {/* Copy column */}
        <div ref={copy} className="relative flex items-center [direction:ltr] lg:col-span-5">
          <div className="w-full px-(--spacing-gutter) py-14 lg:py-[16vh]">
            <p className="eyebrow mb-4 text-accent" data-stagger>
              {service.eyebrow}
            </p>
            <h3 id={`service-${service.id}-title`} className="display-tight text-display-md text-ink" data-stagger>
              {service.title}
            </h3>
            <p className="mt-5 max-w-[38rem] text-body text-ink-2" data-stagger>
              {service.lead}
            </p>

            <div className="mt-8 grid gap-8 sm:grid-cols-[1.2fr_1fr]">
              <div data-stagger>
                <h4 className="tech-label mb-3 text-ink-4">What&rsquo;s included</h4>
                <ul className="space-y-2 text-small text-ink-2">
                  {service.included.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-[0.55em] block size-1.5 shrink-0 bg-accent" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div data-stagger>
                <h4 className="tech-label mb-3 text-ink-4">What to expect</h4>
                <dl className="space-y-3 text-small">
                  {service.expect.map((e) => (
                    <div key={e.label} className="border-l border-line pl-3">
                      <dt className="tech-label text-steel">{e.label}</dt>
                      <dd className="mt-0.5 text-ink-2">{e.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center" data-stagger>
              <ButtonLink
                href={service.cta.href}
                size="lg"
                variant={isCall ? "primary" : "secondary"}
                onClick={() =>
                  isCall
                    ? track("click_to_call", { location: `service_${service.id}`, number: SITE.phone.primary.e164 })
                    : track("cta_request_service", { location: `service_${service.id}` })
                }
              >
                {isCall ? <PhoneIcon className="size-[1.1em]" /> : null}
                {service.cta.label}
                {!isCall ? <ArrowIcon className="size-[1em]" /> : null}
              </ButtonLink>
              {!isCall && (
                <a
                  href={SITE.phone.primary.href}
                  className="text-small text-ink-3 underline decoration-line underline-offset-4 hover:text-ink"
                  onClick={() => track("click_to_call", { location: `service_${service.id}_text`, number: SITE.phone.primary.e164 })}
                >
                  or call {SITE.phone.primary.display}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
