/**
 * Single source of truth for NAP (name, address, phone) and business facts.
 * Every phone/email/address on the site reads from here — never hardcode.
 */
export const SITE = {
  name: "Apex Truck Tire",
  legalName: "Apex Truck Tire",
  tagline: "24/7 commercial truck roadside, tire sales and on-site installation — Inland Empire",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.apextrucktire.com",
  phone: {
    primary: { display: "(877) 512-0301", e164: "+18775120301", href: "tel:+18775120301" },
    local: { display: "(909) 259-2692", e164: "+19092592692", href: "tel:+19092592692" },
  },
  email: { display: "admin@apextrucktire.com", href: "mailto:admin@apextrucktire.com" },
  address: {
    street: "17553 Slover Ave.",
    city: "Bloomington",
    region: "CA",
    postalCode: "92316",
    country: "US",
    oneLine: "17553 Slover Ave., Bloomington, CA 92316",
    // Approximate coordinates for 17553 Slover Ave, Bloomington CA 92316.
    // Verify against Google Business Profile before launch (README → Swap points).
    geo: { lat: 34.0605, lng: -117.3895 },
    directionsHref:
      "https://www.google.com/maps/dir/?api=1&destination=17553+Slover+Ave%2C+Bloomington%2C+CA+92316",
    mapsHref: "https://www.google.com/maps/search/?api=1&query=17553+Slover+Ave%2C+Bloomington%2C+CA+92316",
  },
  hours: {
    emergency: "24 hours, 7 days — roadside dispatch never closes",
    shop: "Mon–Fri 7:00 AM – 6:00 PM · Sat 8:00 AM – 2:00 PM",
  },
  // Corridor + coverage language used in copy and schema
  corridor: "I-10 / I-215 / I-15 / SR-60",
  serviceArea: [
    "Bloomington", "Fontana", "Rialto", "Colton", "San Bernardino", "Ontario",
    "Rancho Cucamonga", "Riverside", "Jurupa Valley", "Redlands", "Loma Linda",
    "Moreno Valley", "Perris", "Beaumont", "Banning", "Chino", "Pomona",
  ],
  // Placeholder social profiles — swap in README → Swap points
  sameAs: [] as string[],
  // Live status strip. Set from real dispatch data when available.
  status: { avgResponseMinutes: 45, dispatching: true },
} as const;

export const CTA = {
  callLabel: `Call Now — ${SITE.phone.primary.display}`,
  requestLabel: "Request Service",
  formAnchor: "#request-service",
} as const;
