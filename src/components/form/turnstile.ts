"use client";

/**
 * Minimal Cloudflare Turnstile client wrapper (no dependency). The script tag
 * is rendered server-side with the CSP nonce (see app/page.tsx); this waits
 * for the global, renders an invisible widget, and resolves tokens.
 */
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
      execute: (id?: string) => void;
    };
  }
}

/** Cloudflare's always-pass test site key, development only. */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

export function waitForTurnstile(timeoutMs = 10_000): Promise<NonNullable<Window["turnstile"]>> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (window.turnstile) return resolve(window.turnstile);
      if (Date.now() - start > timeoutMs) return reject(new Error("turnstile_unavailable"));
      setTimeout(tick, 100);
    };
    tick();
  });
}

export type TurnstileHandle = { id: string; remove: () => void; reset: () => void };

export async function renderTurnstile(
  el: HTMLElement,
  onToken: (token: string) => void,
  onExpire: () => void,
  onError: () => void,
): Promise<TurnstileHandle> {
  const ts = await waitForTurnstile();
  const id = ts.render(el, {
    sitekey: TURNSTILE_SITE_KEY,
    appearance: "interaction-only",
    execution: "render",
    theme: "dark",
    size: "flexible",
    action: "inquiry",
    callback: onToken,
    "expired-callback": onExpire,
    "error-callback": onError,
    "timeout-callback": onExpire,
  });
  return { id, remove: () => ts.remove(id), reset: () => ts.reset(id) };
}
