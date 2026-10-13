import { MeshStandardMaterial } from "three";

import { Backlight, Box, Cylinder, Frame, H, Hinge, W } from "@/components/three/parts";

const concrete = new MeshStandardMaterial({ color: "#55585c", roughness: 0.85 });
const iron = new MeshStandardMaterial({ color: "#2d3033", metalness: 0.85, roughness: 0.45 });

const bars = Array.from({ length: 7 }, (_, i) => 0.12 + i * 0.11);

/** A cell door of round bars in a flat-bar frame; the light behind shows through the bars even when it's shut. */
export function Prison() {
  return (
    <>
      <Backlight />
      <Frame material={concrete} size={0.14} depth={0.3} />
      <Hinge at={[-W / 2, 0, 0.03]}>
        {/* Flat-bar frame and cross bars */}
        <Box size={[0.06, H - 0.01, 0.04]} at={[0.035, 0, -0.02]} material={iron} />
        <Box size={[0.06, H - 0.01, 0.04]} at={[W - 0.035, 0, -0.02]} material={iron} />
        {[H / 2 - 0.04, 0.35, -0.45, -H / 2 + 0.04].map((y) => (
          <Box key={y} size={[W - 0.02, 0.06, 0.04]} at={[W / 2, y, -0.02]} material={iron} />
        ))}
        {bars.map((x) => (
          <Cylinder key={x} radius={0.016} height={H - 0.06} at={[x, 0, -0.02]} material={iron} />
        ))}
        {/* Lock box */}
        <Box size={[0.13, 0.22, 0.09]} at={[W - 0.08, -0.05, 0]} material={iron} />
      </Hinge>
    </>
  );
}
