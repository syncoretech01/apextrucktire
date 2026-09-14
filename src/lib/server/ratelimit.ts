import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { devWarn, isProd } from "./env";

/**
 * Sliding-window rate limiting. Production uses Upstash Redis and FAILS
 * CLOSED: if the limiter is unreachable or unconfigured, the request is
 * rejected (503). Development without Upstash falls back to an in-memory
 * sliding window so `pnpm dev` works from a clean clone.
 */
export type LimitResult = { ok: true; remaining: number } | { ok: false; reason: "limited" | "unavailable" };

type Limiter = { limit: (key: string) => Promise<{ success: boolean; remaining: number }> };

const memory = new Map<string, number[]>();
function memoryLimiter(prefix: string, max: number, windowMs: number): Limiter {
  return {
    async limit(key) {
      const k = `${prefix}:${key}`;
      const now = Date.now();
      const hits = (memory.get(k) ?? []).filter((t) => now - t < windowMs);
      hits.push(now);
      memory.set(k, hits);
      return { success: hits.length <= max, remaining: Math.max(0, max - hits.length) };
    },
  };
}

function upstash(prefix: string, max: number, window: `${number} m`): Limiter | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const rl = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(max, window),
    prefix,
    analytics: false,
    timeout: 3000,
  });
  return { limit: (key) => rl.limit(key) };
}

function build(prefix: string, max: number, windowMinutes: number): Limiter | null {
  const u = upstash(prefix, max, `${windowMinutes} m`);
  if (u) return u;
  if (isProd) return null;
  devWarn("ratelimit", "Upstash not configured — using an in-memory rate limiter (development only).");
  return memoryLimiter(prefix, max, windowMinutes * 60_000);
}

/** 5 submissions per 10 minutes per key (IP and fingerprint are separate keys). */
const submitLimiter = build("apex:submit", 5, 10);
/** Token issuance: 30 per 10 minutes per IP, to stop token farming. */
const tokenLimiter = build("apex:token", 30, 10);

async function run(limiter: Limiter | null, key: string): Promise<LimitResult> {
  if (!limiter) return { ok: false, reason: "unavailable" };
  try {
    const r = await limiter.limit(key);
    return r.success ? { ok: true, remaining: r.remaining } : { ok: false, reason: "limited" };
  } catch (err) {
    console.error("[apex] rate limiter error", err instanceof Error ? err.message : err);
    return { ok: false, reason: "unavailable" };
  }
}

export const limitSubmit = (key: string) => run(submitLimiter, key);
export const limitToken = (key: string) => run(tokenLimiter, key);

/** Client IP from proxy headers (Vercel sets x-forwarded-for; first hop is the client). */
export function clientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim().slice(0, 64);
  return headers.get("x-real-ip")?.slice(0, 64) ?? "0.0.0.0";
}

/** Coarse device fingerprint: UA + language + client-hint UA + IP prefix. */
export async function fingerprint(headers: Headers, ip: string): Promise<string> {
  const prefix = ip.includes(":") ? ip.split(":").slice(0, 4).join(":") : ip.split(".").slice(0, 3).join(".");
  const raw = [headers.get("user-agent") ?? "", headers.get("accept-language") ?? "", headers.get("sec-ch-ua") ?? "", prefix].join("|");
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return Buffer.from(buf).toString("base64url").slice(0, 32);
}
