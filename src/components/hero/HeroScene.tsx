"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Bloom, ChromaticAberration, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { Group, NoToneMapping, Vector2 } from "three";
import { WheelAssembly } from "./WheelAssembly";
import { heroState } from "./heroState";
import { CAMERA, RIG } from "./wheelConfig";

type Props = {
  /** Called once the first real frames have rendered (poster can cross-fade). */
  onReady?: () => void;
  /** Called if the WebGL context is lost; parent falls back to the poster. */
  onContextLost?: () => void;
  /** Static render mode for the poster/sequence tool: fixed explode, no parallax. */
  fixedExplode?: number;
  className?: string;
};

/**
 * The hero canvas. frameloop="demand": nothing renders unless heroState
 * asks for a frame (scroll, pointer, hover, intro tween). dpr clamped [1, 2].
 */
export function HeroScene({ onReady, onContextLost, fixedExplode, className }: Props) {
  const [lost, setLost] = useState(false);

  if (lost) return null;

  return (
    <Canvas
      className={className}
      dpr={[1, 2]}
      frameloop="demand"
      shadows="percentage"
      flat={false}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: NoToneMapping,
        stencil: false,
        depth: true,
      }}
      camera={{ fov: CAMERA.fov, near: 0.1, far: 60, position: [0, CAMERA.y, CAMERA.distanceAssembled] }}
      onCreated={({ gl, invalidate }) => {
        heroState.invalidate = invalidate;
        gl.domElement.addEventListener(
          "webglcontextlost",
          (e) => {
            e.preventDefault();
            setLost(true);
            onContextLost?.();
          },
          { once: true },
        );
      }}
    >
      <color attach="background" args={["#07090d"]} />
      <Readiness onReady={onReady} />
      <CameraRig fixedExplode={fixedExplode} />

      {/* Three-point studio + accent rim */}
      <directionalLight
        position={[3.2, 5, 4.5]}
        intensity={3.0}
        color="#e8eff7"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00035}
        shadow-normalBias={0.02}
        shadow-camera-left={-3.6}
        shadow-camera-right={3.6}
        shadow-camera-top={3.6}
        shadow-camera-bottom={-3.6}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
      />
      <directionalLight position={[-4.5, 1.2, 2.5]} intensity={0.55} color="#8fa3b8" />
      <directionalLight position={[3.5, 1.4, -5]} intensity={3.2} color="#ff6b1a" />
      <ambientLight intensity={0.08} color="#8fa3b8" />

      {/* Low-intensity studio environment — drives the anisotropic rim highlights */}
      <Environment resolution={256} frames={1} environmentIntensity={0.42}>
        <Lightformer form="rect" intensity={2.6} color="#dfe8f2" position={[0, 5, 2]} scale={[7, 3, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.8} color="#9fb3c8" position={[-6, 1, -1]} rotation-y={Math.PI / 2} scale={[1.2, 9, 1]} />
        <Lightformer form="rect" intensity={3} color="#ff6b1a" position={[5, -1, -4]} rotation-y={-Math.PI / 2.4} scale={[2.5, 1.2, 1]} />
        <Lightformer form="ring" intensity={1.2} color="#ffffff" position={[0, 0.4, 6]} scale={3.6} />
        <Lightformer form="rect" intensity={1.1} color="#c9d4e0" position={[2.5, 2.5, 6]} scale={[4, 2, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.5} color="#1a2230" position={[0, -5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
      </Environment>

      <Assembly fixedExplode={fixedExplode} />

      <EffectComposer multisampling={4} enableNormalPass={false}>
        <Bloom mipmapBlur luminanceThreshold={1.0} luminanceSmoothing={0.3} intensity={0.36} radius={0.5} />
        <ChromaticAberration offset={new Vector2(0.0007, 0.0004)} radialModulation modulationOffset={0.35} />
        <Vignette eskil={false} offset={0.22} darkness={0.58} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  );
}

/** Marks the scene ready after the environment and shadows have settled. */
function Readiness({ onReady }: { onReady?: () => void }) {
  const frames = useRef(0);
  const invalidate = useThree((s) => s.invalidate);
  useFrame(() => {
    if (heroState.ready) return;
    frames.current += 1;
    if (frames.current < 4) invalidate();
    else {
      heroState.ready = true;
      onReady?.();
    }
  });
  useEffect(() => {
    invalidate();
  }, [invalidate]);
  return null;
}

/** Rig group: yaw/pitch/offset driven by explode + viewport aspect. */
function Assembly({ fixedExplode }: { fixedExplode?: number }) {
  const rig = useRef<Group>(null);
  const size = useThree((s) => s.size);
  useFrame(() => {
    const g = rig.current;
    if (!g) return;
    const e = fixedExplode ?? (heroState.introActive ? heroState.intro : heroState.scroll);
    const portrait = size.width / size.height < 1.05;
    if (portrait) {
      const P = RIG.portrait;
      g.rotation.y = P.yawAssembled + (P.yawExploded - P.yawAssembled) * e;
      g.rotation.x = P.pitchAssembled + (P.pitchExploded - P.pitchAssembled) * e;
      g.position.set(0, P.offsetY * (1 - e), 0);
      g.scale.setScalar(P.scale);
    } else {
      g.rotation.y = RIG.yawAssembled + (RIG.yawExploded - RIG.yawAssembled) * e;
      g.rotation.x = RIG.pitch;
      g.position.set(RIG.offsetXAssembled * (1 - e), 0, 0);
      g.scale.setScalar(1);
    }
  });
  return (
    <group ref={rig}>
      <WheelAssembly />
    </group>
  );
}

/** Camera: dolly with explode, damped pointer parallax, always looks at origin. */
function CameraRig({ fixedExplode }: { fixedExplode?: number }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const cur = useRef({ x: 0, y: 0 });

  useFrame(() => {
    const e = fixedExplode ?? (heroState.introActive ? heroState.intro : heroState.scroll);
    const portrait = size.width / size.height < 1.05;
    const dist =
      (CAMERA.distanceAssembled + (CAMERA.distanceExploded - CAMERA.distanceAssembled) * e) *
      (portrait ? CAMERA.portraitDolly : 1);

    // Damped parallax
    const tx = fixedExplode !== undefined ? 0 : heroState.pointer.x * CAMERA.parallaxX;
    const ty = fixedExplode !== undefined ? 0 : -heroState.pointer.y * CAMERA.parallaxY;
    const c = cur.current;
    c.x += (tx - c.x) * CAMERA.parallaxDamp;
    c.y += (ty - c.y) * CAMERA.parallaxDamp;

    camera.position.set(c.x, CAMERA.y + c.y, dist);
    camera.lookAt(0, 0, 0);

    // Keep rendering while the parallax settles (demand mode)
    if (Math.abs(tx - c.x) > 0.0006 || Math.abs(ty - c.y) > 0.0006) invalidate();
  });
  return null;
}
