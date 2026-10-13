import { MeshStandardMaterial } from "three";

import { Backlight, Box, Frame, H, Hinge, W } from "@/components/three/parts";

const red = new MeshStandardMaterial({ color: "#6e1a15", roughness: 0.75 });
const seam = new MeshStandardMaterial({ color: "#3e0d0a", roughness: 0.8 });
const trim = new MeshStandardMaterial({ color: "#e6e0d2", roughness: 0.6 });
const iron = new MeshStandardMaterial({ color: "#1d1d1d", metalness: 0.7, roughness: 0.5 });

const LEAF = W / 2 - 0.005;
const TRIM = 0.07;
const innerW = LEAF - TRIM * 2;
const innerH = H - 0.01 - TRIM * 2;
const brace = Math.hypot(innerW, innerH);
const braceAngle = Math.atan(innerW / innerH);

/** One leaf of planks with a white border and X brace. `dir` is `1` for a leaf that extends right of its hinge. */
function Leaf({ dir }: { dir: -1 | 1 }) {
  const cx = (dir * LEAF) / 2;

  return (
    <group position={[0, 0, -0.025]}>
      <Box size={[LEAF, H - 0.01, 0.045]} at={[cx, 0, 0]} material={red} />
      {[-0.11, 0, 0.11].map((x) => (
        <Box key={x} size={[0.006, H - 0.02, 0.046]} at={[cx + x, 0, 0]} material={seam} />
      ))}
      <group position={[cx, 0, 0.026]}>
        <Box size={[LEAF, TRIM, 0.012]} at={[0, H / 2 - TRIM / 2, 0]} material={trim} />
        <Box size={[LEAF, TRIM, 0.012]} at={[0, -H / 2 + TRIM / 2, 0]} material={trim} />
        <Box size={[TRIM, H - 0.01, 0.012]} at={[-LEAF / 2 + TRIM / 2, 0, 0]} material={trim} />
        <Box size={[TRIM, H - 0.01, 0.012]} at={[LEAF / 2 - TRIM / 2, 0, 0]} material={trim} />
        <Box size={[0.06, brace, 0.01]} rotation={[0, 0, braceAngle]} material={trim} />
        <Box size={[0.06, brace, 0.01]} rotation={[0, 0, -braceAngle]} material={trim} />
      </group>
      {/* Iron pull near the meeting edge */}
      <Box size={[0.025, 0.18, 0.025]} at={[dir * (LEAF - 0.06), 0.05, 0.055]} material={iron} />
    </group>
  );
}

/** Red barn doors that swing out as a pair. */
export function Barn() {
  return (
    <>
      <Backlight />
      <Frame material={trim} size={0.08} />
      <Hinge at={[-W / 2, 0, 0.03]}>
        <Leaf dir={1} />
      </Hinge>
      <Hinge at={[W / 2, 0, 0.03]} side="right">
        <Leaf dir={-1} />
      </Hinge>
    </>
  );
}
