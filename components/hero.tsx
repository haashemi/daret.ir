"use client";

import { View } from "@react-three/drei";
import { cn } from "cn";
import { useReducedMotion } from "motion/react";
import { use, useEffect, useRef, useState } from "react";

import type { Pointer } from "@/components/three/scenery";

import { LeavingContext } from "@/components/door-picker";
import { useSceneFailed } from "@/components/three/scene-status";
import { Scenery, SCROLL_WALK } from "@/components/three/scenery";

// A tight dark edge for legibility over bright cloud, and a wide soft one for depth.
const TEXT_SHADOW = "[text-shadow:0_1px_2px_rgb(6_24_56/55%),0_4px_32px_rgb(6_24_56/45%)]";

/**
 * Full-screen landscape: a white door standing in shallow water under a summer sky. The title sits between the sky and
 * the door, which cuts into it. Everything leans with the mouse. Scrolling walks up to the door as it opens onto hell
 * and a 👍.
 */
export function Hero() {
  const leaving = use(LeavingContext);
  const sceneFailed = useSceneFailed();
  const reduceMotion = useReducedMotion();
  const [ready, setReady] = useState(false);
  const pointerRef = useRef<Pointer>(null);
  const holeRef = useRef<HTMLDivElement>(null);
  const depthRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointerRef.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: 1 - (event.clientY / window.innerHeight) * 2,
      };
    };

    const leave = () => {
      pointerRef.current = null;
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);

    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    // Full bleed out of the page container. The scene sticks while the page scrolls through the track, which walks the
    // camera through the door (`--hero-progress`, written by the scene). Without WebGL there is nothing to walk.
    <header
      ref={trackRef}
      className={cn("ms-[calc(50%-50vw)] w-screen", SCROLL_WALK && !sceneFailed ? "h-[300svh]" : "h-svh")}
    >
      <div className="sticky top-0 isolate h-svh overflow-hidden text-white">
        {/* Until the scene draws (or without WebGL), a flat sky and water. The canvas is under the DOM. */}
        <div
          className={cn(
            "absolute inset-0 bg-linear-to-b from-[#2466c4] via-[#a9d4f2] via-64% to-[#4c7488] to-64% transition-opacity duration-700",
            ready && !sceneFailed && "opacity-0",
          )}
        />
        <View className="absolute inset-0" aria-hidden>
          <Scenery
            pointerRef={pointerRef}
            still={Boolean(reduceMotion)}
            faded={leaving}
            holeRef={holeRef}
            depthRef={depthRef}
            trackRef={trackRef}
            onReady={() => setReady(true)}
          />
        </View>

        <div ref={holeRef} className="pointer-events-none absolute inset-0 opacity-[calc(1-var(--hero-progress,0)*4)]">
          <div ref={depthRef} className={cn("absolute inset-0 text-center", TEXT_SHADOW)}>
            <p className="absolute inset-x-4 top-[9%] mx-auto max-w-sm animate-rise font-medium text-balance md:text-lg">
              در های ویژه، نایاب و دست‌ساز مخصوص کسانی که به دنبال گذاشتن درشونن
            </p>
            <h1 className="absolute inset-x-0 top-[29%] -translate-y-1/2 animate-rise text-[min(24vh,34vw)] leading-none font-black [animation-delay:150ms]">
              دَرِت
            </h1>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-4 text-sm font-medium opacity-[calc(1-var(--hero-progress,0)*6)]">
          درِت رو انتخاب کن
          <span aria-hidden className="relative h-16 w-px overflow-hidden bg-white/20">
            <span className="absolute inset-x-0 top-0 h-6 animate-scroll-cue bg-light" />
          </span>
        </div>
      </div>
    </header>
  );
}
