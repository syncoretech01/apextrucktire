import { NextResponse } from "next/server";
import { inquiryPayload, inquirySchema } from "@/lib/inquirySchema";
import { TOKEN_COOKIE, verifyToken } from "@/lib/server/token";
import { clientIp, fingerprint, limitSubmit } from "@/lib/server/ratelimit";
import { verifyTurnstile } from "@/lib/server/turnstile";
import { sendInquiry } from "@/lib/server/email";
import { SITE } from "@/lib/site";
import { isProd } from "@/lib/server/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024;
const NO_STORE = { "cache-control": "no-store" };

/** Client-facing messages are generic on purpose; details go to the server log. */
const MSG = {
  invalid: "Some fields need attention.",
  rejected: "We couldn't verify this submission. Please call us instead.",
  limited: "Too many requests from this connection. Please call us instead.",
  unavailable: "The form is temporarily unavailable. Please call us — a person answers 24/7.",
};

function fail(status: number, message: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: false, message, ...extra }, { status, headers: NO_STORE });
}

function allowedOrigins(request: Request): Set<string> {
  const set = new Set<string>();
  try {
    set.add(new URL(SITE.url).origin);
  } catch {
    /* unset in dev */
  }
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? (isProd ? "https" : "http");
  if (host) set.add(`${proto}://${host}`);
  return set;
}

export async function POST(request: Request) {
  const headers = request.headers;
  const ip = clientIp(headers);
  const log = (msg: string, extra?: Record<string, unknown>) => console.warn(`[apex] inquiry rejected: ${msg}`, { ip, ...extra });

  // 1. Origin / same-site checks (CSRF layer 1)
  const origin = headers.get("origin");
  const fetchSite = headers.get("sec-fetch-site");
  if (!origin || !allowedOrigins(request).has(origin)) {
    log("bad origin", { origin });
    return fail(403, MSG.rejected);
  }
  if (fetchSite && fetchSite !== "same-origin") {
    log("bad sec-fetch-site", { fetchSite });
    return fail(403, MSG.rejected);
  }
  if (!(headers.get("content-type") ?? "").startsWith("application/json")) {
    return fail(415, MSG.rejected);
  }

  // 2. Same-site token (CSRF layer 2 + minimum time-to-submit)
  const cookie = request.headers.get("cookie") ?? "";
  const cookieToken = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${TOKEN_COOKIE}=`))
    ?.slice(TOKEN_COOKIE.length + 1);
  const tokenCheck = await verifyToken(headers.get("x-form-token"), cookieToken);
  if (!tokenCheck.ok) {
    log(`token ${tokenCheck.reason}`);
    if (tokenCheck.reason === "no_secret") return fail(503, MSG.unavailable);
    if (tokenCheck.reason === "expired") return fail(400, "This form session expired. Refresh the page and try again.", { code: "expired" });
    return fail(403, MSG.rejected);
  }

  // 3. Rate limits — by IP and by device fingerprint. Fail closed.
  const fp = await fingerprint(headers, ip);
  const [byIp, byFp] = await Promise.all([limitSubmit(`ip:${ip}`), limitSubmit(`fp:${fp}`)]);
  for (const r of [byIp, byFp]) {
    if (!r.ok) {
      log(`rate limit ${r.reason}`);
      return r.reason === "limited" ? fail(429, MSG.limited) : fail(503, MSG.unavailable);
    }
  }

  // 4. Body size + shape
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return fail(400, MSG.rejected);
  }
  if (raw.length > MAX_BODY_BYTES) {
    log("body too large", { bytes: raw.length });
    return fail(413, MSG.rejected);
  }
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return fail(400, MSG.rejected);
  }
  const payload = inquiryPayload.safeParse(json);
  if (!payload.success) {
    log("payload shape");
    return fail(400, MSG.invalid, { fields: fieldErrors(payload.error) });
  }

  // 5. Honeypot — pretend success so bots don't learn anything
  if (payload.data.website) {
    log("honeypot filled");
    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  }

  // 6. Authoritative field validation (incl. cross-field rules)
  const fields = inquirySchema.safeParse(payload.data.fields);
  if (!fields.success) {
    return fail(400, MSG.invalid, { fields: fieldErrors(fields.error) });
  }

  // 7. Turnstile
  const ts = await verifyTurnstile(payload.data.turnstileToken, ip);
  if (!ts.ok) {
    log(`turnstile ${ts.reason}`);
    return ts.reason === "unconfigured" || ts.reason === "unreachable" ? fail(503, MSG.unavailable) : fail(400, MSG.rejected);
  }

  // 8. Deliver
  const sent = await sendInquiry(fields.data, {
    ip,
    userAgent: headers.get("user-agent") ?? "",
    receivedAt: new Date(),
  });
  if (!sent.ok) {
    console.error("[apex] inquiry delivery failed", { ip });
    return fail(502, MSG.unavailable);
  }

  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}

/** Flatten a Zod error to { fieldName: message } without leaking internals. */
function fieldErrors(err: { issues: { path: PropertyKey[]; message: string }[] }): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.filter((p) => p !== "fields").map(String).join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function GET() {
  return new NextResponse(null, { status: 405, headers: { allow: "POST", ...NO_STORE } });
}
