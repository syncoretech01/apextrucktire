# Security

What is implemented, where, and what was deliberately deferred. Report issues to admin@apextrucktire.com (see `/.well-known/security.txt`).

## Inquiry form and endpoint

| Measure | Implementation |
| --- | --- |
| Server-side validation | `src/lib/inquirySchema.ts` (Zod, shared) is re-run on the server in `app/api/inquiry/route.ts` — payload shape first (`inquiryPayload`), then fields incl. cross-field rules (`inquirySchema`). Strict enums for service type / urgency, max lengths on every string (name 80, company 120, phone 32, email 254, location 200, message 2000, Turnstile token 4096), phone must be 10–15 digits, email must parse or be empty. Client validation is a convenience only. |
| Body limits | JSON only (`415` otherwise); body read as text and rejected above 16 KB (`413`) before parsing. |
| Rate limiting | `src/lib/server/ratelimit.ts` — Upstash `Ratelimit.slidingWindow(5, "10 m")`, keyed **separately** by client IP (`x-forwarded-for` first hop) and by a coarse device fingerprint (SHA-256 of UA + Accept-Language + `sec-ch-ua` + IP /24 or /64 prefix). Both must pass. Token issuance is limited to 30 / 10 min per IP to stop token farming. **Fails closed**: unconfigured or unreachable Redis → `503` in production. Development without Upstash uses an in-memory window so `pnpm dev` works. |
| Cloudflare Turnstile | Invisible widget rendered explicitly by `components/form/turnstile.ts` (`appearance: interaction-only`), verified server-side against `siteverify` with the client IP (`lib/server/turnstile.ts`, 6 s timeout). Production without `TURNSTILE_SECRET_KEY` → `503`. Dev uses Cloudflare's documented test keys. reCAPTCHA is not used. |
| Honeypot | Hidden `website` field (off-screen, `tabindex=-1`, `autocomplete=off`). If filled, the server logs and returns a **fake `200`** so bots learn nothing. |
| Minimum time-to-submit | The signed form token carries its issue time; submissions younger than **2 s** are rejected (`403`). Tokens older than 4 h are rejected as expired (client silently refreshes and asks the user to resend). |
| CSRF — origin | `Origin` must match `NEXT_PUBLIC_SITE_URL` or the request's own host; if `Sec-Fetch-Site` is present it must be `same-origin`. Otherwise `403`. |
| CSRF — same-site token | `GET /api/form-token` issues `issuedAt.nonce.HMAC-SHA256(secret)`, stored in an **HttpOnly, Secure (prod), SameSite=Strict, Path=/api** cookie *and* returned in the body. The client echoes it in `X-Form-Token`; the server requires header == cookie (constant-time compare) and a valid signature. `FORM_TOKEN_SECRET` is mandatory in production (`503` otherwise). |
| Header-injection prevention | `lib/server/sanitize.ts`: every value that reaches a mail header (subject, reply-to, recipient) goes through `headerSafe()` which strips C0/C1 control characters incl. CR/LF and U+2028/2029 and caps length. Verified by `scripts/smoke-api.mjs` (a name containing `\r\nBcc:` is flattened). |
| HTML escaping | All template interpolations use `escapeHtml()`; multi-line message bodies use `bodySafe()` (control chars stripped → escaped → newlines to `<br>`). Plain-text alternative is always sent. |
| Generic errors | Clients receive one of four fixed messages plus, for validation, `{ field: message }`. Reasons (bad origin, token state, limiter, Turnstile codes, delivery errors) are logged server-side only. |
| Delivery | Resend SDK. Notification to `EMAIL_TO` (default admin@apextrucktire.com) with `Reply-To` set to the sanitized visitor email; acknowledgement to the visitor is best-effort and cannot fail the request. Without `RESEND_API_KEY` production returns `502`; development logs to the console. |
| Method handling | `GET /api/inquiry` → `405` with `Allow: POST`. All API responses are `Cache-Control: no-store`. |

Order of checks in the route (cheapest first, nothing expensive before authentication of the request): origin → content-type → token → rate limits → body size/shape → honeypot → field validation → Turnstile → delivery.

## Headers and transport

Set in `next.config.ts` (static) and `src/middleware.ts` (per-request nonce).

| Header | Value |
| --- | --- |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'nonce-…' 'strict-dynamic' https://challenges.cloudflare.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://www.googletagmanager.com https://*.google-analytics.com; font-src 'self'; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; worker-src 'self' blob:; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; manifest-src 'self'; upgrade-insecure-requests` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `DENY` (belt-and-braces with `frame-ancestors 'none'`) |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `geolocation=(), camera=(), microphone=(), payment=(), usb=(), bluetooth=(), serial=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=()` |
| `Cross-Origin-Opener-Policy` / `Cross-Origin-Resource-Policy` | `same-origin` / `same-origin` |
| `X-DNS-Prefetch-Control` | `off` |
| `X-Powered-By` | removed (`poweredByHeader: false`) |

Notes on the CSP:

- **Scripts are nonce-only.** No `'unsafe-inline'`. Next.js stamps its own bootstrap scripts with the request nonce (read from the request CSP header set by the middleware). `'strict-dynamic'` lets those nonce'd scripts load their chunks; the two host entries are for browsers without strict-dynamic support.
- **`'unsafe-eval'` exists in development only** (React Fast Refresh / Turbopack HMR). The production policy has no eval. Three.js, GSAP, anime.js and R3F were verified to run under the production policy with zero violations.
- **`style-src 'unsafe-inline'` is deliberate.** React SSR emits `style=""` attributes, GSAP/anime write inline styles, and the stylesheet is inlined into the HTML (`experimental.inlineCss`) to save a render-blocking round-trip. Inline styles are not a script-execution vector; the exposure is CSS exfiltration/defacement, which is bounded by `default-src 'self'` and the absence of user-generated content on the page. A style nonce was rejected because React does not re-apply blocked SSR style attributes on hydration.
- The JSON-LD `<script type="application/ld+json">` carries no nonce on purpose: data blocks are never executed, so `script-src` does not apply, and browsers blank `nonce` attributes in the DOM which would otherwise cause a hydration mismatch.
- Turnstile and gtag are loaded with the nonce via `next/script`; Turnstile's challenge iframe is allowed by `frame-src`.

Cookies: the only first-party cookie is the form token described above (`HttpOnly; Secure; SameSite=Strict; Path=/api`). The consent decision is stored in `localStorage`, not a cookie. Google Analytics sets its own cookies only after the visitor accepts.

## Supply chain and surface area

- **Exact pins**, `save-exact=true`, `engine-strict=true`. Every dependency has a job: Next/React, Tailwind, GSAP (+`@gsap/react`), anime.js, three/R3F/drei/postprocessing (hero only, lazy), zod (`zod/mini` on the client), resend, `@upstash/ratelimit` + `@upstash/redis`. Turnstile has no package — a 40-line wrapper instead. Dev-only: ESLint, TypeScript, sharp + playwright (asset rendering), Lighthouse via `pnpm dlx` (not a dependency).
- `pnpm audit --audit-level high`: **clean**. The only findings were in `postcss` nested under `next` (build-time only); resolved with a `pnpm.overrides` pin to 8.5.28.
- **Dependabot** (`.github/dependabot.yml`): weekly, grouped (react / three / motion / tooling), plus GitHub Actions monthly.
- No production source maps (`productionBrowserSourceMaps: false`, the default, made explicit).
- Secrets only in environment variables; `.env.example` ships empty values; `.env*` is git-ignored. `import "server-only"` guards every module that touches a secret so it can never be bundled for the client.
- `/hero-render` (asset render tool) returns `404` in production unless `HERO_RENDER_TOOL=1`; it is also disallowed in `robots.txt`.
- `/.well-known/security.txt` with contact, expiry and canonical.
- `strict` TypeScript with `noUncheckedIndexedAccess`.

## Client-side notes

- `rel="noopener noreferrer"` on all external links (`target=_blank`).
- Analytics is gated behind an explicit consent prompt; Consent Mode v2 defaults are `denied` before acceptance and nothing is fetched from Google until then.
- No user-generated content is rendered; all copy is static from `content.ts`. Email bodies (the only place visitor input is rendered) are escaped as above.

## Deliberately deferred / out of scope

- **CSP reporting** (`report-to` / `report-uri`): not configured — add a reporting endpoint (e.g. a Vercel log drain or report-uri.com) before tightening further.
- **Style nonces / hashes**: see the `style-src` note above.
- **Subresource Integrity** for gtag/Turnstile: not possible — both are versioned, changing third-party scripts.
- **WAF / bot management**: Vercel Firewall or Cloudflare in front of the site is recommended for volumetric abuse; the app-level limiter is per-instance-agnostic (Redis) but is not a DDoS control.
- **Signed webhooks / CRM sync**: not part of the brief; inquiries go by email only.
- **Content Security Policy for `/hero-render`**: same policy as the site; the route is dev-only.
