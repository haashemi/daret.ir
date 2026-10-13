import { MeshStandardMaterial, Path, Shape } from "three";

import { Backlight, Box, Frame, H, Hinge, W } from "@/components/three/parts";

const paint = new MeshStandardMaterial({ color: "#9cc5c0", roughness: 0.45 });
const casing = new MeshStandardMaterial({ color: "#e4e7e6", roughness: 0.5 });
const steel = new MeshStandardMaterial({ color: "#c9ced3", metalness: 1, roughness: 0.25 });
const rubber = new MeshStandardMaterial({ color: "#2b2e32", roughness: 0.8 });
const glass = new MeshStandardMaterial({ color: "#dbe9ee", roughness: 0.08, transparent: true, opacity: 0.3 });
const red = new MeshStandardMaterial({
  color: "#ff2d2d",
  emissive: "#ff2d2d",
  emissiveIntensity: 1.6,
  toneMapped: false,
});

const LEAF = W / 2 - 0.005;
const LH = H - 0.01;
const PORT = 0.12;
const PORT_Y = 0.45;

// One leaf, centered on its own origin, with a round porthole.
const leaf = new Shape()
  .moveTo(-LEAF / 2, -LH / 2)
  .lineTo(LEAF / 2, -LH / 2)
  .lineTo(LEAF / 2, LH / 2)
  .lineTo(-LEAF / 2, LH / 2);
leaf.holes.push(new Path().absarc(0, PORT_Y, PORT, 0, Math.PI * 2, true));

/** A swing leaf with a porthole, kick plate and push plate. `dir` is `1` for a leaf that extends right of its hinge. */
function Leaf({ dir }: { dir: -1 | 1 }) {
  return (
    <group position={[(dir * LEAF) / 2, 0, -0.0475]}>
      <mesh material={paint}>
        <extrudeGeometry args={[leaf, { depth: 0.045, bevelEnabled: false, curveSegments: 32 }]} />
      </mesh>
      <mesh position={[0, PORT_Y, 0.046]} material={steel}>
        <torusGeometry args={[PORT + 0.01, 0.015, 12, 48]} />
      </mesh>
      <mesh position={[0, PORT_Y, 0.022]} material={glass}>
        <circleGeometry args={[PORT, 48]} />
      </mesh>
      <Box size={[LEAF - 0.02, 0.28, 0.006]} at={[0, -LH / 2 + 0.15, 0.048]} material={steel} />
      <Box size={[0.1, 0.3, 0.006]} at={[dir * (LEAF / 2 - 0.08), 0, 0.048]} material={steel} />
      <Box size={[0.015, LH, 0.05]} at={[dir * (LEAF / 2 - 0.0075), 0, 0.0225]} material={rubber} />
    </group>
  );
}

/** Hospital double swing doors with portholes, under a lit "in surgery" sign. */
export function OperatingRoom() {
  const signY = H / 2 + 0.08 + 0.12;

  return (
    <>
      <Backlight />
      <Frame material={casing} size={0.08} />
      <Box size={[0.4, 0.13, 0.05]} at={[0, signY, 0.03]} material={rubber} />
      <Box size={[0.34, 0.08, 0.01]} at={[0, signY, 0.06]} material={red} />
      <Hinge at={[-W / 2, 0, 0.03]}>
        <Leaf dir={1} />
      </Hinge>
      <Hinge at={[W / 2, 0, 0.03]} side="right">
        <Leaf dir={-1} />
      </Hinge>
    </>
  );
}
