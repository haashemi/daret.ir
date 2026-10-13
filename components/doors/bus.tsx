import { MeshStandardMaterial } from "three";

import { Backlight, Box, Cylinder, H, Hinge, W } from "@/components/three/parts";

const body = new MeshStandardMaterial({ color: "#e8e3d6", metalness: 0.2, roughness: 0.4 });
const stripe = new MeshStandardMaterial({ color: "#c62828", roughness: 0.45 });
const aluminum = new MeshStandardMaterial({ color: "#9aa0a5", metalness: 1, roughness: 0.35 });
const rubber = new MeshStandardMaterial({ color: "#141414", roughness: 0.9 });
const chrome = new MeshStandardMaterial({ color: "#d9dde2", metalness: 1, roughness: 0.15 });
const glass = new MeshStandardMaterial({
  color: "#2a3a42",
  roughness: 0.05,
  metalness: 0.3,
  transparent: true,
  opacity: 0.45,
});
const amber = new MeshStandardMaterial({
  color: "#ffae00",
  emissive: "#ffae00",
  emissiveIntensity: 1.6,
  toneMapped: false,
});

// Each side folds in two: the joint pushes out toward the viewer while the far edge stays on its track.
const P = W / 4;
const FOLD = 1.35;
const SIDE = 0.26;
const HEADER = 0.22;
const KICK = 0.42;
const RAIL = 0.06;
const glassH = H - 0.01 - KICK - RAIL;
const glassY = (KICK - RAIL) / 2;

/** One folding panel. `dir` is `1` for a panel that extends right of its pivot. */
function Panel({ dir, pole }: { dir: -1 | 1; pole?: boolean }) {
  const cx = (dir * P) / 2;

  return (
    <group position={[0, 0, -0.02]}>
      <Box size={[P - 0.01, glassH, 0.006]} at={[cx, glassY, 0]} material={glass} />
      <Box size={[P - 0.01, KICK, 0.03]} at={[cx, -H / 2 + KICK / 2 + 0.005, 0]} material={aluminum} />
      <Box size={[P - 0.01, RAIL, 0.03]} at={[cx, H / 2 - RAIL / 2 - 0.005, 0]} material={aluminum} />
      <Box size={[0.025, H - 0.01, 0.035]} at={[dir * 0.0125, 0, 0]} material={rubber} />
      <Box size={[0.025, H - 0.01, 0.035]} at={[dir * (P - 0.0125), 0, 0]} material={rubber} />
      {pole && <Cylinder radius={0.012} height={0.6} at={[cx, 0.1, 0.035]} material={chrome} />}
    </group>
  );
}

/** City-bus doors: two bi-fold leaves that fold out, with the route sign above. */
export function Bus() {
  const column = W / 2 + SIDE / 2;

  return (
    <>
      <Backlight />
      <Box size={[SIDE, H, 0.06]} at={[-column, 0, 0]} material={body} />
      <Box size={[SIDE, H, 0.06]} at={[column, 0, 0]} material={body} />
      <Box size={[W + SIDE * 2, HEADER, 0.06]} at={[0, H / 2 + HEADER / 2, 0]} material={body} />
      {[-column, column].map((x) => (
        <Box key={x} size={[SIDE, 0.12, 0.062]} at={[x, -0.35, 0]} material={stripe} />
      ))}
      <Box size={[0.6, 0.1, 0.01]} at={[0, H / 2 + HEADER / 2, 0.032]} material={amber} />
      <Hinge at={[-W / 2, 0, 0.03]} angle={FOLD}>
        <Panel dir={1} />
        <Hinge at={[P, 0, 0]} side="right" angle={FOLD * 2}>
          <Panel dir={1} pole />
        </Hinge>
      </Hinge>
      <Hinge at={[W / 2, 0, 0.03]} side="right" angle={FOLD}>
        <Panel dir={-1} />
        <Hinge at={[-P, 0, 0]} angle={FOLD * 2}>
          <Panel dir={-1} pole />
        </Hinge>
      </Hinge>
    </>
  );
}
