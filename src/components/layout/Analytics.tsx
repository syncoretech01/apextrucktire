"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID;
const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID;
const KEY = "apex-consent";
type Consent = "granted" | "denied" | null;

function readConsent(): Consent {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

/**
 * Consent gate + GA4 loader.
 *
 * - Nothing from Google loads until the visitor accepts. Consent Mode v2
 *   defaults are set to "denied" in the nonce'd bootstrap so gtag, once
 *   loaded, starts in the denied state and is updated on acceptance.
 * - Decision is stored in localStorage (no cookie of our own). GA's own
 *   cookies are only ever set after acceptance.
 * - Events fired before load queue in dataLayer (see lib/analytics.ts).
 */
export function Analytics({ nonce }: { nonce?: string }) {
  const [consent, setConsent] = useState<Consent>(null);
  const [decided, setDecided] = useState(true);

  useEffect(() => {
    const c = readConsent();
    setConsent(c);
    setDecided(c !== null);
  }, []);

  if (!GA_ID) return null;

  const decide = (c: Exclude<Consent, null>) => {
    try {
      localStorage.setItem(KEY, c);
    } catch {}
    setConsent(c);
    setDecided(true);
    track("consent_update", { analytics_storage: c });
    window.gtag?.("consent", "update", { analytics_storage: c, ad_storage: c, ad_user_data: c, ad_personalization: c });
  };

  return (
    <>
      {consent === "granted" && (
        <>
          <Script id="ga-bootstrap" nonce={nonce} strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('consent','default',{analytics_storage:'granted',ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'});
gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true,send_page_view:true});${GADS_ID ? `gtag('config','${GADS_ID}');` : ""}
(function(q){for(var i=0;i<q.length;i++){if(Array.isArray(q[i])&&q[i][0]==='event'){gtag.apply(null,q[i]);}}})(window.dataLayer.slice());`}
          </Script>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} nonce={nonce} strategy="afterInteractive" />
        </>
      )}
      {!decided && (
        <div
          role="dialog"
          aria-labelledby="consent-title"
          className="fixed bottom-4 left-4 z-45 max-w-[22rem] rounded-sm border border-line bg-base-1/95 p-4 shadow-panel backdrop-blur-md max-md:bottom-20 max-md:right-4"
        >
          <p id="consent-title" className="text-small font-medium text-ink">
            Count this visit?
          </p>
          <p className="mt-1 text-micro text-ink-3">
            We use Google Analytics to see which pages bring in calls. No ads, no tracking across sites. Nothing loads until you say yes.
          </p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => decide("granted")} className="rounded-sm bg-accent px-3 py-1.5 font-display text-[0.75rem] font-bold uppercase tracking-[0.1em] text-on-accent [font-stretch:110%]">
              Yes
            </button>
            <button type="button" onClick={() => decide("denied")} className="rounded-sm border border-line px-3 py-1.5 font-display text-[0.75rem] font-bold uppercase tracking-[0.1em] text-ink-2 [font-stretch:110%]">
              No thanks
            </button>
          </div>
        </div>
      )}
    </>
  );
}
