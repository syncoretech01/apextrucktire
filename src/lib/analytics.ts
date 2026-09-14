"use client";

/**
 * Conversion instrumentation. Everything funnels through track() so the event
 * names are documented in one place (README → Analytics).
 *
 * gtag is a stub until the visitor grants consent (see ConsentGate); events
 * fired before that queue in dataLayer and flush when gtag.js loads.
 */
export type EventName =
  | "click_to_call"
  | "cta_request_service"
  | "form_start"
  | "form_step"
  | "form_step_dropoff"
  | "form_submit"
  | "form_success"
  | "form_error"
  | "consent_update";

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(name: EventName, params: Params = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  if (typeof window.gtag === "function") window.gtag("event", name, params);
  else window.dataLayer.push(["event", name, params]);
  if (process.env.NODE_ENV !== "production") console.debug("[track]", name, params);
}

/**
 * Google Ads conversion hook. Fires only when NEXT_PUBLIC_GADS_ID and the
 * matching label are configured; otherwise a no-op.
 */
export function trackConversion(kind: "form" | "call") {
  const id = process.env.NEXT_PUBLIC_GADS_ID;
  const label = kind === "form" ? process.env.NEXT_PUBLIC_GADS_LABEL_FORM : process.env.NEXT_PUBLIC_GADS_LABEL_CALL;
  if (!id || !label || typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", { send_to: `${id}/${label}` });
}
