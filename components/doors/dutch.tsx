import { MeshStandardMaterial } from "three";

import { Backlight, Box, Frame, H, Hinge, Sphere, W } from "@/components/three/parts";

const paint = new MeshStandardMaterial({ color: "#5f7d5a", roughness: 0.6 });
const seam = new MeshStandardMaterial({ color: "#46603f", roughness: 0.65 });
const casing = new MeshStandardMaterial({ color: "#efe9dc", roughness: 0.55 });
const glass = new MeshStandardMaterial({ color: "#dbe9ee", roughness: 0.08, transparent: true, opacity: 0.35 });
const iron = new MeshStandardMaterial({ color: "#26231f", metalness: 0.7, roughness: 0.5 });
const brass = new MeshStandardMaterial({ color: "#e0b860", metalness: 0.85, roughness: 0.3 });

const HALF = (H - 0.01) / 2;
const STILE = 0.09;
const paneW = W - 0.01 - STILE * 2;
const paneH = HALF - STILE * 2;
// Z brace on the bottom half, from the hinge side up to the latch side.
const braceRun = W - 0.2;
const braceRise = HALF - 0.24;

function Straps() {
  return [0.25, -0.25].map((y) => <Box key={y} size={[0.26, 0.035, 0.01]} at={[0.13, y, 0.026]} material={iron} />);
}

/** A stable door split in two: the halves open on their own, the bottom one carries a little ledge. */
export function Dutch() {
  return (
    <>
      <Backlight />
      <Frame material={casing} size={0.09} />
      {/* Top half: four glass panes */}
      <Hinge at={[-W / 2, H / 4, 0.03]} angle={1.9}>
        <group position={[0, 0, -0.025]}>
          <Box size={[STILE, HALF, 0.045]} at={[0.005 + STILE / 2, 0, 0]} material={paint} />
          <Box size={[STILE, HALF, 0.045]} at={[W - 0.005 - STILE / 2, 0, 0]} material={paint} />
          <Box size={[W - 0.01, STILE, 0.045]} at={[W / 2, HALF / 2 - STILE / 2, 0]} material={paint} />
          <Box size={[W - 0.01, STILE, 0.045]} at={[W / 2, -HALF / 2 + STILE / 2, 0]} material={paint} />
          <Box size={[paneW, paneH, 0.01]} at={[W / 2, 0, 0]} material={glass} />
          <Box size={[0.025, paneH, 0.03]} at={[W / 2, 0, 0]} material={paint} />
          <Box size={[paneW, 0.025, 0.03]} at={[W / 2, 0, 0]} material={paint} />
          <Straps />
        </group>
      </Hinge>
      {/* Bottom half: planks, Z brace and the ledge */}
      <Hinge at={[-W / 2, -H / 4, 0.03]} angle={1.2}>
        <group position={[0, 0, -0.025]}>
          <Box size={[W - 0.01, HALF, 0.045]} at={[W / 2, 0, 0]} material={paint} />
          {[0.23, 0.45, 0.67].map((x) => (
            <Box key={x} size={[0.006, HALF - 0.01, 0.046]} at={[x, 0, 0]} material={seam} />
          ))}
          {[HALF / 2 - 0.12, -HALF / 2 + 0.12].map((y) => (
            <Box key={y} size={[W - 0.1, 0.09, 0.02]} at={[W / 2, y, 0.03]} material={paint} />
          ))}
          <Box
            size={[Math.hypot(braceRun, braceRise), 0.08, 0.02]}
            at={[W / 2, 0, 0.03]}
            rotation={[0, 0, Math.atan2(braceRise, braceRun)]}
            material={paint}
          />
          <Box size={[W - 0.01, 0.035, 0.11]} at={[W / 2, HALF / 2 - 0.0175, 0.03]} material={paint} />
          <Straps />
          <Sphere radius={0.03} at={[W - 0.09, HALF / 2 - 0.2, 0.06]} material={brass} />
        </group>
      </Hinge>
    </>
  );
}
