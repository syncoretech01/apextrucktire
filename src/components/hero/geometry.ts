/**
 * Procedural wheel-assembly geometry. Everything is built from lathe,
 * extrude, cylinder, torus and tube primitives — no external models.
 * Lathes revolve around +Y; callers rotate them so the axle is +Z.
 */
import {
  BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  LatheGeometry,
  Path,
  Shape,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const v2 = (r: number, y: number) => new Vector2(r, y);

/** Smooths a polyline profile by inserting Catmull-Rom points between nodes. */
function smoothProfile(points: Vector2[], subdivisions = 3): Vector2[] {
  const out: Vector2[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(points.length - 1, i + 2)]!;
    for (let s = 0; s < subdivisions; s++) {
      const t = s / subdivisions;
      const t2 = t * t;
      const t3 = t2 * t;
      const x =
        0.5 *
        (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
      const y =
        0.5 *
        (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
      out.push(new Vector2(Math.max(0.001, x), y));
    }
  }
  out.push(points[points.length - 1]!.clone());
  return out;
}

/* ------------------------------------------------------------------------ */
/* Tire                                                                     */
/* ------------------------------------------------------------------------ */

export const TIRE = {
  halfWidth: 0.265,
  crownR: 0.972,
  beadR: 0.545,
  treadR: 0.986, // block center radius
  blockH: 0.034,
  blocksAround: 64,
  ribs: [-0.19, -0.095, 0, 0.095, 0.19] as const,
  ribW: 0.084,
};

export function tireCarcassGeometry(): BufferGeometry {
  const h = TIRE.halfWidth;
  const profile = [
    v2(0.535, -0.19),
    v2(0.548, -0.215),
    v2(0.6, -0.25),
    v2(0.7, -h),
    v2(0.82, -0.262),
    v2(0.9, -0.246),
    v2(0.948, -0.216),
    v2(0.966, -0.17),
    v2(TIRE.crownR, -0.1),
    v2(TIRE.crownR, 0.1),
    v2(0.966, 0.17),
    v2(0.948, 0.216),
    v2(0.9, 0.246),
    v2(0.82, 0.262),
    v2(0.7, h),
    v2(0.6, 0.25),
    v2(0.548, 0.215),
    v2(0.535, 0.19),
    v2(0.535, -0.19),
  ];
  const geo = new LatheGeometry(smoothProfile(profile, 3), 112);
  geo.computeVertexNormals();
  return geo;
}

/** Raised sidewall rings (brand band). */
export function sidewallRingGeometry(): BufferGeometry {
  return new TorusGeometry(0.79, 0.006, 8, 96);
}

/** One tread block. Instanced around the crown. */
export function treadBlockGeometry(): BufferGeometry {
  const arc = (2 * Math.PI * TIRE.treadR) / TIRE.blocksAround;
  const len = arc * 0.8;
  return new RoundedBoxGeometry(len, TIRE.blockH, TIRE.ribW, 2, 0.005);
}

/** Returns per-instance {position, rotationZ} for tread blocks (axle = +Z). */
export function treadInstances(): { pos: Vector3; rotZ: number }[] {
  const out: { pos: Vector3; rotZ: number }[] = [];
  const n = TIRE.blocksAround;
  TIRE.ribs.forEach((zRib, ribIndex) => {
    const stagger = ribIndex % 2 === 0 ? 0 : Math.PI / n; // alternate ribs half-step
    // Outer ribs sit a hair lower to suggest the crown's curvature
    const r = TIRE.treadR - (Math.abs(zRib) > 0.15 ? 0.006 : 0);
    for (let i = 0; i < n; i++) {
      const th = (i / n) * Math.PI * 2 + stagger;
      out.push({ pos: new Vector3(r * Math.cos(th), r * Math.sin(th), zRib), rotZ: th - Math.PI / 2 });
    }
  });
  return out;
}

/* ------------------------------------------------------------------------ */
/* Steel wheel                                                              */
/* ------------------------------------------------------------------------ */

export const WHEEL = {
  halfWidth: 0.215,
  flangeR: 0.585,
  seatR: 0.545,
  dropR: 0.49,
  discZ: -0.035, // disc front face (local z)
  discT: 0.032,
  boltCircleR: 0.271,
  boreR: 0.14,
  studs: 10,
};

export function rimBarrelGeometry(): BufferGeometry {
  const profile = [
    v2(0.545, -0.215),
    v2(0.585, -0.218),
    v2(0.59, -0.195),
    v2(0.56, -0.182),
    v2(0.546, -0.15),
    v2(0.526, -0.1),
    v2(0.49, -0.055),
    v2(0.49, 0.02),
    v2(0.526, 0.07),
    v2(0.546, 0.12),
    v2(0.546, 0.17),
    v2(0.56, 0.182),
    v2(0.59, 0.195),
    v2(0.585, 0.218),
    v2(0.545, 0.215),
    // inner surface
    v2(0.533, 0.19),
    v2(0.533, 0.13),
    v2(0.478, 0.03),
    v2(0.478, -0.05),
    v2(0.533, -0.14),
    v2(0.533, -0.19),
    v2(0.545, -0.215),
  ];
  const geo = new LatheGeometry(smoothProfile(profile, 2), 128);
  geo.computeVertexNormals();
  return geo;
}

/** Flat disc with 5 hand holes and 10 stud holes, extruded along +Z. */
export function wheelDiscGeometry(): BufferGeometry {
  const shape = new Shape();
  shape.absarc(0, 0, WHEEL.dropR + 0.002, 0, Math.PI * 2, false);
  const bore = new Path();
  bore.absarc(0, 0, WHEEL.boreR, 0, Math.PI * 2, true);
  shape.holes.push(bore);

  // 5 hand holes — elongated tangentially
  for (let i = 0; i < 5; i++) {
    const th = (i / 5) * Math.PI * 2 + Math.PI / 10;
    const cx = 0.39 * Math.cos(th);
    const cy = 0.39 * Math.sin(th);
    const hole = new Path();
    hole.absellipse(cx, cy, 0.066, 0.046, 0, Math.PI * 2, true, th + Math.PI / 2);
    shape.holes.push(hole);
  }
  // 10 stud holes
  for (let i = 0; i < WHEEL.studs; i++) {
    const th = (i / WHEEL.studs) * Math.PI * 2;
    const hole = new Path();
    hole.absarc(WHEEL.boltCircleR * Math.cos(th), WHEEL.boltCircleR * Math.sin(th), 0.024, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }

  const geo = new ExtrudeGeometry(shape, {
    depth: WHEEL.discT,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2,
    curveSegments: 28,
  });
  geo.translate(0, 0, WHEEL.discZ - WHEEL.discT);
  geo.computeVertexNormals();
  return geo;
}

/** Raised pilot ring around the center bore. */
export function pilotRingGeometry(): BufferGeometry {
  return new TorusGeometry(WHEEL.boreR + 0.012, 0.01, 10, 64);
}

/* ------------------------------------------------------------------------ */
/* Hub, studs, nuts                                                         */
/* ------------------------------------------------------------------------ */

export const HUB = {
  capR: 0.125,
  capZ: 0.02,
  capDepth: 0.13,
  flangeR: 0.31,
  flangeZ: -0.5,
  barrelR: 0.19,
};

export function hubGeometry(): BufferGeometry {
  // Profile from the back barrel forward to the domed cap (axis +Y, rotated later)
  const profile = [
    v2(0.001, -0.62),
    v2(0.19, -0.62),
    v2(0.19, -0.52),
    v2(HUB.flangeR, -0.52),
    v2(HUB.flangeR, -0.47),
    v2(0.19, -0.47),
    v2(0.19, -0.16),
    v2(0.145, -0.13),
    v2(0.135, 0.0),
    v2(0.125, 0.02),
    v2(0.12, 0.09),
    v2(0.095, 0.135),
    v2(0.05, 0.15),
    v2(0.001, 0.152),
  ];
  const geo = new LatheGeometry(smoothProfile(profile, 2), 80);
  geo.computeVertexNormals();
  return geo;
}

/** Wheel stud — thin cylinder along +Z. */
export function studGeometry(): BufferGeometry {
  const g = new CylinderGeometry(0.014, 0.014, 0.6, 12, 1);
  g.rotateX(Math.PI / 2);
  g.translate(0, 0, -0.2);
  return g;
}

/** Flanged hex lug nut along +Z. */
export function lugNutGeometry(): BufferGeometry {
  const hex = new CylinderGeometry(0.03, 0.03, 0.05, 6, 1);
  hex.rotateX(Math.PI / 2);
  hex.translate(0, 0, 0.037);
  const flange = new CylinderGeometry(0.041, 0.041, 0.012, 24, 1);
  flange.rotateX(Math.PI / 2);
  flange.translate(0, 0, 0.006);
  // Merge manually (small geometries; avoids importing BufferGeometryUtils)
  return mergeGeometries([hex, flange]);
}

export function studPositions(): Vector3[] {
  const out: Vector3[] = [];
  for (let i = 0; i < WHEEL.studs; i++) {
    const th = (i / WHEEL.studs) * Math.PI * 2;
    out.push(new Vector3(WHEEL.boltCircleR * Math.cos(th), WHEEL.boltCircleR * Math.sin(th), 0));
  }
  return out;
}

/* ------------------------------------------------------------------------ */
/* Brake drum                                                               */
/* ------------------------------------------------------------------------ */

export function drumGeometry(): BufferGeometry {
  const profile = [
    v2(0.001, -0.17),
    v2(0.33, -0.17),
    v2(0.36, -0.15),
    v2(0.36, 0.14),
    v2(0.345, 0.16),
    v2(0.2, 0.17),
    v2(0.19, 0.15),
    v2(0.001, 0.15),
  ];
  const geo = new LatheGeometry(smoothProfile(profile, 2), 96);
  geo.computeVertexNormals();
  return geo;
}

export function drumRibGeometry(): BufferGeometry {
  return new TorusGeometry(0.365, 0.012, 8, 96);
}

/* ------------------------------------------------------------------------ */
/* Valve stem                                                               */
/* ------------------------------------------------------------------------ */

export function valveStemGeometry(): BufferGeometry {
  // Emerges from the rim drop-center and bends outward past the flange
  const curve = new CatmullRomCurve3([
    new Vector3(0.49, 0.0, 0.02),
    new Vector3(0.505, 0.02, 0.09),
    new Vector3(0.53, 0.05, 0.15),
    new Vector3(0.585, 0.11, 0.185),
    new Vector3(0.65, 0.16, 0.2),
  ]);
  return new TubeGeometry(curve, 24, 0.012, 10, false);
}

export function valveCapGeometry(): BufferGeometry {
  const g = new CylinderGeometry(0.016, 0.016, 0.035, 8, 1);
  return g;
}

/* ------------------------------------------------------------------------ */
/* Utility                                                                  */
/* ------------------------------------------------------------------------ */

/** Minimal non-indexed merge for a few small geometries with position/normal/uv. */
export function mergeGeometries(geos: BufferGeometry[]): BufferGeometry {
  const merged = new BufferGeometry();
  const attrs = ["position", "normal", "uv"] as const;
  const arrays: Record<string, number[]> = { position: [], normal: [], uv: [] };
  for (const g of geos) {
    const ng = g.index ? g.toNonIndexed() : g;
    for (const name of attrs) {
      const a = ng.getAttribute(name);
      if (a) arrays[name]!.push(...(a.array as ArrayLike<number> as number[]));
    }
    g.dispose();
  }
  merged.setAttribute("position", new Float32BufferAttribute(arrays.position!, 3));
  merged.setAttribute("normal", new Float32BufferAttribute(arrays.normal!, 3));
  merged.setAttribute("uv", new Float32BufferAttribute(arrays.uv!, 2));
  return merged;
}

