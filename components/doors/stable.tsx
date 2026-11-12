import { MeshStandardMaterial } from "three";

import { Backlight, Box, Cylinder, Frame, H, Slide, W } from "@/components/three/parts";

const wood = new MeshStandardMaterial({ color: "#8a5a32", roughness: 0.8 });
const seam = new MeshStandardMaterial({ color: "#5a381c", roughness: 0.85 });
const rail = new MeshStandardMaterial({ color: "#6b4426", roughness: 0.75 });
const post = new MeshStandardMaterial({ color: "#4b3220", roughness: 0.85 });
const iron = new MeshStandardMaterial({ color: "#1b1b1b", metalness: 0.75, roughness: 0.45 });
const shoe = new MeshStandardMaterial({ color: "#8d8f92", metalness: 0.9, roughness: 0.35 });

// The leaf hangs in front of the frame and overlaps it a little on every side.
const LEAF_W = W + 0.12;
const LEAF_H = H + 0.04;
const LEAF_Y = 0.02;
const Z = 0.14;
const STILE = 0.08;
// Planks below, iron bars above, split by a mid rail.
const SPLIT = 0.15;
const bottomH = SPLIT + H / 2;
const bottomY = -H / 2 + bottomH / 2;
const planks = Array.from({ length: 7 }, (_, i) => -LEAF_W / 2 + ((i + 1) * LEAF_W) / 8);
const bars = Array.from({ length: 9 }, (_, i) => -LEAF_W / 2 + STILE + ((i + 1) * (LEAF_W - STILE * 2)) / 10);
const barsH = LEAF_Y + LEAF_H / 2 - STILE - SPLIT;
const braceW = LEAF_W - STILE * 2;
const braceH = bottomH - STILE * 2;
const brace = Math.hypot(braceW, braceH);
const braceAngle = Math.atan(braceW / braceH);
const TRACK_Y = LEAF_Y + LEAF_H / 2 + 0.06;

/** A horse stall door: planks with an X brace below, iron bars above, sliding along a track over the opening. */
export function Stable() {
  return (
    <>
      <Backlight />
      <Frame material={post} size={0.1} />
      <Box size={[W * 2.6, 0.04, 0.04]} at={[W * 0.6, TRACK_Y, Z + 0.01]} material={iron} />
      <Slide by={[LEAF_W + 0.04, 0, 0]}>
        <group position={[0, 0, Z]}>
          {/* Bottom: planks behind a framed X brace */}
          <Box size={[LEAF_W, bottomH, 0.04]} at={[0, bottomY, 0]} material={wood} />
          {planks.map((x) => (
            <Box key={x} size={[0.006, bottomH - 0.01, 0.041]} at={[x, bottomY, 0]} material={seam} />
          ))}
          <group position={[0, bottomY, 0.025]}>
            <Box size={[0.07, brace, 0.012]} rotation={[0, 0, braceAngle]} material={rail} />
            <Box size={[0.07, brace, 0.012]} rotation={[0, 0, -braceAngle]} material={rail} />
          </group>
          <Box size={[LEAF_W, STILE, 0.05]} at={[0, -H / 2 + STILE / 2, 0.005]} material={rail} />
          <Box size={[LEAF_W, STILE, 0.05]} at={[0, SPLIT, 0.005]} material={rail} />
          {/* Top: iron bars in a wooden frame */}
          <Box size={[LEAF_W, STILE, 0.05]} at={[0, LEAF_Y + LEAF_H / 2 - STILE / 2, 0.005]} material={rail} />
          {[-1, 1].map((dir) => (
            <Box
              key={dir}
              size={[STILE, LEAF_H, 0.05]}
              at={[(dir * (LEAF_W - STILE)) / 2, LEAF_Y, 0.005]}
              material={rail}
            />
          ))}
          {bars.map((x) => (
            <Cylinder key={x} radius={0.011} height={barsH} at={[x, SPLIT + barsH / 2, 0]} material={iron} />
          ))}
          {/* Rollers on the track */}
          {[-0.3, 0.3].map((x) => (
            <group key={x} position={[x, TRACK_Y - LEAF_Y - 0.02, 0.03]}>
              <Box size={[0.03, 0.12, 0.012]} at={[0, -0.04, -0.01]} material={iron} />
              <Cylinder radius={0.04} height={0.025} rotation={[Math.PI / 2, 0, 0]} material={iron} />
            </group>
          ))}
          {/* Latch bolt and a horseshoe for luck, ends up */}
          <Box size={[0.16, 0.03, 0.03]} at={[-LEAF_W / 2 + 0.1, -0.25, 0.04]} material={iron} />
          <Cylinder
            radius={0.02}
            height={0.06}
            at={[-LEAF_W / 2 + 0.16, -0.25, 0.06]}
            rotation={[Math.PI / 2, 0, 0]}
            material={iron}
          />
          <mesh position={[0, -0.12, 0.04]} rotation={[0, 0, Math.PI * 0.7]} material={shoe}>
            <torusGeometry args={[0.075, 0.018, 8, 32, Math.PI * 1.6]} />
          </mesh>
        </group>
      </Slide>
    </>
  );
}
