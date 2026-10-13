import { MeshStandardMaterial } from "three";

import { Backlight, Box, Cylinder, Frame, H, Hinge, W } from "@/components/three/parts";

const paint = new MeshStandardMaterial({ color: "#9a3f22", metalness: 0.4, roughness: 0.55 });
const rib = new MeshStandardMaterial({ color: "#b04a28", metalness: 0.4, roughness: 0.5 });
const frame = new MeshStandardMaterial({ color: "#5a2414", metalness: 0.5, roughness: 0.6 });
const galvanized = new MeshStandardMaterial({ color: "#9aa0a5", metalness: 1, roughness: 0.4 });

const LEAF = W / 2 - 0.005;
const ribsY = Array.from({ length: 6 }, (_, i) => -0.75 + i * 0.3);

/** One corrugated leaf with two locking bars. `dir` is `1` for a leaf that extends right of its hinge. */
function Leaf({ dir }: { dir: -1 | 1 }) {
  return (
    <group position={[0, 0, -0.025]}>
      <Box size={[LEAF, H - 0.01, 0.04]} at={[(dir * LEAF) / 2, 0, 0]} material={paint} />
      {ribsY.map((y) => (
        <Box key={y} size={[LEAF - 0.06, 0.13, 0.05]} at={[(dir * LEAF) / 2, y, 0]} material={rib} />
      ))}
      {[0.12, 0.32].map((x) => (
        <group key={x} position={[dir * x, 0, 0.05]}>
          <Cylinder radius={0.016} height={H - 0.06} material={galvanized} />
          {[H / 2 - 0.06, -H / 2 + 0.06].map((y) => (
            <Box key={y} size={[0.06, 0.05, 0.03]} at={[0, y, -0.01]} material={galvanized} />
          ))}
          {/* Lever handle, folded against the door */}
          <Box
            size={[0.025, 0.28, 0.02]}
            at={[dir * 0.03, -0.25, 0.02]}
            rotation={[0, 0, dir * 0.12]}
            material={galvanized}
          />
        </group>
      ))}
    </group>
  );
}

/** Shipping-container doors: corrugated steel pair with vertical locking bars. */
export function Container() {
  return (
    <>
      <Backlight />
      <Frame material={frame} size={0.1} depth={0.24} />
      <Box size={[W + 0.2, 0.1, 0.24]} at={[0, -H / 2 - 0.05, 0]} material={frame} />
      <Hinge at={[-W / 2, 0, 0.03]}>
        <Leaf dir={1} />
      </Hinge>
      <Hinge at={[W / 2, 0, 0.03]} side="right">
        <Leaf dir={-1} />
      </Hinge>
    </>
  );
}
