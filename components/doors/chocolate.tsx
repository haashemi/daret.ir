import { MeshStandardMaterial, Shape } from "three";

import { Backlight, Box, Cylinder, Frame, H, Hinge, W } from "@/components/three/parts";

const milk = new MeshStandardMaterial({ color: "#6b3a1f", roughness: 0.35 });
const piece = new MeshStandardMaterial({ color: "#7a4325", roughness: 0.3 });
const dark = new MeshStandardMaterial({ color: "#3a1d0e", roughness: 0.5 });
const foil = new MeshStandardMaterial({ color: "#d9d9d9", metalness: 1, roughness: 0.25 });
const wrapper = new MeshStandardMaterial({ color: "#5b2a86", roughness: 0.5 });
const gold = new MeshStandardMaterial({ color: "#e8c46a", metalness: 1, roughness: 0.25 });

const LH = H - 0.01;
const TOP = LH / 2;
const RIGHT = W - 0.005;
const BITE = 0.26;
const WRAP = 0.62;

// The leaf outline, with a bite out of the top corner at the latch side: three tooth marks around a quarter circle.
const leaf = new Shape()
  .moveTo(0.005, -TOP)
  .lineTo(RIGHT, -TOP)
  .lineTo(RIGHT, TOP - BITE);

for (let i = 1; i <= 3; i++) {
  const end = -Math.PI / 2 - (i * Math.PI) / 6;
  const mid = end + Math.PI / 12;
  leaf.quadraticCurveTo(
    RIGHT + (BITE + 0.05) * Math.cos(mid),
    TOP + (BITE + 0.05) * Math.sin(mid),
    RIGHT + BITE * Math.cos(end),
    TOP + BITE * Math.sin(end),
  );
}

leaf.lineTo(0.005, TOP).closePath();

// Pieces above the wrapper, minus the ones that got eaten.
const pieces = [0.85, 0.59, 0.33, 0.07, -0.19]
  .flatMap((y) => [0.18, 0.45, 0.72].map((x) => [x, y] as const))
  .filter(([x, y]) => Math.hypot(RIGHT - x - 0.115, TOP - y - 0.115) > BITE + 0.05);

/** A chocolate-bar door, half unwrapped, with a bite already taken and a gold coin for a knob. */
export function Chocolate() {
  return (
    <>
      <Backlight />
      <Frame material={dark} size={0.09} />
      <Hinge at={[-W / 2, 0, 0.03]}>
        <group position={[0, 0, -0.0475]}>
          <mesh material={milk}>
            <extrudeGeometry args={[leaf, { depth: 0.045, bevelEnabled: false }]} />
          </mesh>
          {pieces.map(([x, y]) => (
            <group key={`${x}${y}`} position={[x, y, 0.055]}>
              <Box size={[0.23, 0.23, 0.02]} material={piece} />
              <Box size={[0.17, 0.17, 0.012]} at={[0, 0, 0.012]} material={milk} />
            </group>
          ))}
          <Box size={[W - 0.002, 0.08, 0.053]} at={[W / 2, -TOP + WRAP + 0.02, 0.0225]} material={foil} />
          <Box size={[W + 0.002, WRAP, 0.057]} at={[W / 2, -TOP + WRAP / 2, 0.0225]} material={wrapper} />
          <Box size={[W + 0.004, 0.04, 0.059]} at={[W / 2, -TOP + WRAP / 2, 0.0225]} material={gold} />
          <Cylinder
            radius={0.05}
            height={0.015}
            at={[W - 0.12, -0.06, 0.08]}
            rotation={[Math.PI / 2, 0, 0]}
            material={gold}
          />
        </group>
      </Hinge>
    </>
  );
}
