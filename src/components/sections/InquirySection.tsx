import { SITE } from "@/lib/site";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/lib/motion/Reveal";
import { FormLoader } from "@/components/form/FormLoader";

export function InquirySection() {
  return (
    <section id="request-service" className="scroll-anchor relative border-t border-line bg-base-0 py-section" aria-labelledby="inquiry-title" data-form-section>
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <SectionHeader
            eyebrow="Request service"
            title={<span id="inquiry-title">Tell us what&rsquo;s down. We&rsquo;ll take it from there.</span>}
            lead="Two minutes for a quote or a scheduled install. Thirty seconds if the truck is on the shoulder — pick Emergency and we cut the form down to a phone number and a location."
          />
          <Reveal mode="stagger" className="mt-10 space-y-5">
            <div className="border-l-2 border-accent pl-4">
              <p className="tech-label text-ink-4">Roadside now</p>
              <a href={SITE.phone.primary.href} className="mt-1 block font-display text-[1.5rem] font-bold text-ink [font-stretch:92%] hover:text-accent">
                {SITE.phone.primary.display}
              </a>
            </div>
            <div className="border-l-2 border-line pl-4">
              <p className="tech-label text-ink-4">Direct / shop</p>
              <a href={SITE.phone.local.href} className="mt-1 block text-body text-ink-2 hover:text-ink">
                {SITE.phone.local.display}
              </a>
            </div>
            <div className="border-l-2 border-line pl-4">
              <p className="tech-label text-ink-4">Email</p>
              <a href={SITE.email.href} className="mt-1 block text-body text-ink-2 hover:text-ink">
                {SITE.email.display}
              </a>
            </div>
            <p className="text-small text-ink-4">
              What happens next: a dispatcher or tire specialist calls or texts the number you give us. Emergencies go straight to the on-call truck.
            </p>
          </Reveal>
        </div>
        <Reveal className="lg:col-span-7">
          <div className="rounded-sm border border-line bg-surface p-6 shadow-panel md:p-9">
            <FormLoader />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
