import type { ReactNode } from "react";
import type { Group } from "three";

import { useFrame } from "@react-three/fiber";
import { use, useRef } from "react";
import { MeshStandardMaterial } from "three";

import { Backlight, Box, H, OpenContext, Slide } from "@/components/three/parts";

const steel = new MeshStandardMaterial({ color: "#a9aeb3", metalness: 0.9, roughness: 0.4 });
const groove = new MeshStandardMaterial({ color: "#55595e", metalness: 0.8, roughness: 0.5 });
const housing = new MeshStandardMaterial({ color: "#6f747a", metalness: 0.8, roughness: 0.45 });
const brass = new MeshStandardMaterial({ color: "#e0b860", metalness: 0.85, roughness: 0.3 });

const SW = 1.16;
const SLAT = 0.075;
const ROLLED = 0.96;
const slats = Array.from({ length: Math.round(H / SLAT) }, (_, i) => -SLAT * (i + 0.5));

/** Hangs from the top of the opening and rolls up into the housing as the door opens. */
function Curtain({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null);
  const open = use(OpenContext);

  useFrame(() => {
    if (ref.current) ref.current.scale.y = 1 - open.current * ROLLED;
  });

  return (
    <group ref={ref} position={[0, H / 2, 0]}>
      {children}
    </group>
  );
}

/** A corrugated shop shutter that rolls up into its box, padlocked to the floor. */
export function Shutter() {
  return (
    <>
      <Backlight width={SW} />
      <Box size={[SW + 0.16, 0.26, 0.32]} at={[0, H / 2 + 0.13, -0.05]} material={housing} />
      {[-1, 1].map((dir) => (
        <Box key={dir} size={[0.05, H, 0.08]} at={[dir * (SW / 2 + 0.02), 0, 0]} material={housing} />
      ))}
      <Curtain>
        <Box size={[SW - 0.02, H, 0.01]} at={[0, -H / 2, -0.012]} material={groove} />
        {slats.map((y) => (
          <Box key={y} size={[SW - 0.02, SLAT - 0.012, 0.02]} at={[0, y, 0]} material={steel} />
        ))}
      </Curtain>
      <Slide by={[0, H * ROLLED, 0]}>
        <Box size={[SW - 0.02, 0.07, 0.04]} at={[0, -H / 2 + 0.035, 0]} material={housing} />
        <Box size={[0.16, 0.025, 0.03]} at={[0, -H / 2 + 0.11, 0.025]} material={housing} />
        {[-0.4, 0.4].map((x) => (
          <group key={x} position={[x, -H / 2 + 0.05, 0.04]}>
            <mesh position={[0, 0.025, 0]} material={steel}>
              <torusGeometry args={[0.022, 0.006, 8, 24, Math.PI]} />
            </mesh>
            <Box size={[0.07, 0.06, 0.03]} material={brass} />
          </group>
        ))}
      </Slide>
    </>
  );
}
