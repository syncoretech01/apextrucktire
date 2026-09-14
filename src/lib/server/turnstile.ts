import "server-only";
import { devWarn, isProd } from "./env";

/** Cloudflare's documented always-pass test secret, development only. */
const TEST_SECRET = "1x0000000000000000000000000000000AA";

export async function verifyTurnstile(token: string, ip: string): Promise<{ ok: boolean; reason?: string }> {
  let secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (isProd) return { ok: false, reason: "unconfigured" };
    devWarn("turnstile", "TURNSTILE_SECRET_KEY not set — using Cloudflare's test secret (development only).");
    secret = TEST_SECRET;
  }
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return { ok: false, reason: `http_${res.status}` };
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!data.success) return { ok: false, reason: (data["error-codes"] ?? []).join(",") || "failed" };
    return { ok: true };
  } catch (err) {
    console.error("[apex] turnstile verify error", err instanceof Error ? err.message : err);
    return { ok: false, reason: "unreachable" };
  }
}
