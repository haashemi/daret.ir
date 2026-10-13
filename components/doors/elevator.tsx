import { MeshStandardMaterial } from "three";

import { Backlight, Box, Cylinder, H, Slide } from "@/components/three/parts";

const surround = new MeshStandardMaterial({ color: "#6f747a", metalness: 1, roughness: 0.4 });
const panel = new MeshStandardMaterial({ color: "#b4b9be", metalness: 1, roughness: 0.22 });
const black = new MeshStandardMaterial({ color: "#0b0b0c", roughness: 0.3 });
const led = new MeshStandardMaterial({
  color: "#ff3b2f",
  emissive: "#ff3b2f",
  emissiveIntensity: 2,
  toneMapped: false,
});
const lit = new MeshStandardMaterial({
  color: "#ffd59a",
  emissive: "#ffd59a",
  emissiveIntensity: 1.5,
  toneMapped: false,
});

const EW = 0.76;
const SIDE = 0.34;
const HEADER = 0.3;

/** Brushed-steel elevator doors that part to the sides, with a floor indicator and call buttons. */
export function Elevator() {
  const column = EW / 2 + SIDE / 2;

  return (
    <>
      <Backlight width={EW} />
      {/* Surround: the panels slide behind the side columns */}
      <group position={[0, 0, 0.02]}>
        <Box size={[SIDE, H, 0.04]} at={[-column, 0, 0]} material={surround} />
        <Box size={[SIDE, H, 0.04]} at={[column, 0, 0]} material={surround} />
        <Box size={[EW + SIDE * 2, HEADER, 0.04]} at={[0, H / 2 + HEADER / 2, 0]} material={surround} />
        <Box size={[0.22, 0.09, 0.012]} at={[0, H / 2 + HEADER / 2, 0.025]} material={black} />
        <mesh position={[0, H / 2 + HEADER / 2, 0.032]} rotation={[0, 0, Math.PI / 2]} material={led}>
          <circleGeometry args={[0.025, 3]} />
        </mesh>
        <Box size={[0.07, 0.2, 0.012]} at={[column - 0.04, 0, 0.025]} material={panel} />
        <Cylinder
          radius={0.014}
          height={0.01}
          at={[column - 0.04, 0.04, 0.034]}
          rotation={[Math.PI / 2, 0, 0]}
          material={lit}
        />
        <Cylinder
          radius={0.014}
          height={0.01}
          at={[column - 0.04, -0.04, 0.034]}
          rotation={[Math.PI / 2, 0, 0]}
          material={black}
        />
      </group>
      <Slide by={[-EW / 2 + 0.02, 0, 0]}>
        <Box size={[EW / 2, H, 0.03]} at={[-EW / 4, 0, -0.02]} material={panel} />
      </Slide>
      <Slide by={[EW / 2 - 0.02, 0, 0]}>
        <Box size={[EW / 2, H, 0.03]} at={[EW / 4, 0, -0.02]} material={panel} />
      </Slide>
    </>
  );
}
