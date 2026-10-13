import { MeshStandardMaterial } from "three";

import { Backlight, Box, Frame, H, Hinge, Sphere, W } from "@/components/three/parts";

const iron = new MeshStandardMaterial({ color: "#1b1715", metalness: 0.7, roughness: 0.6 });
const plate = new MeshStandardMaterial({ color: "#2a211d", metalness: 0.6, roughness: 0.7 });
const basalt = new MeshStandardMaterial({ color: "#2b2523", roughness: 0.95 });
const bone = new MeshStandardMaterial({ color: "#d8cdb6", roughness: 0.7 });
const black = new MeshStandardMaterial({ color: "#050505", roughness: 1 });
const lava = new MeshStandardMaterial({
  color: "#ff5a1f",
  emissive: "#ff3b0a",
  emissiveIntensity: 2.2,
  toneMapped: false,
});

const FRAME = 0.12;
const plates = [0.235, 0.665].flatMap((x) => [0.67, 0, -0.67].map((y) => [x, y] as const));
// Glowing cracks, as polylines across the plates.
const cracks: [number, number][][] = [
  [
    [0.15, 0.92],
    [0.3, 0.72],
    [0.24, 0.52],
    [0.42, 0.3],
  ],
  [
    [0.76, 0.22],
    [0.6, 0.06],
    [0.68, -0.2],
    [0.5, -0.36],
  ],
  [
    [0.18, -0.5],
    [0.34, -0.66],
    [0.28, -0.88],
  ],
];
const segments = cracks.flatMap((points) =>
  points.flatMap((start, i) => {
    const end = points[i + 1];
    return end ? [[start, end] as const] : [];
  }),
);
const spikes = [-0.8, -0.45, -0.1, 0.25, 0.6, 0.95];

/** Charred iron plates split by lava, a skull knocker, and a spiked, horned frame. */
export function Hell() {
  return (
    <>
      <Backlight />
      <Frame material={basalt} size={FRAME} depth={0.3} />
      {[-1, 1].map((side) => (
        <group key={side}>
          {spikes.map((y) => (
            <mesh
              key={y}
              position={[side * (W / 2 + FRAME / 2), y, 0.19]}
              rotation={[Math.PI / 2, 0, 0]}
              material={iron}
            >
              <coneGeometry args={[0.025, 0.08, 12]} />
            </mesh>
          ))}
          <mesh
            position={[side * (W / 2 + FRAME / 2), H / 2 + FRAME + 0.08, 0]}
            rotation={[0, 0, -side * 0.45]}
            material={bone}
          >
            <coneGeometry args={[0.06, 0.22, 16]} />
          </mesh>
        </group>
      ))}
      <Hinge at={[-W / 2, 0, 0.03]}>
        <Box size={[W - 0.01, H - 0.01, 0.045]} at={[W / 2, 0, -0.025]} material={iron} />
        {plates.map(([x, y]) => (
          <group key={`${x}${y}`} position={[x, y, 0.006]}>
            <Box size={[0.4, 0.64, 0.012]} material={plate} />
            {[-1, 1].flatMap((sx) =>
              [-1, 1].map((sy) => (
                <Sphere key={`${sx}${sy}`} radius={0.012} at={[sx * 0.17, sy * 0.29, 0.006]} material={iron} />
              )),
            )}
          </group>
        ))}
        {segments.map(([[x1, y1], [x2, y2]]) => (
          <Box
            key={`${x1}${y1}`}
            size={[Math.hypot(x2 - x1, y2 - y1), 0.014, 0.004]}
            at={[(x1 + x2) / 2, (y1 + y2) / 2, 0.014]}
            rotation={[0, 0, Math.atan2(y2 - y1, x2 - x1)]}
            material={lava}
          />
        ))}
        {/* Skull knocker */}
        <Sphere radius={0.05} at={[W / 2, 0.3, 0.06]} material={bone} />
        <Box size={[0.05, 0.03, 0.04]} at={[W / 2, 0.255, 0.05]} material={bone} />
        {[-1, 1].map((dir) => (
          <Sphere key={dir} radius={0.012} at={[W / 2 + dir * 0.018, 0.31, 0.104]} material={black} />
        ))}
        <mesh position={[W / 2, 0.19, 0.07]} material={iron}>
          <torusGeometry args={[0.06, 0.008, 8, 32]} />
        </mesh>
        <Box size={[0.15, 0.024, 0.024]} at={[W - 0.13, -0.05, 0.05]} material={iron} />
      </Hinge>
    </>
  );
}
