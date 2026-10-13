import type { Group } from "three";

import { useFrame } from "@react-three/fiber";
import { use, useRef } from "react";
import { DoubleSide, MeshStandardMaterial } from "three";

import { Backlight, Box, Cylinder, H, OpenContext } from "@/components/three/parts";

const metal = new MeshStandardMaterial({ color: "#2a2c30", metalness: 0.9, roughness: 0.35 });
const brass = new MeshStandardMaterial({ color: "#c9a45c", metalness: 1, roughness: 0.3 });
const glass = new MeshStandardMaterial({
  color: "#cfe3ea",
  roughness: 0.05,
  metalness: 0.1,
  transparent: true,
  opacity: 0.22,
  side: DoubleSide,
});

const R = 0.58;
const INNER = 0.04;
const OUTER = R - 0.03;
const WING = OUTER - INNER;
const WH = H - 0.06;
const posts = [1, 3, 5, 7].map((k) => (k * Math.PI) / 4);

/** Four glass wings that turn a quarter as the door opens. */
function Wings() {
  const ref = useRef<Group>(null);
  const open = use(OpenContext);

  useFrame(() => {
    if (ref.current) ref.current.rotation.y = Math.PI / 4 + (open.current * Math.PI) / 2;
  });

  return (
    <group ref={ref}>
      <Cylinder radius={INNER} height={H} material={brass} />
      {[0, 1, 2, 3].map((i) => (
        <group key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
          <Box size={[WING, WH, 0.012]} at={[INNER + WING / 2, 0, 0]} material={glass} />
          <Box size={[WING, 0.05, 0.03]} at={[INNER + WING / 2, WH / 2, 0]} material={brass} />
          <Box size={[WING, 0.05, 0.03]} at={[INNER + WING / 2, -WH / 2, 0]} material={brass} />
          <Box size={[0.03, WH, 0.03]} at={[OUTER, 0, 0]} material={brass} />
          <Box size={[WING * 0.7, 0.03, 0.08]} at={[INNER + WING * 0.55, 0, 0]} material={brass} />
        </group>
      ))}
    </group>
  );
}

/** A hotel-lobby revolving door: glass drum, brass wings, and the light on the far side. */
export function Revolving() {
  return (
    <>
      <Backlight width={R * 2} at={[0, 0, -R - 0.02]} />
      <Cylinder radius={R + 0.05} height={0.2} at={[0, H / 2 + 0.1, 0]} material={metal} />
      <Cylinder radius={R + 0.06} height={0.03} at={[0, H / 2 + 0.015, 0]} material={brass} />
      <Cylinder radius={R + 0.05} height={0.02} at={[0, -H / 2 + 0.01, 0]} material={metal} />
      {/* Curved glass walls on the sides; the front and back stay open */}
      {[Math.PI / 4, (Math.PI * 5) / 4].map((start) => (
        <mesh key={start} material={glass}>
          <cylinderGeometry args={[R, R, H, 24, 1, true, start, Math.PI / 2]} />
        </mesh>
      ))}
      {posts.map((angle) => (
        <Cylinder
          key={angle}
          radius={0.025}
          height={H}
          at={[R * Math.sin(angle), 0, R * Math.cos(angle)]}
          material={metal}
        />
      ))}
      <Wings />
    </>
  );
}
