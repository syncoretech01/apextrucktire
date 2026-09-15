# Apex Truck Tire — website

Single-page marketing site for Apex Truck Tire (Bloomington, CA): 24/7 mobile truck tire roadside, commercial tire sales, on-site installation. Built to generate inbound calls and form inquiries from fleet managers, owner-operators and dispatchers on the I-10 / I-215 / I-15 / SR-60 corridor.

- **Stack:** Next.js 15.5 (App Router, strict TypeScript), Tailwind CSS v4 (token layer in `src/app/globals.css`), GSAP 3.15 (ScrollTrigger, ScrollSmoother, SplitText, Flip, Draggable, InertiaPlugin, CustomEase), anime.js 4, Three.js via react-three-fiber + drei + postprocessing, Zod 4 (`zod/mini`), Resend, Upstash Redis, Cloudflare Turnstile.
- **Deploy target:** Vercel.
- **Docs:** [SECURITY.md](SECURITY.md) (hardening), [MOTION.md](MOTION.md) (animation system, hero tuning), [IMAGE-PROMPTS.md](IMAGE-PROMPTS.md) (photography briefs), [MUSIC-PROMPTS.md](MUSIC-PROMPTS.md) (music / song briefs for video, ads, hold line).

## Quick start

Requirements: Node ≥ 20.9 (24 recommended), pnpm 10 (`corepack enable`).

```bash
pnpm install
cp .env.example .env.local      # optional in dev — see "Environment"
pnpm dev                        # http://localhost:3600
```

Development works from a clean clone with **no secrets**: the form uses Cloudflare's always-pass Turnstile test keys, an in-memory rate limiter, an ephemeral token secret, and logs emails to the terminal instead of sending. Production **fails closed** without the real values (see SECURITY.md).

Other scripts:

| Script | What it does |
| --- | --- |
| `pnpm build` / `pnpm start` | Production build / serve on :3600 |
| `pnpm lint` / `pnpm typecheck` | ESLint / `tsc --noEmit` |
| `pnpm audit` | `pnpm audit --audit-level high` (clean at time of writing) |
| `pnpm render:hero` | Re-render hero poster + phone image sequence from the live 3D scene (needs `pnpm dev` running) |
| `pnpm lighthouse` | Lighthouse mobile + desktop against a running `pnpm start` |
| `node scripts/smoke-api.mjs` | Exercises every layer of the inquiry endpoint hardening against `pnpm dev` |
| `node scripts/photos.mjs` | Crops/exports the section photography from `../generated-images/` |
| `node scripts/audio.mjs` | Normalises/encodes the opt-in background track from `../generated-audio/` (needs `ffmpeg`) |
| `node scripts/placeholders.mjs` | Regenerates the (superseded) placeholder section imagery |
| `node scripts/brand-assets.mjs` | Regenerates favicon, apple-icon and the OG image from the brand PNGs + fleet photo |

## Environment

Copy `.env.example` → `.env.local`. All values are empty in the example on purpose.

| Variable | Required in prod | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical origin (no trailing slash). Used for canonical/OG/sitemap and the CSRF origin allow-list. |
| `RESEND_API_KEY` | yes | Transactional email. A "Sending access" key is enough. |
| `EMAIL_FROM` | yes | Verified sender, e.g. `Apex Truck Tire <dispatch@apextrucktire.com>`. Domain must be verified in Resend. |
| `EMAIL_TO` | no | Inquiry notifications. Defaults to `admin@apextrucktire.com`. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | yes | Sliding-window rate limits (5 submissions / 10 min per IP and per fingerprint). Missing or unreachable → submissions return 503. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | yes | Cloudflare Turnstile widget (type **Invisible**). Dev falls back to Cloudflare's test keys. |
| `FORM_TOKEN_SECRET` | yes | ≥ 32 random bytes (`openssl rand -hex 32`) signing the same-site form token. |
| `NEXT_PUBLIC_GA4_ID` | no | GA4 measurement ID. Nothing from Google loads until the visitor accepts the consent prompt. |
| `NEXT_PUBLIC_GADS_ID`, `NEXT_PUBLIC_GADS_LABEL_FORM`, `NEXT_PUBLIC_GADS_LABEL_CALL` | no | Google Ads conversion hooks (`lib/analytics.ts → trackConversion`). No-ops when empty. |

## Deploying to Vercel

1. Import the repo. Framework preset: Next.js. Build `pnpm build`, install `pnpm install`. Node 20 or 24.
2. Add every production variable above in **Settings → Environment Variables** (Production + Preview). Do not commit `.env*` files.
3. Create the integrations: Upstash Redis (any region near `iad1`/`sfo1`), Resend domain verification for `apextrucktire.com` (SPF + DKIM), Turnstile widget with the production hostname(s).
4. Set `NEXT_PUBLIC_SITE_URL` to the final origin (e.g. `https://www.apextrucktire.com`) and redirect the apex/non-www variant in Vercel domains.
5. After the first deploy, verify: `/robots.txt`, `/sitemap.xml`, `/.well-known/security.txt`, response headers (CSP with nonce, HSTS, etc.), and submit the form once with a real address.
6. Optional: submit the domain to the HSTS preload list once you are sure every subdomain serves HTTPS.

The page is dynamically rendered (per-request CSP nonce) — that is expected; there is no ISR/static export.

## Project layout

```
src/
  app/                 layout (fonts, headers, landmarks), page, API routes, metadata routes
    api/form-token     issues the signed same-site token (HttpOnly cookie + body)
    api/inquiry        the hardened POST endpoint
    hero-render        dev-only page used by scripts/render-hero.mjs (404 in prod)
  components/
    hero/              3D exploded view: geometry, materials, scene, callouts, poster, phone sequence
    sections/          TrustBar, Services, RoadsideFlow, TirePositions, ServiceArea, WhyApex, Testimonials, InquirySection
    form/              multi-step inquiry form, field primitives, Turnstile glue, lazy loader
    layout/            header, footer, sticky call bar, sound toggle, ScrollSmoother provider, analytics + consent, JSON-LD
    ui/                buttons, logo lockup, section header
  lib/
    site.ts            NAP — the single source of truth for phone/address/email/hours
    content.ts         all copy and data that the business will edit
    inquirySchema.ts   Zod schema shared by client + server
    analytics.ts       track() + trackConversion()
    sound.ts           the one background-music player + useSound() store behind every SoundToggle
    motion/            gsap (core + lazy plugin loaders), anime barrel, tokens, Reveal, device tier, reduced motion
    server/            token, ratelimit, turnstile, sanitize, email (server-only)
public/
  images/              hero posters, placeholder section photos
  hero-seq/            32-frame WebP explode sequence (landscape + portrait) for phones
  audio/               opt-in background track (loaded only when a visitor turns sound on)
  fonts/               self-hosted Archivo (display, uppercase subset) + Manrope
  brand/               the brand wordmark/icon PNGs (on-dark + on-light, all sizes) — used as-is in header, footer, favicons, OG
```

## Swap points (placeholders → real content)

Everything below is clearly marked in code with `PLACEHOLDER` or lives in `src/lib/content.ts` / `src/lib/site.ts`.

| What | Where | Notes |
| --- | --- | --- |
| Credentials (years, fleets, trucks, avg response) | `content.ts → CREDENTIALS`, `site.ts → status.avgResponseMinutes` | Verified numbers only. |
| Brands carried | `content.ts → BRANDS` | Text wordmarks. Replace with licensed logo SVGs in `TrustBar.tsx` if desired. |
| Service copy, "what's included", expectations | `content.ts → SERVICES` | |
| Tire recommendations by position | `content.ts → POSITIONS` | Model names are examples — match current stock. |
| Testimonials | `content.ts → TESTIMONIALS` | **Placeholder quotes. Replace with real, permissioned quotes before launch — never invent reviews.** |
| Differentiators | `content.ts → DIFFERENTIATORS` | |
| Section photography | `public/images/services/*.jpg` (3:2, focal point via `image.position`), `public/images/why/yard-dusk.jpg` (4:5), `why/truck-unit15.jpg` (16:10), `why/detail-compartments.jpg` (1:1), `fleet-side-profile.jpg` (OG source). Filenames are content-specific on purpose — `minimumCacheTTL` is 30 days, so a new photo needs a new name | Exported by `node scripts/photos.mjs` from the full-size sources in `../generated-images/` (prompts: `IMAGE-PROMPTS.md`). Alt text lives in `content.ts` and `WhyApex.tsx`. |
| Background track | `public/audio/already-rolling-brand-bed.mp3` via `node scripts/audio.mjs`; path in `lib/sound.ts` | Off by default, opt-in via the Sound toggle in the header (left of the 877 button); never autoplays. `/audio/*` is immutable — a new track needs a new filename. Brief: `MUSIC-PROMPTS.md` → M1. |
| Geo coordinates | `site.ts → address.geo` | Approximate — confirm against Google Business Profile. |
| Social profiles | `site.ts → sameAs` | Empty array → omitted from schema until filled. |
| Shop hours | `site.ts → hours`, `SiteFooter.tsx`, `JsonLd.tsx` | Keep the three in sync. |
| Service-area cities / corridor | `site.ts → serviceArea`, `ServiceArea.tsx → CITIES` | The map is a stylized diagram, not survey data. |
| Hero headline / lead | `components/hero/Hero.tsx` | Display face is an uppercase-only subset — see Fonts. |
| Logo | `public/brand/*` → `components/ui/Logo.tsx`, `app/icon.png`, `app/apple-icon.png`, `app/favicon.ico` | The brand PNGs are used unchanged; only resized. |
| OG image | `public/og-fleet.png` via `node scripts/brand-assets.mjs` | Rename when the photo changes (social scrapers cache by URL). |
| Email templates | `lib/server/email.ts` | |
| security.txt expiry | `public/.well-known/security.txt` | Bump `Expires` yearly. |

### Fonts

Archivo (display) is a **glyph-limited subset**: A–Z, digits, punctuation, both variable axes intact (42 KB). Every heading is forced uppercase (`globals.css` base rule), so this is safe. If you need lowercase display text, regenerate a bigger subset from the Google Fonts API with a `text=` parameter (or drop the parameter for the full latin set) and replace `public/fonts/archivo-display-caps.woff2`; update `src/app/fonts.ts` if the filename changes. Manrope (body) is the full latin subset.

### Re-rendering the hero assets

The poster images and the phone image sequence are captured from the exact procedural scene, so they match the WebGL hero pixel-for-pixel. After changing anything in `components/hero/{wheelConfig,geometry,WheelAssembly,HeroScene}.tsx`:

```bash
pnpm dev                       # terminal 1
pnpm render:hero               # terminal 2 — needs Google Chrome installed
node scripts/brand-assets.mjs  # OG image uses the poster
```

Outputs: `public/images/hero-poster-{exploded,assembled}-{landscape,portrait}.jpg`, `public/hero-seq/{landscape,portrait}/NN.webp`.

## Analytics

`src/lib/analytics.ts → track(name, params)` is the only entry point. GA4 loads only after consent (`components/layout/Analytics.tsx`, decision stored in `localStorage["apex-consent"]`, Consent Mode v2 defaults denied). Events:

| Event | Fired when | Params |
| --- | --- | --- |
| `click_to_call` | Any `tel:` link/button | `location` (header, hero, service_roadside, roadside_bar, sticky_mobile, footer, form_success, …), `number` |
| `cta_request_service` | "Request service"/quote CTAs | `location` |
| `form_start` | First interaction with the form | |
| `form_step` | Step advanced (incl. `emergency_path`, tire position tabs) | `step`, `index`, `emergency` |
| `form_step_dropoff` | Tab hidden with a started, unsubmitted form | `step`, `emergency` |
| `form_submit` / `form_success` / `form_error` | Submission lifecycle | `emergency`, `service`, `status` |
| `consent_update` | Consent decision | `analytics_storage` |
| `sound_toggle` | Background music turned on/off | `on` |

Google Ads: set the three `NEXT_PUBLIC_GADS_*` variables; `trackConversion("form")` fires on success. Wire `trackConversion("call")` to the click-to-call handlers if/when call conversions are configured in Ads (the hook is exported and a no-op until configured).

## Lighthouse (production build, Lighthouse 13.4, `pnpm lighthouse`)

Run 2026-09-14 against `pnpm start` on an M-series Mac; mobile = Lighthouse's default Moto G Power emulation with simulated slow 4G and 4× CPU slowdown.

| | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mobile | **99** | 100 | 100 | 100 | 2.3 s | 0 | 40 ms |
| Desktop | **100** | 100 | 100 | 100 | 0.8 s | 0 | 0 ms |

Notes: on phones the hero copy paints with the HTML (LCP = the `<h1>`); on desktop the LCP element is the poster image, which cross-fades into the WebGL canvas once it is compiled. Initial JavaScript is ~183 kB gzipped; Three.js/R3F (~700 kB) is a lazy chunk that never loads on phones or for reduced-motion users. Reports are written to `lighthouse/` (git-ignored).

## Accessibility notes

- One `h1`; landmarks: header/nav/main/footer; logical heading order; skip link.
- All motion has a defined reduced-motion state (see MOTION.md). `prefers-reduced-motion` removes the scrub/pin, marquee, parallax and 3D entirely.
- Keyboard: tire-position hotspots are `role=tab` with arrow-key roving focus; the testimonial track is focusable with ←/→/Home/End; every control has a visible accent focus ring.
- Form: every field labelled, errors via `aria-describedby`, step errors announced through an assertive live region, success panel is a focused `role=status`.
- Contrast: accent `#FF6B1A` on `#07090D` = 6.99:1; steel `#8FA3B8` = 7.7:1; muted `#7A8899` ≈ 4.9:1. Buttons use dark text on the accent (white on accent would fail at 2.85:1).
