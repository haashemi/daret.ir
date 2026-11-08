import type { Group } from "three";

import { useFrame } from "@react-three/fiber";
import { use, useRef } from "react";
import { DoubleSide, MeshStandardMaterial } from "three";

import { Backlight, Box, Cylinder, H, OpenContext, Sphere } from "@/components/three/parts";

const steel = new MeshStandardMaterial({ color: "#c4c9ce", metalness: 1, roughness: 0.22, side: DoubleSide });
const bakelite = new MeshStandardMaterial({ color: "#1c1b1a", roughness: 0.45 });
const tahdig = new MeshStandardMaterial({ color: "#d39a3a", roughness: 0.75 });
const steam = new MeshStandardMaterial({ color: "#ffffff", roughness: 1, transparent: true, opacity: 0.35 });

// The pot lies on its side, mouth to the viewer.
const R = 0.6;
const DEPTH = 0.75;
const CENTER_Y = -H / 2 + R;
// The lid is a shallow dome slightly wider than the rim.
const LID_R = R + 0.02;
const DOME = 0.09;
const SPHERE_R = (LID_R ** 2 + DOME ** 2) / (2 * DOME);
const DOME_ANGLE = Math.asin(LID_R / SPHERE_R);
const puffs: [x: number, y: number, r: number][] = [
  [-0.12, 0.12, 0.09],
  [0.08, 0.26, 0.12],
  [-0.04, 0.44, 0.1],
];

/** The lid tips up from its top edge, like someone peeking at the rice. */
function Lid() {
  const ref = useRef<Group>(null);
  const open = use(OpenContext);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.x = -1.35 * open.current;
    ref.current.position.y = LID_R + 0.1 * open.current;
  });

  return (
    <group ref={ref} position={[0, LID_R, 0.03]}>
      <group position={[0, -LID_R, 0]}>
        <mesh position={[0, 0, DOME - SPHERE_R]} rotation={[Math.PI / 2, 0, 0]} material={steel}>
          <sphereGeometry args={[SPHERE_R, 64, 8, 0, Math.PI * 2, 0, DOME_ANGLE]} />
        </mesh>
        <mesh material={steel}>
          <torusGeometry args={[LID_R, 0.014, 8, 64]} />
        </mesh>
        <Cylinder
          radius={0.03}
          height={0.06}
          at={[0, 0, DOME + 0.03]}
          rotation={[Math.PI / 2, 0, 0]}
          material={steel}
        />
        <Sphere radius={0.06} at={[0, 0, DOME + 0.09]} material={bakelite} />
      </group>
    </group>
  );
}

/** Steam that only shows once the lid is off. */
function Steam() {
  const ref = useRef<Group>(null);
  const open = use(OpenContext);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.scale.setScalar(open.current);
    ref.current.position.y = R + 0.05 + Math.sin(clock.elapsedTime * 1.5) * 0.02;
  });

  return (
    <group ref={ref} position={[0, R, 0.25]}>
      {puffs.map(([x, y, r]) => (
        <Sphere key={y} radius={r} at={[x, y, 0]} material={steam} />
      ))}
    </group>
  );
}

/** «در» also means lid: a steel pot on its side, golden tahdig stuck to the bottom and the light past it. */
export function Pot() {
  return (
    <group position={[0, CENTER_Y, 0]}>
      <Backlight radius={R - 0.01} at={[0, 0, -DEPTH + 0.01]} />
      <mesh position={[0, 0, -DEPTH / 2]} rotation={[Math.PI / 2, 0, 0]} material={steel}>
        <cylinderGeometry args={[R, R, DEPTH, 64, 1, true]} />
      </mesh>
      <Cylinder radius={R} height={0.01} at={[0, 0, -DEPTH - 0.005]} rotation={[Math.PI / 2, 0, 0]} material={steel} />
      <mesh position={[0, 0, -DEPTH + 0.03]} material={tahdig}>
        <torusGeometry args={[R - 0.06, 0.055, 12, 64]} />
      </mesh>
      {/* Rolled rim */}
      <mesh material={steel}>
        <torusGeometry args={[R, 0.02, 12, 64]} />
      </mesh>
      {/* Side handles */}
      {[-1, 1].map((dir) => (
        <group key={dir} position={[dir * R, 0, -0.2]}>
          <Box size={[0.06, 0.05, 0.05]} at={[dir * 0.03, 0.09, 0]} material={steel} />
          <Box size={[0.06, 0.05, 0.05]} at={[dir * 0.03, -0.09, 0]} material={steel} />
          <Box size={[0.04, 0.26, 0.06]} at={[dir * 0.08, 0, 0]} material={bakelite} />
        </group>
      ))}
      <Lid />
      <Steam />
    </group>
  );
}
