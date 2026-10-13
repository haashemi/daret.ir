import { MeshStandardMaterial } from "three";

import { Backlight, Box, Cylinder, Frame, H, Hinge, Sphere, W } from "@/components/three/parts";

const paint = new MeshStandardMaterial({ color: "#5d6b5f", metalness: 0.3, roughness: 0.55 });
const casing = new MeshStandardMaterial({ color: "#3a3d3b", roughness: 0.6 });
const brass = new MeshStandardMaterial({ color: "#e0b860", metalness: 0.85, roughness: 0.3 });
const steel = new MeshStandardMaterial({ color: "#c3c8cd", metalness: 1, roughness: 0.25 });
const glass = new MeshStandardMaterial({ color: "#111", metalness: 0.2, roughness: 0.05 });

const EDGE = W - 0.08;
const FACE: [number, number, number] = [Math.PI / 2, 0, 0];
const deadbolts = [0.78, 0.6, 0.42, 0.24, -0.26, -0.44, -0.62];
const chains = [0.92, 0.52, 0.12];
const padlocks = [-0.85, 0.98];
const peepholes: [x: number, y: number][] = [
  [W / 2, 0.82],
  [W / 2 - 0.2, 0.62],
  [W / 2 - 0.1, 0.25],
];

/** One chain lock: a slide on the edge and the chain hanging down to its knob. */
function Chain({ y }: { y: number }) {
  return (
    <>
      <Box size={[0.12, 0.03, 0.02]} at={[EDGE - 0.06, y, 0.01]} material={steel} />
      {Array.from({ length: 6 }, (_, i) => (
        <mesh
          key={i}
          position={[EDGE - 0.18, y - 0.02 - i * 0.022, 0.025]}
          rotation={[0, i % 2 ? Math.PI / 2 : 0, Math.PI / 2]}
          material={steel}
        >
          <torusGeometry args={[0.012, 0.003, 6, 16]} />
        </mesh>
      ))}
      <Sphere radius={0.014} at={[EDGE - 0.18, y - 0.155, 0.025]} material={steel} />
    </>
  );
}

/** Seven deadbolts, three chains, two padlocks, a bar and three peepholes, for when one lock isn't enough. */
export function Paranoid() {
  return (
    <>
      <Backlight />
      <Frame material={casing} size={0.1} depth={0.24} />
      <Hinge at={[-W / 2, 0, 0.04]}>
        <Box size={[W - 0.01, H - 0.01, 0.06]} at={[W / 2, 0, -0.03]} material={paint} />
        {deadbolts.map((y, i) => (
          <group key={y} position={[EDGE, y, 0]}>
            <Cylinder radius={0.03} height={0.02} at={[0, 0, 0.01]} rotation={FACE} material={i % 2 ? steel : brass} />
            <Cylinder radius={0.012} height={0.024} at={[0, 0, 0.012]} rotation={FACE} material={glass} />
          </group>
        ))}
        {chains.map((y) => (
          <Chain key={y} y={y} />
        ))}
        {padlocks.map((y) => (
          <group key={y} position={[EDGE + 0.02, y, 0]}>
            <Box size={[0.14, 0.04, 0.01]} at={[-0.05, 0, 0.008]} material={steel} />
            <mesh position={[0, -0.025, 0.03]} material={steel}>
              <torusGeometry args={[0.02, 0.005, 8, 24, Math.PI]} />
            </mesh>
            <Box size={[0.06, 0.07, 0.025]} at={[0, -0.06, 0.03]} material={brass} />
          </group>
        ))}
        {peepholes.map(([x, y]) => (
          <group key={y} position={[x, y, 0]}>
            <Cylinder radius={0.018} height={0.02} at={[0, 0, 0.01]} rotation={FACE} material={brass} />
            <Cylinder radius={0.01} height={0.022} at={[0, 0, 0.012]} rotation={FACE} material={glass} />
          </group>
        ))}
        {/* Security bar across the door on two brackets */}
        <Box size={[W - 0.06, 0.05, 0.04]} at={[W / 2, -0.05, 0.05]} material={steel} />
        {[0.08, W - 0.08].map((x) => (
          <Box key={x} size={[0.05, 0.1, 0.05]} at={[x, -0.05, 0.025]} material={casing} />
        ))}
        {/* And a regular lever, just in case */}
        <Box size={[0.15, 0.024, 0.024]} at={[EDGE - 0.07, 0.05, 0.05]} material={brass} />
        <Cylinder radius={0.03} height={0.02} at={[EDGE, 0.05, 0.01]} rotation={FACE} material={brass} />
      </Hinge>
    </>
  );
}
