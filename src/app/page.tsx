import Script from "next/script";
import { headers } from "next/headers";
import { Hero } from "@/components/hero/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { Services } from "@/components/sections/Services";
import { RoadsideFlow } from "@/components/sections/RoadsideFlow";
import { TirePositions } from "@/components/sections/TirePositions";
import { ServiceArea } from "@/components/sections/ServiceArea";
import { WhyApex } from "@/components/sections/WhyApex";
import { Testimonials } from "@/components/sections/Testimonials";
import { InquirySection } from "@/components/sections/InquirySection";

export default async function HomePage() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <>
      <Hero />
      <TrustBar />
      <Services />
      <RoadsideFlow />
      <TirePositions />
      <ServiceArea />
      <WhyApex />
      <Testimonials />
      <InquirySection />
      {/* Turnstile loads lazily with the CSP nonce; the form renders the widget explicitly. */}
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" nonce={nonce} strategy="lazyOnload" />
    </>
  );
}
