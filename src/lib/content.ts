/**
 * Site copy and data that is likely to be edited by the business.
 * README → "Swap points" lists every placeholder in here.
 */

/** Tire brands carried. Text wordmarks; swap for licensed logo SVGs if desired. */
export const BRANDS = [
  "Michelin",
  "Bridgestone",
  "Goodyear",
  "Continental",
  "Yokohama",
  "Firestone",
  "Toyo",
  "Hankook",
  "Double Coin",
  "Sailun",
  "BFGoodrich",
  "Roadmaster",
];

/** PLACEHOLDER credentials — replace with verified numbers before launch. */
export const CREDENTIALS = [
  { value: 12, suffix: "+", label: "Years on the corridor", note: "Bloomington-based since day one" },
  { value: 340, suffix: "+", label: "Fleets served", note: "Regional carriers to owner-operators" },
  { value: 18400, suffix: "+", label: "Trucks back on the road", note: "Roadside calls closed" },
  { value: 45, prefix: "<", suffix: " min", label: "Average response", note: "I-10 / I-215 core zone" },
];

export type Service = {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  lead: string;
  included: string[];
  expect: { label: string; value: string }[];
  cta: { label: string; href: string; kind: "call" | "anchor" };
  image: { src: string; alt: string };
};

export const SERVICES: Service[] = [
  {
    id: "roadside",
    index: "01",
    eyebrow: "24/7 mobile roadside",
    title: "Blowout on the shoulder. We come to the truck.",
    lead:
      "Tire blowouts, flats, zipper ruptures, tread separation — on I-10, I-215, I-15, SR-60 and the yards and docks between them. One call to dispatch, a service truck rolls with the right tire already on it.",
    included: [
      "Mobile tire replacement, steer / drive / trailer",
      "On-the-spot repair when the casing is sound",
      "Air-up, valve and stem work, flat rescues",
      "Dual and tandem swaps with torque to spec",
      "Cash, fleet card, EFS / Comdata, PO on account",
    ],
    expect: [
      { label: "Answer", value: "Live dispatcher, not voicemail" },
      { label: "ETA", value: "Under 45 min in the core zone" },
      { label: "Callback", value: "Driver gets the tech's ETA by text" },
    ],
    cta: { label: "Call dispatch now", href: "tel:+18775120301", kind: "call" },
    image: { src: "/images/services/roadside.jpg", alt: "Service truck on the freeway shoulder at night with work lights on a downed tractor-trailer" },
  },
  {
    id: "sales",
    index: "02",
    eyebrow: "Commercial truck tire sales",
    title: "New, retread and major brands — spec'd to the position.",
    lead:
      "Steer, drive and trailer tires from Michelin, Bridgestone, Goodyear, Continental, Yokohama and value lines, plus quality retreads for drive and trailer positions. We spec by route, load and mileage target, not by what is on the rack.",
    included: [
      "11R22.5, 295/75R22.5, 285/75R24.5, 11R24.5 and wide-base",
      "Steer ribs, regional and long-haul drives, trailer ribs",
      "Cap-and-casing retreads with casing inspection",
      "Fleet pricing, scrap-tire handling, casing credits",
      "Stock on hand — no waiting on a distributor run",
    ],
    expect: [
      { label: "Quote", value: "Same day, by position and quantity" },
      { label: "Stock", value: "Common sizes in stock daily" },
      { label: "Warranty", value: "Manufacturer-backed, handled here" },
    ],
    cta: { label: "Get a tire quote", href: "#request-service", kind: "anchor" },
    image: { src: "/images/services/sales.jpg", alt: "Rows of new commercial truck tires racked in the Apex warehouse" },
  },
  {
    id: "install",
    index: "03",
    eyebrow: "On-site installation & mounting",
    title: "Mounted, balanced, torqued — at our shop or your yard.",
    lead:
      "Bring the truck to Slover Ave., or we bring the service truck to your yard and turn a whole set while your drivers sleep. Every wheel goes back on with a calibrated torque wrench and a retorque tag.",
    included: [
      "Mount, dismount, balance on steer positions",
      "Full-fleet yard service, scheduled after hours",
      "Rotation, tread-depth logs and pressure checks",
      "Wheel and rim inspection, stud and nut replacement",
      "Retorque follow-up at 50–100 miles",
    ],
    expect: [
      { label: "Shop", value: "Mon–Fri 7–6, Sat 8–2, no appointment for singles" },
      { label: "Yard", value: "Book a night; we turn 10+ tires a visit" },
      { label: "Paperwork", value: "Torque log and DOT numbers on the invoice" },
    ],
    cta: { label: "Schedule installation", href: "#request-service", kind: "anchor" },
    image: { src: "/images/services/install.jpg", alt: "Technician torquing lug nuts on a truck wheel with a calibrated wrench" },
  },
];

export const ROADSIDE_STEPS = [
  {
    n: "01",
    title: "Call",
    body: "Dial dispatch. A person answers, takes your location, tire size and position, and what the truck is hauling. Under two minutes.",
    detail: "Say the mile marker, exit or cross street. Landmark works.",
  },
  {
    n: "02",
    title: "Locate",
    body: "We pin you on the corridor and pick the nearest service truck with your size on board. You get the tech's name and ETA by text.",
    detail: "Steer, drive, trailer — the right tire rides out the first time.",
  },
  {
    n: "03",
    title: "Dispatch",
    body: "The truck rolls with lights, a jack rated for a loaded trailer, and an impact that breaks 500 ft·lb nuts. Roadside safety setup on arrival.",
    detail: "Cones, triangles, spotter. We work the traffic side second.",
  },
  {
    n: "04",
    title: "Rolling",
    body: "New tire mounted, nuts torqued to spec, pressure set, retorque tag on the wheel. Invoice by email before you merge back on.",
    detail: "Most calls: back rolling inside the hour.",
  },
];

export type TirePosition = "steer" | "drive" | "trailer";

export const POSITIONS: Record<
  TirePosition,
  { label: string; role: string; picks: { name: string; type: string; note: string }[] }
> = {
  steer: {
    label: "Steer",
    role: "Front axle. Handling, wet grip, even wear. Never a retread on a steer.",
    picks: [
      { name: "Michelin X Line Energy Z", type: "Long-haul steer rib", note: "Low rolling resistance, 11R22.5 / 295/75R22.5" },
      { name: "Bridgestone R284 Ecopia", type: "Regional / long-haul steer", note: "Rib design resists irregular wear" },
      { name: "Continental Conti Hybrid HS3", type: "Regional steer", note: "Stone-ejection grooves for yard work" },
      { name: "Yokohama 108R", type: "Regional steer / all-position", note: "Value pick for mixed routes" },
    ],
  },
  drive: {
    label: "Drive",
    role: "Powered axles. Traction, block tread, mileage. Retreads welcome here.",
    picks: [
      { name: "Michelin X Multi D", type: "Regional drive lug", note: "Deep 26/32 tread, regroovable" },
      { name: "Goodyear Endurance RSD", type: "Regional / urban drive", note: "Cut and chip resistant compound" },
      { name: "Bridgestone M726 ELA", type: "Long-haul drive", note: "Fuel-efficient closed shoulder" },
      { name: "Apex Retread — Drive lug", type: "Premium cap on inspected casing", note: "Best cost per mile for drive positions" },
    ],
  },
  trailer: {
    label: "Trailer",
    role: "Free-rolling axles. Scrub resistance, low rolling resistance, cost per mile.",
    picks: [
      { name: "Michelin X Line Energy T", type: "Long-haul trailer rib", note: "SmartWay verified" },
      { name: "Bridgestone R197", type: "Trailer / all-position", note: "Shoulder resists scrub in tight yards" },
      { name: "Double Coin RT500", type: "Value trailer rib", note: "Solid casing for later retread" },
      { name: "Apex Retread — Trailer rib", type: "Cap-and-casing", note: "Fleet favorite for van and reefer" },
    ],
  },
};

export const DIFFERENTIATORS = [
  {
    n: "01",
    title: "Dispatch is a person",
    body: "24 hours a day the phone is answered by someone who knows the corridor, not a call center reading a script. They ask the right three questions and the truck rolls.",
  },
  {
    n: "02",
    title: "Right tire, first trip",
    body: "Service trucks carry the common steer, drive and trailer sizes. We do not drive out to look at it and drive back for the tire.",
  },
  {
    n: "03",
    title: "Torque, logged",
    body: "Every wheel goes on with a calibrated wrench. Torque values and DOT numbers are on your invoice. Your safety file is one PDF away.",
  },
  {
    n: "04",
    title: "Fleet pricing without the fleet contract",
    body: "Owner-operators get the same tire pricing as the fleets. No membership, no minimums, no games with the road-call surcharge.",
  },
  {
    n: "05",
    title: "One yard, one number",
    body: "Roadside, sales and installation under one roof on Slover Ave. The tech who put your tire on is the one who answers when you call about it.",
  },
];

/** PLACEHOLDER testimonials — replace with real, permissioned quotes before launch. */
export const TESTIMONIALS = [
  {
    quote:
      "Reefer down on the 10 at Cherry Ave at 2:40 in the morning with a load that could not wait. Dispatch picked up on the second ring; the truck was there in thirty-five minutes with the right tire.",
    name: "Placeholder — Fleet Manager",
    role: "Regional dry-van carrier, 60 tractors",
  },
  {
    quote:
      "We moved our whole drive-tire program to Apex retreads. Cost per mile dropped and we have not had a cap failure in two years. They inspect casings like they are paying for them.",
    name: "Placeholder — Maintenance Director",
    role: "Food distribution fleet",
  },
  {
    quote:
      "Owner-operator, one truck, and they still treat me like a fleet. Same pricing, same speed. The torque log on the invoice is the kind of thing nobody else bothers with.",
    name: "Placeholder — Owner-Operator",
    role: "Flatbed, Southern California lanes",
  },
  {
    quote:
      "Night yard service is the reason we use them. Ten trailers turned between shifts, nobody waiting on a bay in the morning.",
    name: "Placeholder — Dispatcher",
    role: "Intermodal drayage, Ontario",
  },
];
