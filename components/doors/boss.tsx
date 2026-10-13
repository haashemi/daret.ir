import { MeshStandardMaterial } from "three";

import { Backlight, Box, Cylinder, Frame, H, Hinge, Sphere, W } from "@/components/three/parts";

const leather = new MeshStandardMaterial({ color: "#5a1f1a", roughness: 0.45 });
const crease = new MeshStandardMaterial({ color: "#2f0f0c", roughness: 0.6 });
const brass = new MeshStandardMaterial({ color: "#e0b860", metalness: 0.85, roughness: 0.3 });
const wenge = new MeshStandardMaterial({ color: "#2a1a12", roughness: 0.5 });
const ink = new MeshStandardMaterial({ color: "#1a1a1a", roughness: 0.6 });

const T = 0.07;
const S = 0.115;
const A = 3;
const B = 8;
// Buttons on a diamond lattice: (a, b) with a + b even, creases running diagonally between them.
const buttons = Array.from({ length: A * 2 + 1 }, (_, i) => i - A).flatMap((a) =>
  Array.from({ length: B * 2 + 1 }, (_, j) => j - B)
    .filter((b) => (a + b) % 2 === 0)
    .map((b) => [a, b] as const),
);
const creases = buttons.flatMap(([a, b]) =>
  a < A ? [1, -1].filter((d) => Math.abs(b + d) <= B).map((d) => [a, b, d] as const) : [],
);
// Upholstery nails around the edge.
const nails = [
  ...Array.from({ length: 11 }, (_, i) => [0.05 + i * 0.08, H / 2 - 0.035] as const),
  ...Array.from({ length: 11 }, (_, i) => [0.05 + i * 0.08, -H / 2 + 0.035] as const),
  ...Array.from({ length: 24 }, (_, i) => [0.035, -0.92 + i * 0.08] as const),
  ...Array.from({ length: 24 }, (_, i) => [W - 0.035, -0.92 + i * 0.08] as const),
];

/** The tufted leather door of every Iranian office manager, brass nameplate included. */
export function Boss() {
  return (
    <>
      <Backlight />
      <Frame material={wenge} size={0.1} />
      <Hinge at={[-W / 2, 0, 0.05]}>
        <Box size={[W - 0.01, H - 0.01, T]} at={[W / 2, 0, -T / 2]} material={leather} />
        {creases.map(([a, b, d]) => (
          <Box
            key={`${a}${b}${d}`}
            size={[S * Math.SQRT2, 0.01, 0.004]}
            at={[W / 2 + (a + 0.5) * S, (b + d / 2) * S, 0.002]}
            rotation={[0, 0, (d * Math.PI) / 4]}
            material={crease}
          />
        ))}
        {buttons.map(([a, b]) => (
          <Sphere key={`${a}${b}`} radius={0.014} at={[W / 2 + a * S, b * S, 0.006]} material={brass} />
        ))}
        {nails.map(([x, y]) => (
          <Sphere key={`${x}${y}`} radius={0.008} at={[x, y, 0.004]} material={brass} />
        ))}
        {/* Nameplate */}
        <Box size={[0.3, 0.1, 0.01]} at={[W / 2, 0.46, 0.022]} material={brass} />
        <Box size={[0.2, 0.014, 0.002]} at={[W / 2, 0.475, 0.028]} material={ink} />
        <Box size={[0.13, 0.01, 0.002]} at={[W / 2, 0.44, 0.028]} material={ink} />
        <Cylinder
          radius={0.03}
          height={0.02}
          at={[W - 0.09, -0.05, 0.02]}
          rotation={[Math.PI / 2, 0, 0]}
          material={brass}
        />
        <Box size={[0.15, 0.024, 0.024]} at={[W - 0.14, -0.05, 0.05]} material={brass} />
      </Hinge>
    </>
  );
}
