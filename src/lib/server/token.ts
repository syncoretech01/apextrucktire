import "server-only";
import { devWarn, isProd } from "./env";

/**
 * Same-site form token (CSRF + minimum time-to-submit).
 *
 * token = issuedAt.nonce.base64url(HMAC-SHA256(secret, `${issuedAt}.${nonce}`))
 *
 * Issued by GET /api/form-token, stored in an HttpOnly SameSite=Strict cookie
 * AND returned in the body. The client echoes it in X-Form-Token; the server
 * requires cookie === header (double submit), a valid signature, and an age
 * between MIN_AGE_MS (bots submit instantly) and MAX_AGE_MS.
 */
export const TOKEN_COOKIE = "apex_ft";
export const MIN_AGE_MS = 2_000;
export const MAX_AGE_MS = 4 * 60 * 60 * 1000;

const enc = new TextEncoder();

// Dev-only ephemeral secret lives on globalThis so every route bundle (and
// every HMR re-evaluation) in the process signs and verifies with the same key.
const g = globalThis as typeof globalThis & { __apexFormSecret?: string };

function getSecret(): string | null {
  const s = process.env.FORM_TOKEN_SECRET;
  if (s && s.length >= 32) return s;
  if (isProd) return null;
  if (!g.__apexFormSecret) {
    g.__apexFormSecret = b64url(crypto.getRandomValues(new Uint8Array(32)));
    devWarn("token", "FORM_TOKEN_SECRET is not set — using an ephemeral dev secret. Set it in .env.local.");
  }
  return g.__apexFormSecret;
}

function b64url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return b64url(new Uint8Array(sig));
}

export async function issueToken(): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;
  const issuedAt = Date.now().toString();
  const nonce = b64url(crypto.getRandomValues(new Uint8Array(16)));
  const sig = await hmac(secret, `${issuedAt}.${nonce}`);
  return `${issuedAt}.${nonce}.${sig}`;
}

export type TokenCheck =
  | { ok: true; ageMs: number; nonce: string }
  | { ok: false; reason: "missing" | "mismatch" | "invalid" | "too_fast" | "expired" | "no_secret" };

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export async function verifyToken(header: string | null, cookie: string | undefined): Promise<TokenCheck> {
  const secret = getSecret();
  if (!secret) return { ok: false, reason: "no_secret" };
  if (!header || !cookie) return { ok: false, reason: "missing" };
  if (header.length > 256 || !timingSafeEqual(header, cookie)) return { ok: false, reason: "mismatch" };
  const parts = header.split(".");
  if (parts.length !== 3) return { ok: false, reason: "invalid" };
  const [issuedAt, nonce, sig] = parts as [string, string, string];
  const expected = await hmac(secret, `${issuedAt}.${nonce}`);
  if (!timingSafeEqual(expected, sig)) return { ok: false, reason: "invalid" };
  const age = Date.now() - Number(issuedAt);
  if (!Number.isFinite(age) || age < 0) return { ok: false, reason: "invalid" };
  if (age < MIN_AGE_MS) return { ok: false, reason: "too_fast" };
  if (age > MAX_AGE_MS) return { ok: false, reason: "expired" };
  return { ok: true, ageMs: age, nonce };
}
