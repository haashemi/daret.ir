import { MeshStandardMaterial, Path, Shape } from "three";

import { Backlight, Box, Cylinder, Frame, H, Hinge, W } from "@/components/three/parts";

const paint = new MeshStandardMaterial({ color: "#e8e6e1", metalness: 0.5, roughness: 0.35 });
const rubber = new MeshStandardMaterial({ color: "#141414", roughness: 0.9 });
const glass = new MeshStandardMaterial({
  color: "#24343c",
  roughness: 0.05,
  metalness: 0.3,
  transparent: true,
  opacity: 0.55,
});
const chrome = new MeshStandardMaterial({ color: "#d9dde2", metalness: 1, roughness: 0.15 });
const rust = new MeshStandardMaterial({ color: "#8a4a1c", roughness: 1 });
const blue = new MeshStandardMaterial({ color: "#1f4fa8", roughness: 0.5 });
const plate = new MeshStandardMaterial({ color: "#f4f4f0", roughness: 0.4 });
const block = new MeshStandardMaterial({ color: "#6d6a63", roughness: 0.9 });

const LH = H - 0.01;
const SILL = 0.12;
const TOP = LH / 2 - 0.1;

/** The window outline grown by `grow`, raked on the hinge (front) side like an A-pillar. */
function windowPath(grow: number) {
  return new Path()
    .moveTo(0.08 - grow, SILL - grow)
    .lineTo(W - 0.08 + grow, SILL - grow)
    .lineTo(W - 0.08 + grow, TOP + grow)
    .lineTo(0.32 - grow, TOP + grow)
    .closePath();
}

const leaf = new Shape()
  .moveTo(0.005, -LH / 2)
  .lineTo(W - 0.005, -LH / 2)
  .lineTo(W - 0.005, LH / 2)
  .lineTo(0.005, LH / 2);
leaf.holes.push(windowPath(0));
const seal = new Shape(windowPath(0.025).getPoints());
seal.holes.push(windowPath(0));
const pane = new Shape(windowPath(0).getPoints());

const spots: [x: number, y: number, r: number][] = [
  [0.22, -0.86, 0.06],
  [0.31, -0.8, 0.03],
  [0.72, -0.92, 0.04],
  [0.86, 0.02, 0.025],
];

/** A Pride car door, repurposed as a front door: tinted window, side mirror, rust and a plate for the house number. */
export function Pride() {
  return (
    <>
      <Backlight />
      <Frame material={block} size={0.1} />
      <Hinge at={[-W / 2, 0, 0.03]}>
        <group position={[0, 0, -0.0475]}>
          <mesh material={paint}>
            <extrudeGeometry args={[leaf, { depth: 0.045, bevelEnabled: false }]} />
          </mesh>
          <mesh position={[0, 0, 0.045]} material={rubber}>
            <extrudeGeometry args={[seal, { depth: 0.008, bevelEnabled: false }]} />
          </mesh>
          <mesh position={[0, 0, 0.02]} material={glass}>
            <shapeGeometry args={[pane]} />
          </mesh>
        </group>
        {/* Body crease and rubber side molding */}
        <Box size={[W - 0.02, 0.012, 0.006]} at={[W / 2, -0.1, 0]} material={chrome} />
        <Box size={[W - 0.01, 0.05, 0.014]} at={[W / 2, -0.35, 0.004]} material={rubber} />
        {/* Pull handle, keyhole and the car's own hinges */}
        <Box size={[0.14, 0.05, 0.006]} at={[W - 0.16, 0.03, 0.001]} material={rubber} />
        <Box size={[0.12, 0.025, 0.02]} at={[W - 0.16, 0.03, 0.01]} material={chrome} />
        <Cylinder
          radius={0.012}
          height={0.01}
          at={[W - 0.05, 0.03, 0.003]}
          rotation={[Math.PI / 2, 0, 0]}
          material={chrome}
        />
        {[0, -0.6].map((y) => (
          <Box key={y} size={[0.05, 0.1, 0.03]} at={[0.03, y, 0]} material={rubber} />
        ))}
        {/* Side mirror at the front corner of the window */}
        <Box size={[0.03, 0.03, 0.08]} at={[0.15, SILL + 0.05, 0.04]} material={rubber} />
        <Box size={[0.16, 0.1, 0.06]} at={[0.15, SILL + 0.08, 0.1]} material={rubber} />
        {spots.map(([x, y, r]) => (
          <Cylinder
            key={x}
            radius={r}
            height={0.004}
            at={[x, y, 0.001]}
            rotation={[Math.PI / 2, 0, 0]}
            material={rust}
          />
        ))}
        {/* License plate as the house number */}
        <Box size={[0.36, 0.08, 0.008]} at={[W / 2, -0.58, 0.004]} material={plate} />
        <Box size={[0.04, 0.08, 0.009]} at={[W / 2 - 0.16, -0.58, 0.005]} material={blue} />
      </Hinge>
    </>
  );
}
