import { DoubleSide, MeshStandardMaterial } from "three";

import { Backlight, Box, Frame, H, Slide, W } from "@/components/three/parts";

const wood = new MeshStandardMaterial({ color: "#b48f5e", roughness: 0.7 });
const dark = new MeshStandardMaterial({ color: "#5b4127", roughness: 0.75 });
const paper = new MeshStandardMaterial({
  color: "#f2eadb",
  roughness: 0.9,
  transparent: true,
  opacity: 0.8,
  side: DoubleSide,
});

const PW = W / 2 + 0.01;
const BORDER = 0.035;
const ribsX = [-PW / 6, PW / 6];
const ribsY = Array.from({ length: 7 }, (_, i) => -H / 2 + ((i + 1) * H) / 8);

/** One paper panel with its kumiko lattice, centered on its group. */
function Panel() {
  return (
    <>
      <mesh material={paper}>
        <planeGeometry args={[PW - BORDER, H - BORDER]} />
      </mesh>
      <Box size={[BORDER, H, 0.03]} at={[-PW / 2 + BORDER / 2, 0, 0]} material={wood} />
      <Box size={[BORDER, H, 0.03]} at={[PW / 2 - BORDER / 2, 0, 0]} material={wood} />
      <Box size={[PW, BORDER, 0.03]} at={[0, H / 2 - BORDER / 2, 0]} material={wood} />
      <Box size={[PW, BORDER * 2, 0.03]} at={[0, -H / 2 + BORDER, 0]} material={wood} />
      {ribsX.map((x) => (
        <Box key={x} size={[0.012, H, 0.016]} at={[x, 0, 0.004]} material={wood} />
      ))}
      {ribsY.map((y) => (
        <Box key={y} size={[PW, 0.012, 0.016]} at={[0, y, 0.004]} material={wood} />
      ))}
    </>
  );
}

/** Japanese paper sliding doors; the front panel slides over the back one and the light glows through the paper. */
export function Shoji() {
  return (
    <>
      <Backlight at={[0, 0, -0.12]} />
      <Frame material={dark} size={0.06} depth={0.16} />
      <group position={[-W / 4, 0, -0.04]}>
        <Panel />
      </group>
      <Slide by={[-W / 2 + 0.02, 0, 0]}>
        <group position={[W / 4, 0, 0]}>
          <Panel />
        </group>
      </Slide>
    </>
  );
}
