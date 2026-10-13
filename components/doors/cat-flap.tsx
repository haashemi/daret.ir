import type { Group } from "three";

import { useFrame } from "@react-three/fiber";
import { use, useRef } from "react";
import { MeshStandardMaterial } from "three";

import { Backlight, Box, Cylinder, Frame, H, OpenContext, Sphere, W } from "@/components/three/parts";

const paint = new MeshStandardMaterial({ color: "#3d5a80", roughness: 0.5 });
const panel = new MeshStandardMaterial({ color: "#34506f", roughness: 0.5 });
const casing = new MeshStandardMaterial({ color: "#e9e5dc", roughness: 0.5 });
const plastic = new MeshStandardMaterial({ color: "#d9d4c8", roughness: 0.6 });
const smoke = new MeshStandardMaterial({ color: "#5a4e44", roughness: 0.2, transparent: true, opacity: 0.6 });
const brass = new MeshStandardMaterial({ color: "#e0b860", metalness: 0.85, roughness: 0.3 });

const FW = 0.26;
const FH = 0.28;
const FY = -H / 2 + 0.14 + FH / 2;
const LW = W - 0.01;
const LH = H - 0.01;
const sideW = (LW - FW) / 2;
const aboveH = LH / 2 - (FY + FH / 2);
const belowH = FY - FH / 2 + LH / 2;

/** The cat flap swings out from its top edge. */
function Flap() {
  const ref = useRef<Group>(null);
  const open = use(OpenContext);

  useFrame(() => {
    if (ref.current) ref.current.rotation.x = -1.3 * open.current;
  });

  return (
    <group ref={ref} position={[0, FY + FH / 2, 0]}>
      <Box size={[FW - 0.01, FH - 0.01, 0.008]} at={[0, -FH / 2, -0.01]} material={smoke} />
    </group>
  );
}

/** A people door that stays shut; only the cat flap in it opens. */
export function CatFlap() {
  return (
    <>
      <Backlight width={FW} height={FH} at={[0, FY, -0.06]} />
      <Frame material={casing} size={0.09} />
      {/* The leaf, built around the flap's hole */}
      <group position={[0, 0, -0.0225]}>
        <Box size={[sideW, LH, 0.045]} at={[-FW / 2 - sideW / 2, 0, 0]} material={paint} />
        <Box size={[sideW, LH, 0.045]} at={[FW / 2 + sideW / 2, 0, 0]} material={paint} />
        <Box size={[FW, aboveH, 0.045]} at={[0, FY + FH / 2 + aboveH / 2, 0]} material={paint} />
        <Box size={[FW, belowH, 0.045]} at={[0, -LH / 2 + belowH / 2, 0]} material={paint} />
      </group>
      {[-0.19, 0.19].map((x) => (
        <Box key={x} size={[0.3, 0.7, 0.012]} at={[x, 0.45, 0.004]} material={panel} />
      ))}
      <Cylinder
        radius={0.03}
        height={0.02}
        at={[W / 2 - 0.09, -0.05, 0.01]}
        rotation={[Math.PI / 2, 0, 0]}
        material={brass}
      />
      <Sphere radius={0.038} at={[W / 2 - 0.09, -0.05, 0.05]} material={brass} />
      {/* Flap surround with cat ears */}
      <group position={[0, FY, 0.006]}>
        <Box size={[FW + 0.06, 0.03, 0.012]} at={[0, FH / 2 + 0.015, 0]} material={plastic} />
        <Box size={[FW + 0.06, 0.03, 0.012]} at={[0, -FH / 2 - 0.015, 0]} material={plastic} />
        <Box size={[0.03, FH, 0.012]} at={[-FW / 2 - 0.015, 0, 0]} material={plastic} />
        <Box size={[0.03, FH, 0.012]} at={[FW / 2 + 0.015, 0, 0]} material={plastic} />
        {[-1, 1].map((dir) => (
          <mesh
            key={dir}
            position={[dir * (FW / 2 - 0.01), FH / 2 + 0.06, 0]}
            rotation={[0, 0, Math.PI / 2]}
            material={plastic}
          >
            <circleGeometry args={[0.055, 3]} />
          </mesh>
        ))}
      </group>
      <Flap />
    </>
  );
}
