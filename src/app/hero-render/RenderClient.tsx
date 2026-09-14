"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { heroState } from "@/components/hero/heroState";

const HeroScene = dynamic(() => import("@/components/hero/HeroScene").then((m) => m.HeroScene), { ssr: false });

function Inner() {
  const params = useSearchParams();
  const explode = Math.min(1, Math.max(0, Number(params.get("explode") ?? "0")));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Hide fixed chrome so screenshots contain only the scene.
    document.querySelector("header")?.remove();
    document.querySelector(".grain-overlay")?.remove();
  }, []);
  // The assembly reads heroState; pin it to the requested explode value.
  heroState.introActive = false;
  heroState.scroll = explode;
  heroState.explode = explode;
  return (
    <div className="relative h-svh w-full bg-base-0" data-render-ready={ready ? "1" : "0"}>
      <HeroScene fixedExplode={explode} onReady={() => setReady(true)} className="!h-full !w-full" />
    </div>
  );
}

export function RenderClient() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
