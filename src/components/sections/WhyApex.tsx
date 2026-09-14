import Image from "next/image";
import { DIFFERENTIATORS } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/lib/motion/Reveal";

/**
 * Asymmetric editorial grid. Parallax depth comes from ScrollSmoother
 * `data-speed` / `data-lag` effects (desktop only — the smoother is not created
 * on touch or reduced-motion, so these attributes are inert there). Restraint:
 * fades and a little depth, nothing more.
 */
export function WhyApex() {
  const [d1, d2, d3, d4, d5] = DIFFERENTIATORS;
  return (
    <section id="why-apex" className="scroll-anchor relative border-t border-line bg-base-0 py-section" aria-labelledby="why-title">
      <div className="container-x">
        <SectionHeader
          eyebrow="Why fleets keep the number"
          title={<span id="why-title">Not a discount shop. Not a call center. A tire operation.</span>}
        />

        <div className="mt-16 grid gap-6 md:grid-cols-12 md:gap-8">
          {/* Row 1 */}
          <Reveal className="md:col-span-5 md:row-span-2" >
            <div data-speed="0.92" className="relative aspect-[4/5] overflow-hidden rounded-sm border border-line">
              <Image src="/images/why/yard.jpg" alt="The Apex yard on Slover Ave. at dusk with service trucks lined up" fill sizes="(min-width: 48rem) 40vw, 100vw" className="object-cover" />
              <span className="tech-label absolute left-4 top-4 text-ink-3">Slover Ave. yard</span>
            </div>
          </Reveal>

          <Card d={d1!} className="md:col-span-7" speed="1.04" />
          <Card d={d2!} className="md:col-span-4" speed="1.0" />
          <Card d={d3!} className="md:col-span-3" speed="0.97" />

          {/* Row 2 */}
          <Reveal className="md:col-span-7">
            <div data-speed="1.06" className="relative aspect-[16/10] overflow-hidden rounded-sm border border-line">
              <Image src="/images/why/truck.jpg" alt="Apex mobile service truck with crane and tire rack, work lights on" fill sizes="(min-width: 48rem) 55vw, 100vw" className="object-cover" />
              <span className="tech-label absolute left-4 top-4 text-ink-3">Service truck · unit 3</span>
            </div>
          </Reveal>
          <Card d={d4!} className="md:col-span-5" speed="0.95" />

          <Card d={d5!} className="md:col-span-7" speed="1.02" />
          <Reveal className="md:col-span-5">
            <div data-speed="0.9" className="relative aspect-square overflow-hidden rounded-sm border border-line">
              <Image src="/images/why/detail.jpg" alt="Close-up of a calibrated torque wrench on a wheel nut" fill sizes="(min-width: 48rem) 40vw, 100vw" className="object-cover" />
              <span className="tech-label absolute left-4 top-4 text-ink-3">450–500 ft·lb, every wheel</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Card({ d, className = "", speed }: { d: (typeof DIFFERENTIATORS)[number]; className?: string; speed: string }) {
  return (
    <Reveal className={className}>
      <article data-speed={speed} className="flex h-full flex-col justify-between gap-8 rounded-sm border border-line bg-surface p-6 shadow-panel md:p-8">
        <span className="font-display text-[0.8rem] font-bold text-accent [font-stretch:110%]">{d.n}</span>
        <div>
          <h3 className="display-tight text-display-sm text-ink">{d.title}</h3>
          <p className="mt-3 text-body text-ink-2">{d.body}</p>
        </div>
      </article>
    </Reveal>
  );
}
