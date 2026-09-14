import type { NextConfig } from "next";

/**
 * Static security headers live here. The Content-Security-Policy is
 * per-request (nonce) and is set in src/middleware.ts.
 */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "geolocation=(), camera=(), microphone=(), payment=(), usb=(), bluetooth=(), serial=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  transpilePackages: ["three"],
  // The page renders dynamically (per-request CSP nonce), and Next 15.2+
  // streams metadata into <body> for dynamic pages unless the UA is an
  // "HTML-limited bot". Matching every UA keeps <title>, description,
  // canonical and OG tags in <head> for every client and scraper.
  htmlLimitedBots: /.*/,
  experimental: {
    optimizePackageImports: ["@react-three/drei", "gsap", "animejs"],
    // Inline the (small) stylesheet into the HTML: removes a render-blocking
    // round-trip on slow mobile connections. ~11 kB gzipped.
    inlineCss: true,
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/fonts/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/hero-seq/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/.well-known/security.txt",
        headers: [{ key: "Content-Type", value: "text/plain; charset=utf-8" }],
      },
    ];
  },
};

export default nextConfig;
