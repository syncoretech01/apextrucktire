import { NextResponse } from "next/server";
import { issueToken, MAX_AGE_MS, TOKEN_COOKIE } from "@/lib/server/token";
import { clientIp, limitToken } from "@/lib/server/ratelimit";
import { isProd } from "@/lib/server/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Issues the same-site form token. Cookie: HttpOnly, Secure (prod),
 * SameSite=Strict, scoped to /api. Rate limited per IP. Never cached.
 */
export async function GET(request: Request) {
  const ip = clientIp(request.headers);
  const rl = await limitToken(`ip:${ip}`);
  if (!rl.ok) {
    return NextResponse.json({ ok: false }, { status: rl.reason === "limited" ? 429 : 503, headers: { "cache-control": "no-store" } });
  }
  const token = await issueToken();
  if (!token) {
    console.error("[apex] FORM_TOKEN_SECRET missing in production");
    return NextResponse.json({ ok: false }, { status: 503, headers: { "cache-control": "no-store" } });
  }
  const res = NextResponse.json({ ok: true, token }, { headers: { "cache-control": "no-store" } });
  res.cookies.set({
    name: TOKEN_COOKIE,
    value: token,
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/api",
    maxAge: Math.floor(MAX_AGE_MS / 1000),
  });
  return res;
}
