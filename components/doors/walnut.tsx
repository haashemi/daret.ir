import { MeshStandardMaterial } from "three";

import { Backlight, Box, Cylinder, Frame, H, Hinge, W } from "@/components/three/parts";

const wood = new MeshStandardMaterial({ color: "#3f2416", roughness: 0.5 });
const panel = new MeshStandardMaterial({ color: "#4b2c1a", roughness: 0.42 });
const casing = new MeshStandardMaterial({ color: "#2c190e", roughness: 0.55 });
const brass = new MeshStandardMaterial({ color: "#e0b860", metalness: 0.85, roughness: 0.3 });

const panels: [x: number, y: number, h: number][] = [
  [-0.19, 0.45, 0.85],
  [0.19, 0.45, 0.85],
  [-0.19, -0.55, 0.65],
  [0.19, -0.55, 0.65],
];

export function Walnut() {
  return (
    <>
      <Backlight />
      <Frame material={casing} size={0.1} />
      <Hinge at={[-W / 2, 0, 0.03]}>
        <Box size={[W - 0.01, H - 0.01, 0.045]} at={[W / 2, 0, -0.025]} material={wood} />
        {panels.map(([x, y, h]) => (
          <Box key={`${x}${y}`} size={[0.29, h, 0.016]} at={[W / 2 + x, y, 0.004]} material={panel} />
        ))}
        <Cylinder
          radius={0.032}
          height={0.012}
          at={[W - 0.09, -0.05, 0.004]}
          rotation={[Math.PI / 2, 0, 0]}
          material={brass}
        />
        <Box size={[0.13, 0.02, 0.02]} at={[W - 0.14, -0.05, 0.045]} material={brass} />
        <Cylinder
          radius={0.008}
          height={0.04}
          at={[W - 0.09, -0.05, 0.025]}
          rotation={[Math.PI / 2, 0, 0]}
          material={brass}
        />
        <Box size={[0.03, 0.07, 0.008]} at={[W - 0.09, -0.15, 0.002]} material={brass} />
      </Hinge>
    </>
  );
}
