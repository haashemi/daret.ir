import { MeshStandardMaterial } from "three";

import { Backlight, Box, Cylinder, Frame, H, Hinge, Sphere, W } from "@/components/three/parts";

const paint = new MeshStandardMaterial({ color: "#e9e5dc", roughness: 0.45 });
const panel = new MeshStandardMaterial({ color: "#f3f0e9", roughness: 0.4 });
const groove = new MeshStandardMaterial({ color: "#c9c4b8", roughness: 0.5 });
const chrome = new MeshStandardMaterial({ color: "#d9dde2", metalness: 1, roughness: 0.15 });

// [y, height] of each row of two panels.
const rows: [number, number][] = [
  [0.72, 0.34],
  [0.08, 0.78],
  [-0.66, 0.5],
];

export function WhitePanel() {
  return (
    <>
      <Backlight />
      <Frame material={paint} size={0.09} />
      <Hinge at={[-W / 2, 0, 0.03]}>
        <Box size={[W - 0.01, H - 0.01, 0.045]} at={[W / 2, 0, -0.025]} material={paint} />
        {rows.flatMap(([y, h]) =>
          [-0.19, 0.19].map((x) => (
            <group key={`${x}${y}`} position={[W / 2 + x, y, 0]}>
              <Box size={[0.31, h + 0.03, 0.006]} material={groove} />
              <Box size={[0.27, h - 0.01, 0.014]} material={panel} />
            </group>
          )),
        )}
        <Cylinder
          radius={0.03}
          height={0.03}
          at={[W - 0.09, -0.05, 0.01]}
          rotation={[Math.PI / 2, 0, 0]}
          material={chrome}
        />
        <Sphere radius={0.038} at={[W - 0.09, -0.05, 0.05]} material={chrome} />
      </Hinge>
    </>
  );
}
