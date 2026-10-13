import { MeshStandardMaterial } from "three";

import { Backlight, Box, Frame, H, Hinge, Sphere, W } from "@/components/three/parts";

const casing = new MeshStandardMaterial({ color: "#2c190e", roughness: 0.55 });
const brass = new MeshStandardMaterial({ color: "#e0b860", metalness: 0.85, roughness: 0.3 });

const T = 0.045;
// Each door, from the outside in: width, height and color. Every one but the last has the next one in it.
const levels = (
  [
    [W - 0.01, H - 0.01, "#3f2416"],
    [0.56, 1.32, "#e9e5dc"],
    [0.34, 0.8, "#b3261e"],
    [0.2, 0.46, "#2e5e8c"],
  ] as const
).map(([w, h, color]) => ({ w, h, material: new MeshStandardMaterial({ color, roughness: 0.5 }) }));

/** One door, drawn from its bottom-left corner, with a hole for the next one. */
function Door({ level }: { level: number }) {
  const current = levels[level];
  if (!current) return null;

  const { w, h, material } = current;
  const inner = levels[level + 1];
  const knob = <Sphere radius={w * 0.04} at={[w * 0.9, h * 0.45, 0.02]} material={brass} />;

  if (!inner) {
    return (
      <>
        <Box size={[w, h, T]} at={[w / 2, h / 2, -T / 2]} material={material} />
        {knob}
      </>
    );
  }

  // The hole leaves a small gap around the inner door.
  const hw = inner.w + 0.01;
  const hh = inner.h + 0.01;
  const hx = (w - hw) / 2;
  const hy = h * 0.06;
  const right = w - hx - hw;
  const above = h - hy - hh;

  return (
    <>
      <Box size={[hx, h, T]} at={[hx / 2, h / 2, -T / 2]} material={material} />
      <Box size={[right, h, T]} at={[w - right / 2, h / 2, -T / 2]} material={material} />
      <Box size={[hw, hy, T]} at={[hx + hw / 2, hy / 2, -T / 2]} material={material} />
      <Box size={[hw, above, T]} at={[hx + hw / 2, h - above / 2, -T / 2]} material={material} />
      {knob}
      <Hinge at={[hx + 0.005, hy + 0.005, 0]} angle={1.6}>
        <Door level={level + 1} />
      </Hinge>
    </>
  );
}

/** A door in a door in a door in a door; each one opens. */
export function Nested() {
  return (
    <>
      <Backlight />
      <Frame material={casing} size={0.1} />
      <Hinge at={[-W / 2 + 0.005, -H / 2 + 0.005, 0.03]}>
        <Door level={0} />
      </Hinge>
    </>
  );
}
