import { MeshStandardMaterial } from "three";

import { Backlight, Box, Frame, H, Hinge, Sphere, W } from "@/components/three/parts";

const wood = new MeshStandardMaterial({ color: "#d8cfbd", roughness: 0.6 });
const slat = new MeshStandardMaterial({ color: "#cbc1ac", roughness: 0.65 });
const brass = new MeshStandardMaterial({ color: "#e0b860", metalness: 0.85, roughness: 0.3 });

const STILE = 0.08;
const TOP = 0.1;
const MID = 0.12;
const BOTTOM = 0.16;
const sectionHeight = (H - TOP - MID - BOTTOM) / 2;
const SLAT_GAP = 0.055;

/** Center heights of the louvers in a section centered on `y`. */
function slatsIn(y: number) {
  const count = Math.floor(sectionHeight / SLAT_GAP);
  return Array.from({ length: count }, (_, i) => y - sectionHeight / 2 + SLAT_GAP / 2 + i * SLAT_GAP);
}

const upper = H / 2 - TOP - sectionHeight / 2;
const lower = -H / 2 + BOTTOM + sectionHeight / 2;
const slats = [...slatsIn(upper), ...slatsIn(lower)];

/** A louvered closet door; the light slips between the slats. */
export function Closet() {
  return (
    <>
      <Backlight />
      <Frame material={wood} size={0.07} />
      <Hinge at={[-W / 2, 0, 0.025]}>
        <group position={[0, 0, -0.02]}>
          <Box size={[STILE, H - 0.01, 0.035]} at={[STILE / 2, 0, 0]} material={wood} />
          <Box size={[STILE, H - 0.01, 0.035]} at={[W - STILE / 2, 0, 0]} material={wood} />
          <Box size={[W - 0.01, TOP, 0.035]} at={[W / 2, H / 2 - TOP / 2, 0]} material={wood} />
          <Box size={[W - 0.01, MID, 0.035]} at={[W / 2, (upper + lower) / 2, 0]} material={wood} />
          <Box size={[W - 0.01, BOTTOM, 0.035]} at={[W / 2, -H / 2 + BOTTOM / 2, 0]} material={wood} />
          {slats.map((y) => (
            <Box
              key={y}
              size={[W - STILE * 2, 0.05, 0.008]}
              at={[W / 2, y, 0]}
              rotation={[-0.75, 0, 0]}
              material={slat}
            />
          ))}
        </group>
        <Sphere radius={0.025} at={[W - 0.05, (upper + lower) / 2, 0.02]} material={brass} />
      </Hinge>
    </>
  );
}
