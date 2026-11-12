import { MeshStandardMaterial } from "three";

import { Backlight, Box, Cylinder, Frame, H, Hinge, Sphere, W } from "@/components/three/parts";

// The apartment's lavender purple; the casing is painted the same, a shade lighter.
const paint = new MeshStandardMaterial({ color: "#7d6ca6", roughness: 0.55 });
const casing = new MeshStandardMaterial({ color: "#8a7ab2", roughness: 0.55 });
const edge = new MeshStandardMaterial({ color: "#6c5c93", roughness: 0.6 });
// The famous frame is an old picture frame painted yellow, not gilt.
const yellow = new MeshStandardMaterial({ color: "#e9cf3c", roughness: 0.45, metalness: 0.15 });
const brass = new MeshStandardMaterial({ color: "#c9a457", metalness: 0.85, roughness: 0.3 });
const blackened = new MeshStandardMaterial({ color: "#2a2622", metalness: 0.6, roughness: 0.45 });
const lens = new MeshStandardMaterial({ color: "#151515", metalness: 0.5, roughness: 0.1 });

const X = W / 2;
const UP: [number, number, number] = [Math.PI / 2, 0, 0];

// Portrait frame, its peephole near the top of the opening inside it.
const FRAME_Y = 0.6;
const FRAME_W = 0.25;
const FRAME_H = 0.32;
const BAR = 0.045;
const ROUND = 0.04;
// [x side, y side, turn of the quarter torus] for each rounded corner.
const corners: [number, number, number][] = [
  [1, 1, 0],
  [-1, 1, Math.PI / 2],
  [-1, -1, Math.PI],
  [1, -1, (Math.PI * 3) / 2],
];

/** A rounded rectangle of yellow molding: bars along the sides, rounded corners, a little bead inside and out. */
function PeepholeFrame() {
  const w = FRAME_W - BAR;
  const h = FRAME_H - BAR;

  return (
    <group position={[X, FRAME_Y, 0.012]}>
      {/* Straight runs */}
      <Box size={[w - ROUND * 2, BAR, 0.026]} at={[0, h / 2, 0]} material={yellow} />
      <Box size={[w - ROUND * 2, BAR, 0.026]} at={[0, -h / 2, 0]} material={yellow} />
      <Box size={[BAR, h - ROUND * 2, 0.026]} at={[-w / 2, 0, 0]} material={yellow} />
      <Box size={[BAR, h - ROUND * 2, 0.026]} at={[w / 2, 0, 0]} material={yellow} />
      {/* Rounded corners: quarter tori, with a carved knot on each */}
      {corners.map(([sx, sy, turn]) => (
        <group key={turn} position={[(sx * w) / 2 - sx * ROUND, (sy * h) / 2 - sy * ROUND, 0]}>
          <mesh rotation={[0, 0, turn]} material={yellow}>
            <torusGeometry args={[ROUND, BAR / 2, 16, 24, Math.PI / 2]} />
          </mesh>
          <Sphere radius={0.024} at={[sx * ROUND * 0.7, sy * ROUND * 0.7, 0.012]} material={yellow} />
        </group>
      ))}
      {/* Bead along the inside and outside edges */}
      {[w / 2 - BAR / 2, w / 2 + BAR / 2].map((x) => (
        <group key={x}>
          <Cylinder radius={0.006} height={h - ROUND * 2} at={[-x, 0, 0.014]} material={yellow} />
          <Cylinder radius={0.006} height={h - ROUND * 2} at={[x, 0, 0.014]} material={yellow} />
        </group>
      ))}
      {[h / 2 - BAR / 2, h / 2 + BAR / 2].map((y) => (
        <group key={y}>
          <Cylinder
            radius={0.006}
            height={w - ROUND * 2}
            at={[0, -y, 0.014]}
            rotation={[0, 0, Math.PI / 2]}
            material={yellow}
          />
          <Cylinder
            radius={0.006}
            height={w - ROUND * 2}
            at={[0, y, 0.014]}
            rotation={[0, 0, Math.PI / 2]}
            material={yellow}
          />
        </group>
      ))}
      {/* Peephole */}
      <Cylinder radius={0.014} height={0.016} at={[0, 0.05, -0.004]} rotation={UP} material={brass} />
      <Cylinder radius={0.007} height={0.018} at={[0, 0.05, -0.003]} rotation={UP} material={lens} />
    </group>
  );
}

/** Monica's apartment door: a flat lavender slab, the yellow frame around the peephole and a row of city locks. */
export function Monica() {
  return (
    <>
      <Backlight />
      <Frame material={casing} size={0.11} />
      <Hinge at={[-W / 2, 0, 0.03]}>
        <Box size={[W - 0.01, H - 0.01, 0.045]} at={[X, 0, -0.025]} material={paint} />
        {/* Faint stiles and rails of the slab */}
        {[0.11, W - 0.11].map((x) => (
          <Box key={x} size={[0.004, H - 0.24, 0.001]} at={[x, 0, 0]} material={edge} />
        ))}
        {[H / 2 - 0.12, -H / 2 + 0.12].map((y) => (
          <Box key={y} size={[W - 0.22, 0.004, 0.001]} at={[X, y, 0]} material={edge} />
        ))}
        <PeepholeFrame />
        {/* Round deadbolt under the frame */}
        <Cylinder radius={0.045} height={0.018} at={[X, 0.22, 0.009]} rotation={UP} material={brass} />
        <Box size={[0.014, 0.06, 0.016]} at={[X, 0.22, 0.024]} material={brass} />
        {/* Latch side: a small black lock box, a chain guard and the tall brass mortise lock */}
        <Box size={[0.06, 0.09, 0.03]} at={[W - 0.07, 0.48, 0.015]} material={blackened} />
        <Box size={[0.05, 0.05, 0.035]} at={[W - 0.07, 0.48, 0.03]} material={brass} />
        <Box size={[0.03, 0.12, 0.012]} at={[W - 0.06, 0.73, 0.006]} material={brass} />
        <Box size={[0.07, 0.11, 0.02]} at={[W - 0.08, 0.05, 0.01]} material={blackened} />
        <Box size={[0.07, 0.26, 0.012]} at={[W - 0.08, -0.2, 0.006]} material={brass} />
        <Cylinder radius={0.012} height={0.014} at={[W - 0.08, -0.12, 0.014]} rotation={UP} material={blackened} />
        <Cylinder radius={0.022} height={0.04} at={[W - 0.08, -0.25, 0.02]} rotation={UP} material={brass} />
        <Sphere radius={0.042} at={[W - 0.08, -0.25, 0.065]} material={brass} />
      </Hinge>
    </>
  );
}
