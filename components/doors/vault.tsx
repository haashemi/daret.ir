import type { Group } from "three";

import { useFrame } from "@react-three/fiber";
import { use, useRef } from "react";
import { MeshStandardMaterial, Path, Shape } from "three";

import { Backlight, Box, Cylinder, H, Hinge, OpenContext, Sphere, W } from "@/components/three/parts";

const plate = new MeshStandardMaterial({ color: "#3d4147", metalness: 0.9, roughness: 0.45 });
const steel = new MeshStandardMaterial({ color: "#a3a9b0", metalness: 0.8, roughness: 0.35 });
const chrome = new MeshStandardMaterial({ color: "#e3e6ea", metalness: 1, roughness: 0.12 });

const RADIUS = 0.45;
const CENTER_Y = 0.1;
const PLATE_W = W + 0.16;
const PLATE_H = H + 0.08;

// A steel wall slab with a round hole for the door.
const wall = new Shape()
  .moveTo(-PLATE_W / 2, -H / 2)
  .lineTo(PLATE_W / 2, -H / 2)
  .lineTo(PLATE_W / 2, PLATE_H - H / 2)
  .lineTo(-PLATE_W / 2, PLATE_H - H / 2)
  .closePath();
wall.holes.push(new Path().absarc(0, CENTER_Y, RADIUS + 0.01, 0, Math.PI * 2, true));

const bolts = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2);

/** The wheel spins a turn as the door opens. */
function Wheel() {
  const ref = useRef<Group>(null);
  const open = use(OpenContext);

  useFrame(() => {
    if (ref.current) ref.current.rotation.z = open.current * Math.PI * 2;
  });

  return (
    <group ref={ref} position={[RADIUS, 0, 0.17]}>
      <mesh material={chrome}>
        <torusGeometry args={[0.12, 0.012, 12, 48]} />
      </mesh>
      {[0, Math.PI / 3, (Math.PI * 2) / 3].map((angle) => (
        <group key={angle} rotation={[0, 0, angle]}>
          <Box size={[0.34, 0.016, 0.016]} material={chrome} />
          <Sphere radius={0.02} at={[0.17, 0, 0]} material={chrome} />
          <Sphere radius={0.02} at={[-0.17, 0, 0]} material={chrome} />
        </group>
      ))}
      <Cylinder radius={0.035} height={0.05} at={[0, 0, -0.03]} rotation={[Math.PI / 2, 0, 0]} material={chrome} />
    </group>
  );
}

/** A round bank-vault door set in a steel wall, with locking bolts and a spoked wheel. */
export function Vault() {
  return (
    <>
      <Backlight radius={RADIUS} at={[0, CENTER_Y, -0.09]} />
      <mesh position={[0, 0, -0.1]} material={plate}>
        <extrudeGeometry args={[wall, { depth: 0.2, bevelEnabled: false, curveSegments: 48 }]} />
      </mesh>
      <Cylinder radius={0.03} height={0.55} at={[-RADIUS - 0.03, CENTER_Y, 0.14]} material={steel} />
      <Hinge at={[-RADIUS, CENTER_Y, 0.13]} angle={1.6}>
        <Cylinder radius={RADIUS} height={0.2} at={[RADIUS, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]} material={steel} />
        <mesh position={[RADIUS, 0, 0.001]} material={plate}>
          <torusGeometry args={[0.36, 0.01, 8, 64]} />
        </mesh>
        {bolts.map((angle) => (
          <Cylinder
            key={angle}
            radius={0.018}
            height={0.02}
            at={[RADIUS + Math.cos(angle) * 0.4, Math.sin(angle) * 0.4, 0.008]}
            rotation={[Math.PI / 2, 0, 0]}
            material={chrome}
          />
        ))}
        <Wheel />
        {/* Combination dial */}
        <Cylinder
          radius={0.045}
          height={0.03}
          at={[RADIUS + 0.2, 0.2, 0.015]}
          rotation={[Math.PI / 2, 0, 0]}
          material={plate}
        />
      </Hinge>
    </>
  );
}
