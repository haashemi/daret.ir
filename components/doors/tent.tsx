import { DoubleSide, MeshBasicMaterial, MeshStandardMaterial, Shape } from "three";

import { Box, Cylinder, H, Hinge, LIGHT_COLOR } from "@/components/three/parts";

const canvas = new MeshStandardMaterial({ color: "#e0662a", roughness: 0.9, side: DoubleSide });
const flap = new MeshStandardMaterial({ color: "#c95520", roughness: 0.9, side: DoubleSide });
const trim = new MeshStandardMaterial({ color: "#33302c", roughness: 0.8 });
const rope = new MeshStandardMaterial({ color: "#e8e2d0", roughness: 0.9 });
const steel = new MeshStandardMaterial({ color: "#b9bec4", metalness: 1, roughness: 0.3 });
// `Backlight` only draws rectangles and circles; the opening here is a triangle.
const light = new MeshBasicMaterial({ color: LIGHT_COLOR, toneMapped: false });

const FLOOR = -H / 2;
const B = 0.62;
const TOP = 0.5;
const RISE = TOP - FLOOR;
const DEPTH = 1.3;
// Each flap hangs from a slanted edge: its hinge axis leans in by `LEAN`.
const LEAN = Math.atan2(B, RISE);
const EDGE = Math.hypot(B, RISE);

const opening = new Shape().moveTo(-B, FLOOR).lineTo(B, FLOOR).lineTo(0, TOP).lineTo(-B, FLOOR);
// Drawn in the hinge's frame: the slanted edge is its y axis, the bottom center of the opening at (B cos, B sin).
const flapShape = new Shape()
  .moveTo(0, 0)
  .lineTo(B * Math.cos(LEAN), B * Math.sin(LEAN))
  .lineTo(0, EDGE)
  .lineTo(0, 0);

/** From the opening's frame (x right of the left corner, y up from the floor) into the hinge's. */
function local(x: number, y: number): [number, number, number] {
  return [x * Math.cos(LEAN) - y * Math.sin(LEAN), x * Math.sin(LEAN) + y * Math.cos(LEAN), 0];
}

/** The left half of the opening; the right one is this, mirrored. */
function Flap({ zipper }: { zipper?: boolean }) {
  const [zx, zy] = local(B - 0.007, RISE / 2);
  const [px, py] = local(B - 0.025, 0.55);
  const [bx, by] = local(B / 2, 0.02);

  return (
    <group position={[-B, FLOOR, 0.01]} rotation={[0, 0, -LEAN]}>
      <Hinge at={[0, 0, 0]}>
        <mesh material={flap}>
          <shapeGeometry args={[flapShape]} />
        </mesh>
        <Box size={[B, 0.04, 0.008]} at={[bx, by, 0.004]} rotation={[0, 0, LEAN]} material={trim} />
        {zipper && (
          <>
            <Box size={[0.014, RISE, 0.006]} at={[zx, zy, 0.004]} rotation={[0, 0, LEAN]} material={trim} />
            <Box size={[0.02, 0.05, 0.01]} at={[px, py, 0.01]} rotation={[0, 0, LEAN]} material={steel} />
          </>
        )}
      </Hinge>
    </group>
  );
}

/** A camping tent with its flaps unzipped, staked out with guy ropes. */
export function Tent() {
  const ropeX = 0.43;
  const ropeY = -0.765;

  return (
    <>
      <mesh position={[0, 0, -0.06]} material={light}>
        <shapeGeometry args={[opening]} />
      </mesh>
      {/* Two sloped sides and the back */}
      {[-1, 1].map((dir) => (
        <Box
          key={dir}
          size={[0.015, EDGE + 0.05, DEPTH]}
          at={[(dir * B) / 2, (TOP + FLOOR) / 2, 0.03 - DEPTH / 2]}
          rotation={[0, 0, dir * LEAN]}
          material={canvas}
        />
      ))}
      <mesh position={[0, 0, 0.03 - DEPTH]} material={canvas}>
        <shapeGeometry args={[opening]} />
      </mesh>
      <Cylinder radius={0.012} height={0.16} at={[0, TOP + 0.05, 0.03]} material={steel} />
      {/* Guy ropes from the sides down to their stakes */}
      {[-1, 1].map((dir) => (
        <group key={dir} position={[dir * B * 0.5, -0.26, -0.25]}>
          <Box
            size={[0.008, Math.hypot(ropeX, ropeY), 0.008]}
            at={[(dir * ropeX) / 2, ropeY / 2, 0]}
            rotation={[0, 0, Math.atan2(-dir * ropeX, ropeY)]}
            material={rope}
          />
          <Box size={[0.02, 0.07, 0.02]} at={[dir * ropeX, ropeY + 0.02, 0]} material={steel} />
        </group>
      ))}
      <Flap zipper />
      <group scale={[-1, 1, 1]}>
        <Flap />
      </group>
    </>
  );
}
