import { SITE } from "@/lib/site";

/**
 * LocalBusiness → AutoRepair schema with exact NAP, geo, 24/7 emergency hours,
 * shop hours, service area and service catalog. sameAs is filled from
 * SITE.sameAs (placeholder, see README → Swap points).
 */
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": ["AutoRepair", "LocalBusiness"],
    "@id": `${SITE.url}/#business`,
    name: SITE.name,
    url: SITE.url,
    telephone: SITE.phone.primary.e164,
    email: SITE.email.display,
    image: `${SITE.url}/og.png`,
    logo: `${SITE.url}/brand/apex-icon-on-dark-1024.png`,
    priceRange: "$$",
    currenciesAccepted: "USD",
    paymentAccepted: "Cash, Credit Card, Fleet Card, EFS, Comdata, Purchase Order",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: SITE.address.geo.lat, longitude: SITE.address.geo.lng },
    hasMap: SITE.address.mapsHref,
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "07:00", closes: "18:00", description: "Shop and tire sales" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "08:00", closes: "14:00", description: "Shop and tire sales" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "00:00", closes: "23:59", description: "24/7 emergency mobile roadside tire service" },
    ],
    contactPoint: [
      { "@type": "ContactPoint", telephone: SITE.phone.primary.e164, contactType: "emergency", areaServed: "US-CA", availableLanguage: ["en", "es"], hoursAvailable: "Mo-Su 00:00-23:59" },
      { "@type": "ContactPoint", telephone: SITE.phone.local.e164, contactType: "customer service", areaServed: "US-CA", availableLanguage: ["en", "es"] },
    ],
    areaServed: [
      { "@type": "GeoCircle", geoMidpoint: { "@type": "GeoCoordinates", latitude: SITE.address.geo.lat, longitude: SITE.address.geo.lng }, geoRadius: "80000" },
      ...SITE.serviceArea.map((city) => ({ "@type": "City", name: `${city}, CA` })),
      { "@type": "AdministrativeArea", name: "San Bernardino County, CA" },
      { "@type": "AdministrativeArea", name: "Riverside County, CA" },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Commercial truck tire services",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "24/7 mobile truck tire roadside assistance", description: "Emergency tire replacement and repair on I-10, I-215, I-15 and SR-60 in the Inland Empire.", areaServed: "Inland Empire, CA" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Commercial truck tire sales", description: "New, retread and major-brand steer, drive and trailer tires." } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "On-site tire installation and mounting", description: "Mounting, balancing and torque-to-spec at the Bloomington shop or at the customer's yard." } },
      ],
    },
    sameAs: SITE.sameAs,
  };
  // No nonce: data blocks are not executed, so CSP script-src does not apply,
  // and browsers blank nonce attributes in the DOM (would cause a hydration warning).
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
