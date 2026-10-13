import { MeshStandardMaterial } from "three";

import { Backlight, Box, Frame, Hinge, W } from "@/components/three/parts";

const wood = new MeshStandardMaterial({ color: "#8a5530", roughness: 0.7 });
const slat = new MeshStandardMaterial({ color: "#6b3f20", roughness: 0.75 });
const post = new MeshStandardMaterial({ color: "#3b2414", roughness: 0.8 });
const brass = new MeshStandardMaterial({ color: "#e0b860", metalness: 0.85, roughness: 0.3 });

const LEAF = W / 2 - 0.005;
// Batwing leaves hang chest-high, so the light spills over and under them.
const LH = 0.95;
const LY = 0.05;
const RAIL = 0.09;
const STILE = 0.06;
const SLATS = 9;
const gap = (LH - RAIL * 2) / SLATS;
const slats = Array.from({ length: SLATS }, (_, i) => -LH / 2 + RAIL + gap * (i + 0.5));

/** One louvered batwing leaf. `dir` is `1` for a leaf that extends right of its hinge. */
function Leaf({ dir }: { dir: -1 | 1 }) {
  const cx = (dir * LEAF) / 2;

  return (
    <group position={[0, LY, -0.02]}>
      <Box size={[STILE, LH, 0.035]} at={[(dir * STILE) / 2, 0, 0]} material={wood} />
      <Box size={[STILE, LH, 0.035]} at={[dir * (LEAF - STILE / 2), 0, 0]} material={wood} />
      <Box size={[LEAF, RAIL, 0.035]} at={[cx, LH / 2 - RAIL / 2, 0]} material={wood} />
      <Box size={[LEAF, RAIL, 0.035]} at={[cx, -LH / 2 + RAIL / 2, 0]} material={wood} />
      {slats.map((y) => (
        <Box
          key={y}
          size={[LEAF - STILE * 2, gap * 0.9, 0.008]}
          at={[cx, y, 0]}
          rotation={[-0.7, 0, 0]}
          material={slat}
        />
      ))}
      {/* Crest, sloping down toward the meeting edge */}
      <Box
        size={[LEAF * 0.6, 0.12, 0.035]}
        at={[dir * LEAF * 0.3, LH / 2 + 0.04, 0]}
        rotation={[0, 0, -dir * 0.25]}
        material={wood}
      />
      {[0.3, -0.3].map((y) => (
        <Box key={y} size={[0.03, 0.1, 0.01]} at={[dir * 0.015, y, 0.022]} material={brass} />
      ))}
    </group>
  );
}

/** Western saloon batwing doors: two short louvered leaves with the light pouring over and under. */
export function Saloon() {
  return (
    <>
      <Backlight />
      <Frame material={post} size={0.1} />
      <Hinge at={[-W / 2, 0, 0.03]} angle={1.4}>
        <Leaf dir={1} />
      </Hinge>
      <Hinge at={[W / 2, 0, 0.03]} side="right" angle={1.4}>
        <Leaf dir={-1} />
      </Hinge>
    </>
  );
}
