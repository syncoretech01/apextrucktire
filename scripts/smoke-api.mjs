/**
 * Smoke test for the inquiry endpoint's hardening. Run against a dev server
 * (`pnpm dev`) — production fails closed without Upstash/Turnstile secrets.
 *   node scripts/smoke-api.mjs [http://localhost:3600]
 * Expected: 403 (too fast), 403 (no origin), 403 (cross-site), 403 (token
 * mismatch), fake 200 (honeypot), 400 with field errors, 413, 200, then 429s.
 */
const BASE = process.argv[2] ?? "http://localhost:3600";
const ORIGIN = BASE;
async function getToken() {
  const r = await fetch(`${BASE}/api/form-token`, { headers: { "user-agent": "apitest/1" } });
  const cookie = r.headers.get("set-cookie")?.split(";")[0] ?? "";
  const { token } = await r.json();
  return { token, cookie };
}
async function post(body, { token, cookie }, extraHeaders = {}) {
  const r = await fetch(`${BASE}/api/inquiry`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN, cookie, "x-form-token": token, "user-agent": "apitest/1", ...extraHeaders },
    body: JSON.stringify(body),
  });
  return { status: r.status, body: await r.json().catch(() => ({})) };
}
const good = {
  fields: { name: "Test Fleet\r\nBcc: victim@example.com", company: "ACME <script>x</script>", phone: "(909) 555-0100", email: "buyer@example.com", location: "Fontana yard", serviceType: "purchase", urgency: "quote", message: "Need 8x 11R22.5 drive\nRetreads ok\r\nThanks" },
  website: "",
  turnstileToken: "XXXX.DUMMY.TOKEN.XXXX",
};

const t = await getToken();
console.log("1. too fast:", (await post(good, t)).status, "(expect 403)");
await new Promise((r) => setTimeout(r, 2200));
console.log("2. no origin:", (await (async () => { const r = await fetch(`${BASE}/api/inquiry`, { method: "POST", headers: { "content-type": "application/json", cookie: t.cookie, "x-form-token": t.token }, body: JSON.stringify(good) }); return r.status; })()), "(expect 403)");
console.log("3. cross-site:", (await post(good, t, { "sec-fetch-site": "cross-site" })).status, "(expect 403)");
console.log("4. token mismatch:", (await post(good, { token: t.token, cookie: "apex_ft=nope" })).status, "(expect 403)");
console.log("5. honeypot:", JSON.stringify(await post({ ...good, website: "http://spam" }, t)), "(expect fake 200)");
console.log("6. invalid fields:", JSON.stringify(await post({ ...good, fields: { ...good.fields, phone: "12", urgency: "quote", name: "" } }, t)), "(expect 400 + field errors)");
console.log("7. oversized:", (await post({ ...good, fields: { ...good.fields, message: "x".repeat(20000) } }, t)).status, "(expect 413 or 400)");
console.log("8. standard path:", JSON.stringify(await post(good, t)), "(expect 200)");
for (let i = 0; i < 6; i++) {
  const r = await post(good, t);
  console.log(`   burst ${i + 1}:`, r.status, r.body.message ?? "");
}
console.log("9. GET:", (await fetch(`${BASE}/api/inquiry`)).status, "(expect 405)");
