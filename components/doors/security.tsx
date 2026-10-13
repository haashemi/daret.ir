import { MeshStandardMaterial } from "three";

import { Backlight, Box, Cylinder, Frame, H, Hinge, W } from "@/components/three/parts";

const steel = new MeshStandardMaterial({ color: "#2a2320", metalness: 0.6, roughness: 0.4 });
const inset = new MeshStandardMaterial({ color: "#3a2d26", metalness: 0.5, roughness: 0.45 });
const gold = new MeshStandardMaterial({ color: "#d6ac55", metalness: 0.9, roughness: 0.3 });
const glass = new MeshStandardMaterial({ color: "#111", metalness: 0.2, roughness: 0.05 });

const cx = W / 2;

// Thin gold strips outlining a `w` x `h` rectangle centered on `y`.
function Outline({ y, w, h }: { y: number; w: number; h: number }) {
  return (
    <group position={[cx, y, 0.012]}>
      <Box size={[w, 0.012, 0.006]} at={[0, h / 2, 0]} material={gold} />
      <Box size={[w, 0.012, 0.006]} at={[0, -h / 2, 0]} material={gold} />
      <Box size={[0.012, h, 0.006]} at={[-w / 2, 0, 0]} material={gold} />
      <Box size={[0.012, h, 0.006]} at={[w / 2, 0, 0]} material={gold} />
    </group>
  );
}

/** The steel apartment door every Tehran building has: bronze inset, gold trim, three locks and a peephole. */
export function Security() {
  return (
    <>
      <Backlight />
      <Frame material={steel} size={0.1} depth={0.24} />
      <Hinge at={[-W / 2, 0, 0.04]}>
        <Box size={[W - 0.01, H - 0.01, 0.06]} at={[cx, 0, -0.03]} material={steel} />
        <Box size={[0.66, 1.72, 0.012]} at={[cx, 0, 0.002]} material={inset} />
        <Outline y={0} w={0.66} h={1.72} />
        <Outline y={0.45} w={0.42} h={0.62} />
        <Outline y={-0.5} w={0.42} h={0.52} />
        <Box size={[0.16, 0.16, 0.006]} at={[cx, 0.45, 0.015]} rotation={[0, 0, Math.PI / 4]} material={gold} />
        <Box size={[0.1, 0.1, 0.006]} at={[cx, -0.5, 0.015]} rotation={[0, 0, Math.PI / 4]} material={gold} />
        {/* Peephole */}
        <Cylinder radius={0.018} height={0.02} at={[cx, 0.82, 0.01]} rotation={[Math.PI / 2, 0, 0]} material={gold} />
        <Cylinder radius={0.01} height={0.022} at={[cx, 0.82, 0.012]} rotation={[Math.PI / 2, 0, 0]} material={glass} />
        {/* Handle plate, lever and the three lock cylinders */}
        <Box size={[0.07, 0.42, 0.012]} at={[W - 0.08, -0.05, 0.008]} material={gold} />
        <Box size={[0.15, 0.024, 0.024]} at={[W - 0.13, 0.03, 0.05]} material={gold} />
        <Cylinder
          radius={0.01}
          height={0.04}
          at={[W - 0.08, 0.03, 0.03]}
          rotation={[Math.PI / 2, 0, 0]}
          material={gold}
        />
        {[-0.08, -0.17, 0.4].map((y) => (
          <Cylinder
            key={y}
            radius={0.016}
            height={0.03}
            at={[W - 0.08, y, 0.018]}
            rotation={[Math.PI / 2, 0, 0]}
            material={steel}
          />
        ))}
      </Hinge>
    </>
  );
}
