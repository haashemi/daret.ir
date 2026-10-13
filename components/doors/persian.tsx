import type { ReactNode } from "react";

import { MeshStandardMaterial } from "three";

import { Backlight, Box, Cylinder, Frame, H, Hinge, Sphere, W } from "@/components/three/parts";

const wood = new MeshStandardMaterial({ color: "#4a2f1b", roughness: 0.85 });
const band = new MeshStandardMaterial({ color: "#2f1d10", roughness: 0.8 });
const brick = new MeshStandardMaterial({ color: "#8a5a3c", roughness: 0.9 });
const iron = new MeshStandardMaterial({ color: "#2a2724", metalness: 0.8, roughness: 0.45 });

// The opening is shorter than the standard one to leave room for the arch above it.
const OPENING = 1.7;
const FRAME = 0.08;
const LEAF = W / 2 - 0.005;
const studs = [0.3, 0, -0.3, -0.6].flatMap((y) => [0.11, 0.33].map((x) => [x, y] as const));

/** One leaf with iron studs and bands. `dir` is `1` for a leaf that extends right of its hinge. */
function Leaf({ dir, children }: { dir: -1 | 1; children: ReactNode }) {
  return (
    <group position={[0, 0, -0.03]}>
      <Box size={[LEAF, OPENING - 0.01, 0.055]} at={[(dir * LEAF) / 2, 0, 0]} material={wood} />
      {[0.55, -0.15].map((y) => (
        <Box key={y} size={[LEAF - 0.02, 0.05, 0.06]} at={[(dir * LEAF) / 2, y, 0]} material={band} />
      ))}
      {studs.map(([x, y]) => (
        <Sphere key={`${x}${y}`} radius={0.014} at={[dir * x, y, 0.028]} material={iron} />
      ))}
      {children}
    </group>
  );
}

/**
 * An old Persian double door under a brick arch, with the two traditional knockers: the heavy
 * one for men on the right leaf, the ring for women on the left, each with its own sound.
 */
export function Persian() {
  const top = OPENING / 2 + FRAME;

  return (
    <group position={[0, (OPENING - H) / 2, 0]}>
      <Backlight height={OPENING} />
      <Frame material={brick} height={OPENING} size={FRAME} depth={0.26} />
      {/* Arch and its filled tympanum, resting on the head of the frame */}
      <mesh position={[0, top, 0]} material={brick}>
        <torusGeometry args={[W / 2 + FRAME / 2, FRAME / 2, 12, 48, Math.PI]} />
      </mesh>
      <mesh position={[0, top, -0.02]} material={band}>
        <circleGeometry args={[W / 2, 48, 0, Math.PI]} />
      </mesh>
      {[-1, -0.5, 0, 0.5, 1].map((angle) => (
        <group key={angle} position={[0, top, -0.01]} rotation={[0, 0, angle]}>
          <Box size={[0.02, W / 2 - 0.06, 0.01]} at={[0, W / 4, 0]} material={wood} />
        </group>
      ))}
      <Hinge at={[-W / 2, 0, 0.035]}>
        <Leaf dir={1}>
          {/* Ring knocker */}
          <Cylinder
            radius={0.02}
            height={0.02}
            at={[LEAF - 0.07, 0.22, 0.03]}
            rotation={[Math.PI / 2, 0, 0]}
            material={iron}
          />
          <mesh position={[LEAF - 0.07, 0.15, 0.045]} material={iron}>
            <torusGeometry args={[0.06, 0.008, 8, 32]} />
          </mesh>
        </Leaf>
      </Hinge>
      <Hinge at={[W / 2, 0, 0.035]} side="right">
        <Leaf dir={-1}>
          {/* Hammer knocker */}
          <Cylinder
            radius={0.02}
            height={0.02}
            at={[-(LEAF - 0.07), 0.22, 0.03]}
            rotation={[Math.PI / 2, 0, 0]}
            material={iron}
          />
          <Cylinder radius={0.012} height={0.16} at={[-(LEAF - 0.07), 0.13, 0.045]} material={iron} />
          <Sphere radius={0.026} at={[-(LEAF - 0.07), 0.05, 0.05]} material={iron} />
        </Leaf>
      </Hinge>
    </group>
  );
}
