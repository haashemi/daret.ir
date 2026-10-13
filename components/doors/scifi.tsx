import { MeshStandardMaterial, Shape } from "three";

import { Backlight, Box, H, Slide } from "@/components/three/parts";

const hull = new MeshStandardMaterial({ color: "#3a3f47", metalness: 0.85, roughness: 0.4 });
const panel = new MeshStandardMaterial({ color: "#8c939c", metalness: 0.9, roughness: 0.3 });
const dark = new MeshStandardMaterial({ color: "#1a1d22", metalness: 0.6, roughness: 0.5 });
const yellow = new MeshStandardMaterial({ color: "#f2c230", roughness: 0.6 });
const glow = new MeshStandardMaterial({
  color: "#5ff4ff",
  emissive: "#5ff4ff",
  emissiveIntensity: 2,
  toneMapped: false,
});

const EW = 0.66;
const SIDE = 0.38;
const HEADER = 0.24;
const TEETH = 0.05;
const column = EW / 2 + SIDE / 2;
// Zigzag seam where the two halves meet, bottom to top.
const seam: [number, number][] = [
  [TEETH, -H / 2],
  [-TEETH, -H / 6],
  [TEETH, H / 6],
  [-TEETH, H / 2],
];

function half(dir: -1 | 1) {
  const shape = new Shape().moveTo((dir * EW) / 2, -H / 2);
  for (const [x, y] of seam) shape.lineTo(x, y);
  return shape.lineTo((dir * EW) / 2, H / 2).closePath();
}

const halves = [
  { dir: -1, shape: half(-1) },
  { dir: 1, shape: half(1) },
] as const;
const stripes = Array.from({ length: 6 }, (_, i) => 0.16 + i * 0.07).flatMap((x) => [x, -x]);

/** A spaceship door: two zigzag halves slide into the hull, under cyan strip lights and hazard stripes. */
export function Scifi() {
  return (
    <>
      <Backlight width={EW} />
      <group position={[0, 0, 0.02]}>
        <Box size={[SIDE, H, 0.04]} at={[-column, 0, 0]} material={hull} />
        <Box size={[SIDE, H, 0.04]} at={[column, 0, 0]} material={hull} />
        <Box size={[EW + SIDE * 2, HEADER, 0.04]} at={[0, H / 2 + HEADER / 2, 0]} material={hull} />
        {[-1, 1].map((dir) => (
          <Box key={dir} size={[0.02, H, 0.01]} at={[dir * (EW / 2 + 0.02), 0, 0.025]} material={glow} />
        ))}
        <Box size={[EW + 0.06, 0.02, 0.01]} at={[0, H / 2 + 0.02, 0.025]} material={glow} />
        {stripes.map((x) => (
          <Box
            key={x}
            size={[0.03, 0.1, 0.01]}
            at={[x, H / 2 + HEADER / 2, 0.025]}
            rotation={[0, 0, 0.6]}
            material={yellow}
          />
        ))}
        <Box size={[0.06, 0.06, 0.012]} at={[0, H / 2 + HEADER / 2, 0.026]} material={glow} />
        {/* Keypad */}
        <Box size={[0.12, 0.18, 0.02]} at={[column, 0.05, 0.03]} material={dark} />
        <Box size={[0.07, 0.04, 0.01]} at={[column, 0.1, 0.042]} material={glow} />
      </group>
      {halves.map(({ dir, shape }) => (
        <Slide key={dir} by={[dir * (EW / 2 + TEETH), 0, 0]}>
          <mesh position={[0, 0, -0.05]} material={panel}>
            <extrudeGeometry args={[shape, { depth: 0.04, bevelEnabled: false }]} />
          </mesh>
          <Box size={[0.015, H * 0.6, 0.005]} at={[(dir * EW) / 4, 0, -0.008]} material={glow} />
          {[0.6, -0.6].map((y) => (
            <Box key={y} size={[EW / 2 - 0.12, 0.012, 0.004]} at={[dir * (EW / 4 + 0.02), y, -0.009]} material={dark} />
          ))}
        </Slide>
      ))}
    </>
  );
}
