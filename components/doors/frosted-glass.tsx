import { MeshStandardMaterial } from "three";

import { Backlight, Box, Cylinder, Frame, H, Hinge, W } from "@/components/three/parts";

const aluminum = new MeshStandardMaterial({ color: "#8d9298", metalness: 1, roughness: 0.35 });
const dark = new MeshStandardMaterial({ color: "#2b2e32", metalness: 0.9, roughness: 0.4 });
const frosted = new MeshStandardMaterial({ color: "#f4f8fa", roughness: 0.6, transparent: true, opacity: 0.82 });

const STILE = 0.08;
const TOP = 0.1;
const BOTTOM = 0.22;

/** An office door: aluminum rails around a frosted pane, with a long bar handle. The light glows through the glass. */
export function FrostedGlass() {
  const glassHeight = H - TOP - BOTTOM;
  const glassY = (BOTTOM - TOP) / 2;

  return (
    <>
      <Backlight />
      <Frame material={dark} size={0.06} />
      <Hinge at={[-W / 2, 0, 0.025]}>
        <group position={[0, 0, -0.02]}>
          <Box size={[STILE, H - 0.01, 0.04]} at={[STILE / 2, 0, 0]} material={aluminum} />
          <Box size={[STILE, H - 0.01, 0.04]} at={[W - STILE / 2, 0, 0]} material={aluminum} />
          <Box size={[W - 0.01, TOP, 0.04]} at={[W / 2, H / 2 - TOP / 2, 0]} material={aluminum} />
          <Box size={[W - 0.01, BOTTOM, 0.04]} at={[W / 2, -H / 2 + BOTTOM / 2, 0]} material={aluminum} />
          <Box size={[W - STILE * 2, glassHeight, 0.012]} at={[W / 2, glassY, 0]} material={frosted} />
        </group>
        {/* Bar handle on two standoffs */}
        <Cylinder radius={0.014} height={0.7} at={[W - 0.12, 0, 0.07]} material={aluminum} />
        {[0.28, -0.28].map((y) => (
          <Cylinder
            key={y}
            radius={0.008}
            height={0.07}
            at={[W - 0.12, y, 0.035]}
            rotation={[Math.PI / 2, 0, 0]}
            material={aluminum}
          />
        ))}
      </Hinge>
    </>
  );
}
