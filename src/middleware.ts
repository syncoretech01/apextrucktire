import { NextResponse, type NextRequest } from "next/server";

/**
 * Per-request nonce-based Content-Security-Policy.
 *
 * - No 'unsafe-inline' for scripts. Next.js reads the nonce from the request
 *   CSP header and stamps its own inline/bootstrap scripts with it.
 * - 'strict-dynamic' lets nonce'd scripts (Next runtime, gtag, Turnstile)
 *   load the chunks they need without host allowlists.
 * - 'unsafe-eval' is added ONLY in development for React Fast Refresh /
 *   Turbopack HMR. Production has no eval. See SECURITY.md.
 * - style-src keeps 'unsafe-inline' deliberately: React SSR emits style
 *   attributes and GSAP/anime write inline styles. Attribute styles are not a
 *   script-execution vector. Documented in SECURITY.md.
 */
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV !== "production";

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com https://www.googletagmanager.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://www.googletagmanager.com https://*.google-analytics.com",
    "font-src 'self'",
    "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://challenges.cloudflare.com",
    "frame-src https://challenges.cloudflare.com",
    "worker-src 'self' blob:",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "manifest-src 'self'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Everything except static assets and Next internals.
      source: "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|fonts/|images/|hero-seq/|brand/|robots.txt|sitemap.xml).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
