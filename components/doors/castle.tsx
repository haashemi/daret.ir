import type { Group, Mesh } from "three";

import { useFrame } from "@react-three/fiber";
import { use, useRef } from "react";
import { MeshStandardMaterial, Path, Shape, Vector3 } from "three";

import { Backlight, Box, H, OpenContext, W } from "@/components/three/parts";

const stone = new MeshStandardMaterial({ color: "#8a857c", roughness: 0.95 });
const block = new MeshStandardMaterial({ color: "#77726a", roughness: 0.95 });
const oak = new MeshStandardMaterial({ color: "#6b4a2b", roughness: 0.85 });
const seam = new MeshStandardMaterial({ color: "#3a2715", roughness: 0.9 });
const iron = new MeshStandardMaterial({ color: "#2b2a28", metalness: 0.7, roughness: 0.5 });

const WALL_W = 1.4;
const WALL_TOP = 1.17;
const WALL_D = 0.3;
const FLOOR = -H / 2;
// The arch's center: a W-wide opening, H tall at its crown.
const ARCH_Y = H / 2 - W / 2;
const DROP = 1.52;
// Where the chains meet the bridge, measured up from its hinge, and where they go into the wall.
const CHAIN_AT = 1.35;
const CHAIN_X = 0.36;
const PULLEY: [x: number, y: number] = [0.62, 0.75];

const wall = new Shape()
  .moveTo(-WALL_W / 2, FLOOR)
  .lineTo(WALL_W / 2, FLOOR)
  .lineTo(WALL_W / 2, WALL_TOP)
  .lineTo(-WALL_W / 2, WALL_TOP);
wall.holes.push(
  new Path()
    .moveTo(-W / 2, FLOOR)
    .lineTo(-W / 2, ARCH_Y)
    .absarc(0, ARCH_Y, W / 2, Math.PI, 0, true)
    .lineTo(W / 2, FLOOR),
);
// The bridge is drawn from its hinge at the floor.
const BRIDGE_ARCH_Y = ARCH_Y - FLOOR;
const bridgeShape = new Shape()
  .moveTo(-(W - 0.01) / 2, 0)
  .lineTo((W - 0.01) / 2, 0)
  .lineTo((W - 0.01) / 2, BRIDGE_ARCH_Y)
  .absarc(0, BRIDGE_ARCH_Y, (W - 0.01) / 2, 0, Math.PI, false)
  .lineTo(-(W - 0.01) / 2, 0);

const SIDE_X = (WALL_W / 2 + W / 2) / 2;
const SIDE_W = WALL_W / 2 - W / 2 - 0.04;
const rows = Array.from({ length: 8 }, (_, i) => FLOOR + 0.1 + i * 0.2);
const voussoirs = Array.from({ length: 9 }, (_, i) => (i * Math.PI) / 8);
const merlons = [-0.6, -0.2, 0.2, 0.6];
const planks = [-0.3, -0.15, 0, 0.15, 0.3];
const bands = [0.35, 1.35];

const UP = new Vector3(0, 1, 0);
const from = new Vector3();
const to = new Vector3();

/** A chain from the wall to the end of the bridge, restretched every frame. */
function Chain({ dir }: { dir: -1 | 1 }) {
  const ref = useRef<Mesh>(null);
  const open = use(OpenContext);

  useFrame(() => {
    if (!ref.current) return;
    const angle = DROP * open.current;
    from.set(dir * PULLEY[0], PULLEY[1], 0.03);
    to.set(dir * CHAIN_X, FLOOR + CHAIN_AT * Math.cos(angle), CHAIN_AT * Math.sin(angle) + 0.01);
    ref.current.position.addVectors(from, to).multiplyScalar(0.5);
    ref.current.scale.y = from.distanceTo(to);
    ref.current.quaternion.setFromUnitVectors(UP, to.sub(from).normalize());
  });

  return (
    <mesh ref={ref} material={iron}>
      <boxGeometry args={[0.025, 1, 0.025]} />
    </mesh>
  );
}

/** Lowers toward the viewer around its bottom edge. */
function Bridge() {
  const ref = useRef<Group>(null);
  const open = use(OpenContext);

  useFrame(() => {
    if (ref.current) ref.current.rotation.x = DROP * open.current;
  });

  return (
    <group ref={ref} position={[0, FLOOR, 0]}>
      <mesh position={[0, 0, -0.07]} material={oak}>
        <extrudeGeometry args={[bridgeShape, { depth: 0.06, bevelEnabled: false, curveSegments: 32 }]} />
      </mesh>
      {planks.map((x) => (
        <Box key={x} size={[0.01, ARCH_Y - FLOOR, 0.004]} at={[x, (ARCH_Y - FLOOR) / 2, -0.009]} material={seam} />
      ))}
      {bands.map((y) => (
        <Box key={y} size={[W - 0.06, 0.05, 0.012]} at={[0, y, -0.005]} material={iron} />
      ))}
    </group>
  );
}

/** A castle gate: the drawbridge comes down on its chains, the light of the courtyard behind it. */
export function Castle() {
  return (
    <>
      <Backlight width={W} height={ARCH_Y - FLOOR} at={[0, (ARCH_Y + FLOOR) / 2, -0.2]} />
      <Backlight radius={W / 2} at={[0, ARCH_Y, -0.2]} />
      <mesh position={[0, 0, -WALL_D]} material={stone}>
        <extrudeGeometry args={[wall, { depth: WALL_D, bevelEnabled: false, curveSegments: 32 }]} />
      </mesh>
      {/* Stone courses on both sides of the gate */}
      {rows.map((y, i) =>
        [-1, 1].map((dir) => (
          <Box
            key={`${y}${dir}`}
            size={[SIDE_W - (i % 2) * 0.05, 0.17, 0.025]}
            at={[dir * (SIDE_X + (i % 2) * 0.02), y, 0.01]}
            material={(i + (dir > 0 ? 1 : 0)) % 2 ? block : stone}
          />
        )),
      )}
      {voussoirs.map((angle) => (
        <Box
          key={angle}
          size={[0.12, 0.13, 0.04]}
          at={[Math.cos(angle) * (W / 2 + 0.07), ARCH_Y + Math.sin(angle) * (W / 2 + 0.07), 0.015]}
          rotation={[0, 0, angle - Math.PI / 2]}
          material={block}
        />
      ))}
      {merlons.map((x) => (
        <Box key={x} size={[0.2, 0.16, WALL_D]} at={[x, WALL_TOP + 0.08, -WALL_D / 2]} material={stone} />
      ))}
      {[-1, 1].map((dir) => (
        <Box key={dir} size={[0.07, 0.07, 0.03]} at={[dir * PULLEY[0], PULLEY[1], 0.02]} material={iron} />
      ))}
      <Bridge />
      <Chain dir={-1} />
      <Chain dir={1} />
    </>
  );
}
