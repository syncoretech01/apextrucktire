/**
 * Runs Lighthouse (mobile + desktop) against a running production server and
 * writes HTML/JSON reports to ./lighthouse. Usage:
 *   pnpm build && pnpm start   (port 3600)
 *   pnpm lighthouse [--url http://localhost:3600]
 * Uses the installed Google Chrome. Lighthouse itself runs via pnpm dlx so it
 * is not a project dependency.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const url = args.includes("--url") ? args[args.indexOf("--url") + 1] : "http://localhost:3600/";
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

for (const preset of ["mobile", "desktop"]) {
  const out = `lighthouse/${preset}`;
  const extra = preset === "desktop" ? ["--preset=desktop"] : ["--form-factor=mobile", "--screenEmulation.mobile"];
  const r = spawnSync(
    "pnpm",
    ["dlx", "lighthouse@13.4.1", url, "--output=html", "--output=json", `--output-path=${out}`, "--only-categories=performance,accessibility,best-practices,seo", "--chrome-flags=--headless=new --no-sandbox", "--quiet", ...extra],
    { stdio: "inherit", env: { ...process.env, CHROME_PATH: CHROME } },
  );
  if (r.status !== 0) process.exit(r.status ?? 1);
  const j = JSON.parse(readFileSync(`${out}.report.json`, "utf8"));
  const c = j.categories;
  const a = j.audits;
  console.log(`\n${preset.toUpperCase()}  perf ${Math.round(c.performance.score * 100)} · a11y ${Math.round(c.accessibility.score * 100)} · best ${Math.round(c["best-practices"].score * 100)} · seo ${Math.round(c.seo.score * 100)}`);
  console.log(`  LCP ${a["largest-contentful-paint"].displayValue} · CLS ${a["cumulative-layout-shift"].displayValue} · TBT ${a["total-blocking-time"].displayValue} · FCP ${a["first-contentful-paint"].displayValue} · SI ${a["speed-index"].displayValue}`);
  const lcpEl = a["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]?.node?.snippet;
  if (lcpEl) console.log(`  LCP element: ${String(lcpEl).slice(0, 120)}`);
}
