/**
 * Wheel assembly configuration: parts, assembled positions, explode offsets
 * (along the axle axis, local Z), scroll-linked spin, and callout labels.
 * Tune the explode here — see MOTION.md → "Tuning the hero explode".
 *
 * Units: tire outer radius ≈ 1.0 (an 11R22.5 on a 22.5×8.25 wheel).
 */
export type PartId =
  | "lugNuts"
  | "outerWheel"
  | "valveStem"
  | "outerTire"
  | "hub"
  | "innerWheel"
  | "innerTire"
  | "drum";

export type PartSpec = {
  id: PartId;
  /** Assembled position along the axle (Z). */
  z: number;
  /** Added along Z at explode = 1. */
  explodeZ: number;
  /** Extra spin about the axle at explode = 1 (radians). */
  spin: number;
  /** Order in which the part "arrives" at its exploded slot (0..1 window start). */
  stagger: number;
};

export const PARTS: PartSpec[] = [
  { id: "lugNuts",    z: 0,     explodeZ: 1.65,  spin: 0.55,  stagger: 0.55 },
  { id: "outerWheel", z: 0,     explodeZ: 1.1,   spin: 0.25,  stagger: 0.4 },
  { id: "valveStem",  z: 0,     explodeZ: 1.1,   spin: 0.25,  stagger: 0.4 },
  { id: "outerTire",  z: 0,     explodeZ: 0.6,   spin: -0.18, stagger: 0.25 },
  { id: "hub",        z: 0,     explodeZ: 0.12,  spin: 0,     stagger: 0.1 },
  { id: "innerWheel", z: -0.58, explodeZ: -0.55, spin: -0.3,  stagger: 0.35 },
  { id: "innerTire",  z: -0.58, explodeZ: -1.0,  spin: 0.22,  stagger: 0.5 },
  { id: "drum",       z: -0.62, explodeZ: -1.55, spin: 0.4,   stagger: 0.65 },
];

/** Midpoint of the exploded line, used to keep the assembly centered. */
export const EXPLODE_CENTER_Z = (() => {
  const zs = PARTS.map((p) => p.z + p.explodeZ);
  return (Math.max(...zs) + Math.min(...zs)) / 2;
})();

export type CalloutSpec = {
  id: string;
  part: PartId;
  label: string;
  spec: string;
  /** Anchor point in the part's local space. */
  anchor: [number, number, number];
  /** Which side of the screen the label sits on. */
  side: "left" | "right";
  /** Vertical slot, 0..1 of the hero height. */
  slot: number;
  /** Explode progress at which the callout appears (hysteresis handled in code). */
  at: number;
};

export const CALLOUTS: CalloutSpec[] = [
  { id: "nuts",     part: "lugNuts",    label: "Lug nuts",        spec: "10-stud · 33 mm flange · torqued 450–500 ft·lb", anchor: [0, 0.271, 0.06],  side: "left",  slot: 0.16, at: 0.88 },
  { id: "wheel",    part: "outerWheel", label: "Steel wheel",     spec: "22.5 × 8.25 · hub-piloted · 5 hand holes",       anchor: [0.4, 0.44, 0.19], side: "left",  slot: 0.34, at: 0.78 },
  { id: "valve",    part: "valveStem",  label: "Valve stem",      spec: "TR-501 bent brass · metal cap",                  anchor: [0.52, 0.12, 0.16], side: "left", slot: 0.52, at: 0.82 },
  { id: "tread",    part: "outerTire",  label: "Tread",           spec: "11R22.5 · drive lug · 32/32 new",                anchor: [0, 1.0, 0.0],     side: "left",  slot: 0.7,  at: 0.62 },
  { id: "sidewall", part: "outerTire",  label: "Sidewall",        spec: "Load range H · 16-ply rated",                    anchor: [-0.62, -0.62, 0.26], side: "left", slot: 0.86, at: 0.66 },
  { id: "hub",      part: "hub",        label: "Hub",             spec: "Oil-bath · 10-stud pilot",                       anchor: [0, 0.13, 0.16],   side: "right", slot: 0.22, at: 0.5 },
  { id: "inner",    part: "innerWheel", label: "Inner dual",      spec: "Matched tread depth · ≤ 4/32 variance",          anchor: [0, -0.585, 0.0],  side: "right", slot: 0.62, at: 0.74 },
  { id: "drum",     part: "drum",       label: "Brake drum",      spec: "16.5 × 7 cast · inspected at every service",     anchor: [0, 0.36, 0.05],   side: "right", slot: 0.42, at: 0.92 },
];

export const CAMERA = {
  fov: 30,
  distanceAssembled: 6.1,
  distanceExploded: 8.3,
  /** Extra distance multiplier for portrait viewports. */
  portraitDolly: 1.02,
  /** Camera height above the assembly. */
  y: 0.42,
  /** Pointer parallax amplitude (world units). */
  parallaxX: 0.22,
  parallaxY: 0.12,
  /** Per-frame damping factor for the parallax lerp. */
  parallaxDamp: 0.07,
};

export const RIG = {
  /** Yaw of the assembly at explode 0 → 1 (radians). Negative = face turns left. */
  yawAssembled: -0.62,
  yawExploded: -1.12,
  pitch: 0.16,
  /** Horizontal offset at explode 0 so the wheel sits right of the headline (landscape). */
  offsetXAssembled: 1.0,
  /** Portrait: the exploded line runs diagonally down the screen instead of across. */
  portrait: {
    yawAssembled: -0.62,
    yawExploded: -0.42,
    pitchAssembled: 0.16,
    pitchExploded: 1.02,
    /** Vertical offset at explode 0 so the wheel sits above the copy. */
    offsetY: 0.95,
    scale: 0.68,
  },
};

export const COLORS = {
  rubber: "#17181c",
  rubberTread: "#191a1d",
  rim: "#bcc2c9",
  hub: "#3a3f46",
  nuts: "#a7aeb6",
  drum: "#26292c",
  brass: "#9c8a55",
  accent: "#ff6b1a",
};
