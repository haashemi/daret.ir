import { MeshStandardMaterial } from "three";

import { Backlight, Box, Cylinder, Frame, H, Hinge, Sphere, W } from "@/components/three/parts";

const marble = new MeshStandardMaterial({ color: "#f4f1ea", roughness: 0.25 });
const pearl = new MeshStandardMaterial({ color: "#fbfaf6", metalness: 0.1, roughness: 0.2 });
const gold = new MeshStandardMaterial({ color: "#e8c46a", metalness: 1, roughness: 0.2 });
const cloud = new MeshStandardMaterial({ color: "#ffffff", roughness: 1 });
const feather = new MeshStandardMaterial({ color: "#ffffff", roughness: 0.7 });
const halo = new MeshStandardMaterial({
  color: "#ffe9a8",
  emissive: "#ffd970",
  emissiveIntensity: 1.5,
  toneMapped: false,
});

const LEAF = W / 2 - 0.005;
const FRAME = 0.1;
// [angle from horizontal, length] of each feather, top to bottom.
const feathers: [number, number][] = [
  [0.7, 0.17],
  [0.35, 0.2],
  [0, 0.19],
  [-0.35, 0.16],
  [-0.65, 0.13],
];
const clouds: [x: number, y: number, z: number, r: number][] = [
  [-0.62, -0.95, 0.12, 0.13],
  [-0.48, -1.0, 0.22, 0.1],
  [-0.3, -1.02, 0.28, 0.07],
  [0, -1.03, 0.32, 0.06],
  [0.3, -1.02, 0.28, 0.07],
  [0.5, -1.0, 0.2, 0.1],
  [0.64, -0.94, 0.1, 0.12],
  [0.58, -0.82, -0.02, 0.09],
  [-0.58, -0.8, -0.02, 0.09],
];

/** Thin gold strips outlining a `w` x `h` rectangle centered on `x`, `y`. */
function Outline({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <group position={[x, y, 0.001]}>
      <Box size={[w, 0.014, 0.006]} at={[0, h / 2, 0]} material={gold} />
      <Box size={[w, 0.014, 0.006]} at={[0, -h / 2, 0]} material={gold} />
      <Box size={[0.014, h, 0.006]} at={[-w / 2, 0, 0]} material={gold} />
      <Box size={[0.014, h, 0.006]} at={[w / 2, 0, 0]} material={gold} />
    </group>
  );
}

/** A pearl leaf with gold panels and a little sunburst. `dir` is `1` for a leaf that extends right of its hinge. */
function Leaf({ dir }: { dir: -1 | 1 }) {
  const cx = (dir * LEAF) / 2;

  return (
    <>
      <Box size={[LEAF, H - 0.01, 0.045]} at={[cx, 0, -0.025]} material={pearl} />
      <Outline x={cx} y={0.45} w={LEAF - 0.12} h={0.85} />
      <Outline x={cx} y={-0.55} w={LEAF - 0.12} h={0.65} />
      <group position={[cx, 0.45, 0.003]}>
        <Cylinder radius={0.05} height={0.01} rotation={[Math.PI / 2, 0, 0]} material={gold} />
        {Array.from({ length: 8 }, (_, i) => (
          <Box key={i} size={[0.24, 0.01, 0.004]} rotation={[0, 0, (i * Math.PI) / 8]} material={gold} />
        ))}
      </group>
      <Sphere radius={0.03} at={[dir * (LEAF - 0.06), -0.05, 0.03]} material={gold} />
    </>
  );
}

/** The pearly double doors: white and gold, winged, on a bed of clouds, with a halo on top. */
export function Heaven() {
  return (
    <>
      <Backlight />
      <Frame material={marble} size={FRAME} />
      <mesh position={[0, H / 2 + FRAME + 0.12, 0]} rotation={[Math.PI / 2 - 0.5, 0, 0]} material={halo}>
        <torusGeometry args={[0.16, 0.018, 12, 48]} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (W / 2 + FRAME), 0.35, -0.04]}>
          {feathers.map(([angle, length]) => (
            <Box
              key={angle}
              size={[length, 0.05, 0.02]}
              at={[(side * Math.cos(angle) * length) / 2, (Math.sin(angle) * length) / 2, 0]}
              rotation={[0, 0, side * angle]}
              material={feather}
            />
          ))}
        </group>
      ))}
      {clouds.map(([x, y, z, r]) => (
        <Sphere key={`${x}${z}`} radius={r} at={[x, y, z]} material={cloud} />
      ))}
      <Hinge at={[-W / 2, 0, 0.03]}>
        <Leaf dir={1} />
      </Hinge>
      <Hinge at={[W / 2, 0, 0.03]} side="right">
        <Leaf dir={-1} />
      </Hinge>
    </>
  );
}
