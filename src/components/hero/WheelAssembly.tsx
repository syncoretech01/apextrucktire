"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Color, Group, InstancedMesh, MeshPhysicalMaterial, Object3D, Vector3 } from "three";
import gsap from "gsap";
import {
  CALLOUTS,
  COLORS,
  EXPLODE_CENTER_Z,
  PARTS,
  type PartId,
} from "./wheelConfig";
import {
  drumGeometry,
  drumRibGeometry,
  hubGeometry,
  lugNutGeometry,
  pilotRingGeometry,
  rimBarrelGeometry,
  sidewallRingGeometry,
  studGeometry,
  studPositions,
  tireCarcassGeometry,
  treadBlockGeometry,
  treadInstances,
  valveCapGeometry,
  valveStemGeometry,
  wheelDiscGeometry,
  WHEEL,
} from "./geometry";
import { heroState } from "./heroState";
import { DUR } from "@/lib/motion/tokens";

/* ------------------------------------------------------------------------ */
/* Materials                                                                */
/* ------------------------------------------------------------------------ */

type MatSpec = Partial<
  Pick<
    MeshPhysicalMaterial,
    | "roughness"
    | "metalness"
    | "anisotropy"
    | "anisotropyRotation"
    | "clearcoat"
    | "clearcoatRoughness"
    | "sheen"
    | "sheenRoughness"
    | "envMapIntensity"
  >
> & { color: string; sheenColor?: string };

function makeMaterial(spec: MatSpec) {
  const { color, sheenColor, ...rest } = spec;
  const m = new MeshPhysicalMaterial({ color: new Color(color), ...rest });
  if (sheenColor) m.sheenColor = new Color(sheenColor);
  m.userData.baseColor = m.color.clone();
  return m;
}

const MATERIALS: Record<string, MatSpec> = {
  rubber: { color: COLORS.rubber, roughness: 0.9, metalness: 0, sheen: 0.35, sheenRoughness: 0.85, sheenColor: "#3a3e45", envMapIntensity: 0.6 },
  tread: { color: COLORS.rubberTread, roughness: 0.82, metalness: 0, sheen: 0.4, sheenRoughness: 0.7, sheenColor: "#454a52", envMapIntensity: 0.7 },
  rim: { color: COLORS.rim, roughness: 0.44, metalness: 0.5, anisotropy: 0.7, anisotropyRotation: 0, clearcoat: 0.55, clearcoatRoughness: 0.28, envMapIntensity: 1.1 },
  hub: { color: COLORS.hub, roughness: 0.34, metalness: 0.88, anisotropy: 0.6, clearcoat: 0.3, envMapIntensity: 1.2 },
  nuts: { color: COLORS.nuts, roughness: 0.4, metalness: 0.85, envMapIntensity: 1.1 },
  drum: { color: COLORS.drum, roughness: 0.86, metalness: 0.55, envMapIntensity: 0.5 },
  brass: { color: COLORS.brass, roughness: 0.38, metalness: 0.95, envMapIntensity: 1.0 },
  cap: { color: "#1b1d20", roughness: 0.6, metalness: 0.2, envMapIntensity: 0.6 },
};

/* ------------------------------------------------------------------------ */
/* Assembly                                                                 */
/* ------------------------------------------------------------------------ */

const AXLE_ROT: [number, number, number] = [Math.PI / 2, 0, 0]; // lathe Y → axle Z

export function WheelAssembly() {
  const invalidate = useThree((s) => s.invalidate);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  // --- geometry (built once) ---------------------------------------------
  const geo = useMemo(
    () => ({
      carcass: tireCarcassGeometry(),
      ring: sidewallRingGeometry(),
      block: treadBlockGeometry(),
      barrel: rimBarrelGeometry(),
      disc: wheelDiscGeometry(),
      pilot: pilotRingGeometry(),
      hub: hubGeometry(),
      stud: studGeometry(),
      nut: lugNutGeometry(),
      drum: drumGeometry(),
      rib: drumRibGeometry(),
      valve: valveStemGeometry(),
      cap: valveCapGeometry(),
    }),
    [],
  );
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);

  // --- materials, one instance per part so hover dimming is independent ---
  const mats = useMemo(() => {
    const byPart: Record<PartId, MeshPhysicalMaterial[]> = {
      lugNuts: [makeMaterial(MATERIALS.nuts!)],
      outerWheel: [makeMaterial(MATERIALS.rim!), makeMaterial(MATERIALS.rim!)],
      valveStem: [makeMaterial(MATERIALS.brass!), makeMaterial(MATERIALS.cap!)],
      outerTire: [makeMaterial(MATERIALS.rubber!), makeMaterial(MATERIALS.tread!)],
      hub: [makeMaterial(MATERIALS.hub!), makeMaterial(MATERIALS.nuts!)],
      innerWheel: [makeMaterial(MATERIALS.rim!), makeMaterial(MATERIALS.rim!)],
      innerTire: [makeMaterial(MATERIALS.rubber!), makeMaterial(MATERIALS.tread!)],
      drum: [makeMaterial(MATERIALS.drum!)],
    };
    return byPart;
  }, []);
  useEffect(
    () => () => Object.values(mats).forEach((list) => list.forEach((m) => m.dispose())),
    [mats],
  );

  // --- refs ----------------------------------------------------------------
  const parts = useRef(new Map<PartId, Group>());
  const centering = useRef<Group>(null);
  const treadOuter = useRef<InstancedMesh>(null);
  const treadInner = useRef<InstancedMesh>(null);
  const dimState = useRef<Record<PartId, { dim: number; glow: number }>>(
    Object.fromEntries(PARTS.map((p) => [p.id, { dim: 1, glow: 0 }])) as Record<PartId, { dim: number; glow: number }>,
  );
  const hoverTweens = useRef<gsap.core.Tween[]>([]);

  const setPart = (id: PartId) => (el: Group | null) => {
    if (el) parts.current.set(id, el);
    else parts.current.delete(id);
  };

  // --- tread instancing ----------------------------------------------------
  const instances = useMemo(() => treadInstances(), []);
  useLayoutEffect(() => {
    const dummy = new Object3D();
    for (const mesh of [treadOuter.current, treadInner.current]) {
      if (!mesh) continue;
      instances.forEach((inst, i) => {
        dummy.position.copy(inst.pos);
        dummy.rotation.set(0, 0, inst.rotZ);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
    invalidate();
  }, [instances, invalidate]);

  // --- hover → dim others, glow hovered -----------------------------------
  useEffect(() => {
    return heroState.onHover(() => {
      hoverTweens.current.forEach((t) => t.kill());
      hoverTweens.current = [];
      const h = heroState.hovered;
      for (const p of PARTS) {
        const target = dimState.current[p.id];
        const dim = h && h !== p.id ? 0.28 : 1;
        const glow = h === p.id ? 1 : 0;
        hoverTweens.current.push(
          gsap.to(target, { dim, glow, duration: DUR.md, ease: "power2.out", onUpdate: () => invalidate() }),
        );
      }
    });
  }, [invalidate]);

  const accent = useMemo(() => new Color(COLORS.accent), []);
  const tmpColor = useMemo(() => new Color(), []);
  const tmpVec = useMemo(() => new Vector3(), []);

  // --- per-frame transforms ------------------------------------------------
  useFrame(() => {
    const explode = heroState.introActive ? heroState.intro : heroState.scroll;
    heroState.explode = explode;

    if (centering.current) centering.current.position.z = -EXPLODE_CENTER_Z * explode;

    for (const p of PARTS) {
      const g = parts.current.get(p.id);
      if (!g) continue;
      // Parts arrive in order: later stagger → starts moving later on the scrub.
      const t = Math.min(1, Math.max(0, (explode - 0.22 * p.stagger) / (1 - 0.22)));
      g.position.z = p.z + p.explodeZ * t;
      g.rotation.z = p.spin * t;

      // Hover dim/glow applied to materials
      const ds = dimState.current[p.id];
      for (const m of mats[p.id]) {
        const base = m.userData.baseColor as Color;
        tmpColor.copy(base).multiplyScalar(ds.dim);
        m.color.copy(tmpColor);
        m.emissive.copy(accent).multiplyScalar(ds.glow * 0.045);
      }
    }

    // Lug nuts fan out radially as they leave the studs
    const nutsGroup = parts.current.get("lugNuts");
    if (nutsGroup) {
      const t = Math.min(1, Math.max(0, (explode - 0.22 * 0.55) / (1 - 0.22)));
      const s = 1 + 0.32 * t;
      nutsGroup.scale.set(s, s, 1);
    }

    // Project callout anchors to screen space for the overlay
    for (const c of CALLOUTS) {
      const g = parts.current.get(c.part);
      if (!g) continue;
      tmpVec.set(c.anchor[0], c.anchor[1], c.anchor[2]);
      g.localToWorld(tmpVec);
      const depth = tmpVec.distanceTo(camera.position);
      tmpVec.project(camera);
      heroState.projected.set(c.id, {
        x: (tmpVec.x * 0.5 + 0.5) * size.width,
        y: (-tmpVec.y * 0.5 + 0.5) * size.height,
        depth,
      });
    }
    heroState.size = { width: size.width, height: size.height };
    heroState.emitFrame();
  });

  // --- pointer events ------------------------------------------------------
  const over = (id: PartId) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    heroState.setHovered(id);
    document.body.style.cursor = "crosshair";
  };
  const out = () => {
    heroState.setHovered(null);
    document.body.style.cursor = "";
  };

  const studs = useMemo(() => studPositions(), []);

  return (
    <group ref={centering}>
      {/* Lug nuts */}
      <group ref={setPart("lugNuts")} onPointerOver={over("lugNuts")} onPointerOut={out}>
        {studs.map((s, i) => (
          <mesh key={i} geometry={geo.nut} material={mats.lugNuts[0]} position={[s.x, s.y, WHEEL.discZ]} castShadow receiveShadow />
        ))}
      </group>

      {/* Outer steel wheel */}
      <group ref={setPart("outerWheel")} onPointerOver={over("outerWheel")} onPointerOut={out}>
        <mesh geometry={geo.barrel} material={mats.outerWheel[0]} rotation={AXLE_ROT} castShadow receiveShadow />
        <mesh geometry={geo.disc} material={mats.outerWheel[1]} castShadow receiveShadow />
        <mesh geometry={geo.pilot} material={mats.outerWheel[1]} position={[0, 0, WHEEL.discZ]} castShadow />
      </group>

      {/* Valve stem — rides with the outer wheel */}
      <group ref={setPart("valveStem")} onPointerOver={over("valveStem")} onPointerOut={out}>
        <mesh geometry={geo.valve} material={mats.valveStem[0]} castShadow />
        <mesh geometry={geo.cap} material={mats.valveStem[1]} position={[0.66, 0.168, 0.2]} rotation={[0, 0, -0.7]} castShadow />
      </group>

      {/* Outer tire */}
      <group ref={setPart("outerTire")} onPointerOver={over("outerTire")} onPointerOut={out}>
        <mesh geometry={geo.carcass} material={mats.outerTire[0]} rotation={AXLE_ROT} castShadow receiveShadow />
        <mesh geometry={geo.ring} material={mats.outerTire[0]} position={[0, 0, 0.262]} />
        <mesh geometry={geo.ring} material={mats.outerTire[0]} position={[0, 0, -0.262]} />
        <instancedMesh ref={treadOuter} args={[geo.block, mats.outerTire[1], instances.length]} castShadow receiveShadow />
      </group>

      {/* Hub with studs */}
      <group ref={setPart("hub")} onPointerOver={over("hub")} onPointerOut={out}>
        <mesh geometry={geo.hub} material={mats.hub[0]} rotation={AXLE_ROT} castShadow receiveShadow />
        {studs.map((s, i) => (
          <mesh key={i} geometry={geo.stud} material={mats.hub[1]} position={[s.x, s.y, -0.08]} castShadow />
        ))}
      </group>

      {/* Inner dual wheel (mirrored) */}
      <group ref={setPart("innerWheel")} onPointerOver={over("innerWheel")} onPointerOut={out}>
        <group rotation={[0, Math.PI, 0]}>
          <mesh geometry={geo.barrel} material={mats.innerWheel[0]} rotation={AXLE_ROT} castShadow receiveShadow />
          <mesh geometry={geo.disc} material={mats.innerWheel[1]} castShadow receiveShadow />
          <mesh geometry={geo.pilot} material={mats.innerWheel[1]} position={[0, 0, WHEEL.discZ]} castShadow />
        </group>
      </group>

      {/* Inner tire */}
      <group ref={setPart("innerTire")} onPointerOver={over("innerTire")} onPointerOut={out}>
        <mesh geometry={geo.carcass} material={mats.innerTire[0]} rotation={AXLE_ROT} castShadow receiveShadow />
        <mesh geometry={geo.ring} material={mats.innerTire[0]} position={[0, 0, 0.262]} />
        <mesh geometry={geo.ring} material={mats.innerTire[0]} position={[0, 0, -0.262]} />
        <instancedMesh ref={treadInner} args={[geo.block, mats.innerTire[1], instances.length]} castShadow receiveShadow />
      </group>

      {/* Brake drum */}
      <group ref={setPart("drum")} onPointerOver={over("drum")} onPointerOut={out}>
        <mesh geometry={geo.drum} material={mats.drum[0]} rotation={AXLE_ROT} castShadow receiveShadow />
        <mesh geometry={geo.rib} material={mats.drum[0]} position={[0, 0, -0.08]} castShadow />
        <mesh geometry={geo.rib} material={mats.drum[0]} position={[0, 0, 0.0]} castShadow />
        <mesh geometry={geo.rib} material={mats.drum[0]} position={[0, 0, 0.08]} castShadow />
      </group>
    </group>
  );
}

