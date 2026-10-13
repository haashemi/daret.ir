import { MeshStandardMaterial } from "three";

import { Backlight, Box, Cylinder, H, Hinge } from "@/components/three/parts";

const enamel = new MeshStandardMaterial({ color: "#ebe8e2", roughness: 0.28, metalness: 0.05 });
const liner = new MeshStandardMaterial({ color: "#d9dcdf", roughness: 0.5 });
const steel = new MeshStandardMaterial({ color: "#b9bec4", metalness: 1, roughness: 0.25 });
const glass = new MeshStandardMaterial({ color: "#cfe3ea", roughness: 0.1, transparent: true, opacity: 0.45 });
const milk = new MeshStandardMaterial({ color: "#f7f5ef", roughness: 0.35 });

const FW = 0.8;
const FH = 1.85;
const DEPTH = 0.6;
const FREEZER = 0.55;
const FRIDGE = FH - FREEZER - 0.02;

/** A fridge, opened by its own door: freezer on top, the fridge below, a shelf and a bottle of milk inside. */
export function Fridge() {
  return (
    <group position={[0, (FH - H) / 2, 0]}>
      <Backlight width={FW - 0.08} height={FH - 0.08} at={[0, 0, -DEPTH + 0.02]} />
      {/* Cabinet shell */}
      <group position={[0, 0, -DEPTH / 2]}>
        <Box size={[0.04, FH, DEPTH]} at={[-FW / 2 + 0.02, 0, 0]} material={enamel} />
        <Box size={[0.04, FH, DEPTH]} at={[FW / 2 - 0.02, 0, 0]} material={enamel} />
        <Box size={[FW, 0.04, DEPTH]} at={[0, FH / 2 - 0.02, 0]} material={enamel} />
        <Box size={[FW, 0.08, DEPTH]} at={[0, -FH / 2 + 0.04, 0]} material={enamel} />
        <Box size={[FW - 0.08, 0.05, DEPTH]} at={[0, FH / 2 - FREEZER - 0.01, 0]} material={liner} />
        <Box size={[FW - 0.1, 0.012, DEPTH - 0.06]} at={[0, -0.05, 0]} material={glass} />
        <Box size={[FW - 0.1, 0.012, DEPTH - 0.06]} at={[0, -0.45, 0]} material={glass} />
      </group>
      <Cylinder radius={0.045} height={0.24} at={[-0.15, 0.08, -0.25]} material={milk} />
      <Cylinder radius={0.02} height={0.05} at={[-0.15, 0.225, -0.25]} material={steel} />

      <Hinge at={[-FW / 2, 0, 0]}>
        <Box size={[FW, FREEZER, 0.07]} at={[FW / 2, FH / 2 - FREEZER / 2, 0.035]} material={enamel} />
        <Cylinder radius={0.013} height={0.24} at={[FW - 0.07, FH / 2 - FREEZER + 0.18, 0.1]} material={steel} />
      </Hinge>
      <Hinge at={[-FW / 2, 0, 0]}>
        <Box size={[FW, FRIDGE, 0.07]} at={[FW / 2, -FH / 2 + FRIDGE / 2, 0.035]} material={enamel} />
        <Cylinder radius={0.013} height={0.5} at={[FW - 0.07, FH / 2 - FREEZER - 0.3, 0.1]} material={steel} />
      </Hinge>
    </group>
  );
}
