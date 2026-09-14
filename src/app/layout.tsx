import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { archivo, manrope } from "./fonts";
import "./globals.css";
import { SITE } from "@/lib/site";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { StickyCall } from "@/components/layout/StickyCall";
import { Analytics } from "@/components/layout/Analytics";
import { JsonLd } from "@/components/layout/JsonLd";

const title = "24/7 Commercial Truck Tire Service & Roadside Assistance | Apex Truck Tire — Bloomington, CA";
const description =
  "Apex Truck Tire: 24/7 mobile truck tire roadside assistance on I-10, I-215, I-15 and SR-60 in the Inland Empire. Commercial truck tire sales (new, retread, steer/drive/trailer) and on-site installation in Bloomington, CA. Call (877) 512-0301.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE.name,
    title,
    description,
    locale: "en_US",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Apex Truck Tire — 24/7 commercial truck tire service, Bloomington, CA" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  applicationName: SITE.name,
  category: "automotive",
};

export const viewport: Viewport = {
  themeColor: "#07090d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="en" className={`${archivo.variable} ${manrope.variable}`}>
      <body className="bg-base-0 font-sans text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-sm focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
        >
          Skip to content
        </a>
        <div className="grain-overlay motion-safe:animate-grain" aria-hidden="true" />
        <SiteHeader />
        <SmoothScroll>
          <main id="main">{children}</main>
          <SiteFooter />
        </SmoothScroll>
        <StickyCall />
        <Analytics nonce={nonce} />
        <JsonLd />
      </body>
    </html>
  );
}
