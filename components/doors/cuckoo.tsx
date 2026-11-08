import type { Group } from "three";

import { useFrame } from "@react-three/fiber";
import { use, useRef } from "react";
import { MeshStandardMaterial, Shape } from "three";

import { Backlight, Box, Cylinder, Hinge, OpenContext, Slide, Sphere } from "@/components/three/parts";

const wood = new MeshStandardMaterial({ color: "#5a3820", roughness: 0.75 });
const dark = new MeshStandardMaterial({ color: "#2f1c0f", roughness: 0.8 });
const dial = new MeshStandardMaterial({ color: "#efe4c8", roughness: 0.6 });
const ink = new MeshStandardMaterial({ color: "#1b1712", roughness: 0.5 });
const brass = new MeshStandardMaterial({ color: "#e0b860", metalness: 0.85, roughness: 0.3 });
const leaf = new MeshStandardMaterial({ color: "#3d5a2a", roughness: 0.7 });
const feathers = new MeshStandardMaterial({ color: "#7a5230", roughness: 0.8 });
const beak = new MeshStandardMaterial({ color: "#f0a020", roughness: 0.5 });

// The clock case, hanging on the wall.
const CW = 0.8;
const BOTTOM = -0.2;
const TOP = 0.8;
const DEPTH = 0.3;
const APEX = 1.14;
const PITCH = Math.atan2(APEX - TOP, CW / 2);
// The bird's door, above the dial.
const DOOR_W = 0.22;
const DOOR_H = 0.2;
const DOOR_Y = 0.62;
const DIAL_Y = 0.17;
const DIAL_R = 0.26;
const ticks = Array.from({ length: 12 }, (_, i) => i);

const gable = new Shape()
  .moveTo(-CW / 2, TOP)
  .lineTo(CW / 2, TOP)
  .lineTo(0, APEX)
  .lineTo(-CW / 2, TOP);

/** Always swinging, open or not. */
function Pendulum() {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = 0.18 * Math.sin(clock.elapsedTime * Math.PI);
  });

  return (
    <group ref={ref} position={[0, BOTTOM, 0.03]}>
      <Box size={[0.015, 0.55, 0.008]} at={[0, -0.275, 0]} material={brass} />
      <Cylinder radius={0.085} height={0.015} at={[0, -0.6, 0]} rotation={[Math.PI / 2, 0, 0]} material={brass} />
    </group>
  );
}

/** The hands run fast as the door opens, the hour striking. */
function Hands() {
  const minuteRef = useRef<Group>(null);
  const hourRef = useRef<Group>(null);
  const open = use(OpenContext);

  useFrame(() => {
    if (minuteRef.current) minuteRef.current.rotation.z = -0.6 - open.current * Math.PI * 4;
    if (hourRef.current) hourRef.current.rotation.z = 1.2 - (open.current * Math.PI) / 3;
  });

  return (
    <group position={[0, DIAL_Y, 0.035]}>
      <group ref={minuteRef}>
        <Box size={[0.014, 0.2, 0.005]} at={[0, 0.09, 0]} material={ink} />
      </group>
      <group ref={hourRef}>
        <Box size={[0.022, 0.13, 0.005]} at={[0, 0.055, 0.005]} material={ink} />
      </group>
      <Sphere radius={0.016} at={[0, 0, 0.008]} material={brass} />
    </group>
  );
}

/** A Black Forest cuckoo clock, people-sized. The only door that opens is the bird's. */
export function Cuckoo() {
  const sideW = (CW - DOOR_W) / 2;
  const belowH = DOOR_Y - DOOR_H / 2 - BOTTOM;
  const aboveH = TOP - DOOR_Y - DOOR_H / 2;

  return (
    <>
      <Backlight width={DOOR_W} height={DOOR_H} at={[0, DOOR_Y, -0.2]} />
      {/* Hollow case: walls and back, then the front built around the bird's door */}
      <group position={[0, 0, -0.03 - DEPTH / 2]}>
        <Box size={[0.03, TOP - BOTTOM, DEPTH]} at={[-CW / 2 + 0.015, (TOP + BOTTOM) / 2, 0]} material={wood} />
        <Box size={[0.03, TOP - BOTTOM, DEPTH]} at={[CW / 2 - 0.015, (TOP + BOTTOM) / 2, 0]} material={wood} />
        <Box size={[CW, 0.03, DEPTH]} at={[0, BOTTOM + 0.015, 0]} material={wood} />
        <Box size={[CW, 0.03, DEPTH]} at={[0, TOP - 0.015, 0]} material={wood} />
        <Box size={[CW, TOP - BOTTOM, 0.03]} at={[0, (TOP + BOTTOM) / 2, -DEPTH / 2]} material={wood} />
      </group>
      <group position={[0, 0, -0.015]}>
        <Box size={[sideW, TOP - BOTTOM, 0.03]} at={[-CW / 2 + sideW / 2, (TOP + BOTTOM) / 2, 0]} material={wood} />
        <Box size={[sideW, TOP - BOTTOM, 0.03]} at={[CW / 2 - sideW / 2, (TOP + BOTTOM) / 2, 0]} material={wood} />
        <Box size={[DOOR_W, belowH, 0.03]} at={[0, BOTTOM + belowH / 2, 0]} material={wood} />
        <Box size={[DOOR_W, aboveH, 0.03]} at={[0, TOP - aboveH / 2, 0]} material={wood} />
      </group>
      {/* Gable and roof */}
      {[0, -0.03 - DEPTH].map((z) => (
        <mesh key={z} position={[0, 0, z - 0.03]} material={wood}>
          <extrudeGeometry args={[gable, { depth: 0.03, bevelEnabled: false }]} />
        </mesh>
      ))}
      {[-1, 1].map((dir) => (
        <Box
          key={dir}
          size={[0.62, 0.04, DEPTH + 0.14]}
          at={[dir * (CW / 4 + 0.013), (TOP + APEX) / 2 + 0.015, -0.03 - DEPTH / 2]}
          rotation={[0, 0, -dir * PITCH]}
          material={dark}
        />
      ))}
      {[-0.08, 0, 0.08].map((x) => (
        <mesh key={x} position={[x, APEX + 0.08 - Math.abs(x) * 0.6, 0.01]} scale={[1, 1.6, 0.35]} material={leaf}>
          <sphereGeometry args={[0.05, 12, 8]} />
        </mesh>
      ))}
      {/* Dial */}
      <Cylinder radius={DIAL_R} height={0.02} at={[0, DIAL_Y, 0.01]} rotation={[Math.PI / 2, 0, 0]} material={dial} />
      <mesh position={[0, DIAL_Y, 0.02]} material={dark}>
        <torusGeometry args={[DIAL_R + 0.01, 0.018, 8, 48]} />
      </mesh>
      {ticks.map((hour) => {
        const angle = (hour * Math.PI) / 6;
        return (
          <Box
            key={hour}
            size={[0.012, hour % 3 ? 0.03 : 0.05, 0.004]}
            at={[Math.sin(angle) * 0.21, DIAL_Y + Math.cos(angle) * 0.21, 0.022]}
            rotation={[0, 0, -angle]}
            material={ink}
          />
        );
      })}
      <Hands />
      {/* The bird, on its perch */}
      <Slide by={[0, 0, 0.2]}>
        <group position={[0, DOOR_Y - 0.04, -0.1]}>
          <Box size={[0.012, 0.012, 0.16]} at={[0, -0.05, -0.02]} material={dark} />
          <mesh scale={[1, 0.9, 1.3]} material={feathers}>
            <sphereGeometry args={[0.045, 16, 12]} />
          </mesh>
          <Sphere radius={0.032} at={[0, 0.05, 0.035]} material={feathers} />
          <mesh position={[0, 0.05, 0.08]} rotation={[Math.PI / 2, 0, 0]} material={beak}>
            <coneGeometry args={[0.012, 0.035, 8]} />
          </mesh>
          {[-1, 1].map((dir) => (
            <Sphere key={dir} radius={0.006} at={[dir * 0.018, 0.062, 0.06]} material={ink} />
          ))}
        </group>
      </Slide>
      <Hinge at={[-DOOR_W / 2, DOOR_Y, 0]} angle={1.8}>
        <Box size={[DOOR_W / 2 - 0.004, DOOR_H - 0.006, 0.012]} at={[DOOR_W / 4, 0, 0.006]} material={dark} />
        <Sphere radius={0.008} at={[DOOR_W / 2 - 0.02, 0, 0.016]} material={brass} />
      </Hinge>
      <Hinge at={[DOOR_W / 2, DOOR_Y, 0]} side="right" angle={1.8}>
        <Box size={[DOOR_W / 2 - 0.004, DOOR_H - 0.006, 0.012]} at={[-DOOR_W / 4, 0, 0.006]} material={dark} />
        <Sphere radius={0.008} at={[-DOOR_W / 2 + 0.02, 0, 0.016]} material={brass} />
      </Hinge>
      {/* Weights on their chains */}
      {(
        [
          [-0.3, 0.32],
          [0.3, 0.52],
        ] as const
      ).map(([x, chain]) => (
        <group key={x} position={[x, BOTTOM, 0]}>
          <Cylinder radius={0.005} height={chain} at={[0, -chain / 2, 0]} material={brass} />
          <mesh position={[0, -chain - 0.1, 0]} scale={[1, 2.2, 1]} material={dark}>
            <sphereGeometry args={[0.045, 12, 10]} />
          </mesh>
        </group>
      ))}
      <Pendulum />
    </>
  );
}
