import { MeshStandardMaterial } from "three";

import { Backlight, Box, Cylinder, Frame, H, Hinge, W } from "@/components/three/parts";

const steel = new MeshStandardMaterial({ color: "#a7abb0", metalness: 1, roughness: 0.38 });
const post = new MeshStandardMaterial({ color: "#7c8086", metalness: 1, roughness: 0.3 });
const vacant = new MeshStandardMaterial({ color: "#1f9d55", emissive: "#2fd27a", emissiveIntensity: 0.8 });

// Stall doors stop short of the floor and the top of the frame, so the light leaks under and over.
const BOTTOM_GAP = 0.26;
const TOP_GAP = 0.12;
const height = H - BOTTOM_GAP - TOP_GAP;
const y = (BOTTOM_GAP - TOP_GAP) / 2;

/** A brushed-steel toilet stall door with a "vacant" indicator. */
export function Restroom() {
  return (
    <>
      <Backlight />
      <Frame material={post} size={0.05} depth={0.06} />
      <Hinge at={[-W / 2, 0, 0.02]}>
        <Box size={[W - 0.02, height, 0.03]} at={[W / 2, y, -0.015]} material={steel} />
        {[y + height / 2 - 0.15, y - height / 2 + 0.15].map((hingeY) => (
          <Box key={hingeY} size={[0.1, 0.03, 0.008]} at={[0.05, hingeY, 0.004]} material={post} />
        ))}
        {/* Thumb-turn indicator and the door pull */}
        <Box size={[0.1, 0.05, 0.012]} at={[W - 0.1, 0.12, 0.006]} material={post} />
        <Box size={[0.06, 0.022, 0.006]} at={[W - 0.1, 0.12, 0.014]} material={vacant} />
        <Cylinder radius={0.012} height={0.12} at={[W - 0.1, -0.02, 0.03]} material={post} />
      </Hinge>
    </>
  );
}
