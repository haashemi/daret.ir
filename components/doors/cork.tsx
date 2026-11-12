import type { Group } from "three";

import { useFrame } from "@react-three/fiber";
import { use, useRef } from "react";
import { DoubleSide, MeshStandardMaterial, Vector2 } from "three";

import { Backlight, OpenContext, Tilt } from "@/components/three/parts";

const glass = new MeshStandardMaterial({
  color: "#dfeee8",
  metalness: 0.1,
  roughness: 0.04,
  transparent: true,
  opacity: 0.28,
  side: DoubleSide,
});
const cork = new MeshStandardMaterial({ color: "#c69a68", roughness: 0.95 });
const fleck = new MeshStandardMaterial({ color: "#7a5532", roughness: 1 });

// Built mouth to the viewer; `y` of each profile point runs from the mouth (0) to the base.
const R = 0.6;
const NECK = 0.3;
const profile = [
  [NECK + 0.035, 0],
  [NECK + 0.035, -0.05],
  [NECK, -0.07],
  [NECK, -0.45],
  [NECK + 0.1, -0.7],
  [R * 0.92, -0.95],
  [R, -1.1],
  [R, -1.9],
  [R - 0.05, -1.95],
  [0, -1.95],
].map(([r, y]) => new Vector2(r, y));
// Toward the viewer, the lathe's +y axis has to turn to +z.
const FACING: [number, number, number] = [Math.PI / 2, 0, 0];

// A tapered natural cork: wider where it sticks out of the mouth.
const CORK_FRONT = NECK + 0.03;
const CORK_BACK = NECK - 0.01;
const CORK_LENGTH = 0.5;
const CORK_OUT = 0.16;
// Darker pores scattered over the visible end: [angle, distance from the center, size].
const pores: [number, number, number][] = Array.from({ length: 34 }, (_, i) => [
  i * 2.4,
  Math.sqrt((i + 0.5) / 34) * (CORK_FRONT - 0.03),
  0.008 + ((i * 7) % 5) * 0.003,
]);

/** The cork pulls out of the neck and pops up and away when the door opens. */
function Stopper() {
  const ref = useRef<Group>(null);
  const open = use(OpenContext);

  useFrame(() => {
    if (!ref.current) return;
    const t = open.current;
    ref.current.position.set(t * t * 0.25, t * t * 1.05, t * (CORK_LENGTH - CORK_OUT + 0.1));
    ref.current.rotation.set(t * 0.9, 0, t * 0.8);
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0, CORK_OUT - CORK_LENGTH / 2]} rotation={FACING} material={cork}>
        <cylinderGeometry args={[CORK_FRONT, CORK_BACK, CORK_LENGTH, 64]} />
      </mesh>
      {pores.map(([angle, distance, size]) => (
        <mesh
          key={angle}
          position={[Math.cos(angle) * distance, Math.sin(angle) * distance, CORK_OUT + 0.001]}
          material={fleck}
        >
          <circleGeometry args={[size, 12]} />
        </mesh>
      ))}
    </group>
  );
}

/** «در چوب‌پنبه»: a clear glass bottle, its cork for a door. Seen from above, it turns to face you as it opens. */
export function Cork() {
  return (
    <Tilt>
      {/* Scaled to fit the frame at an angle, and centered on the pivot: the base is ~2m back */}
      <group scale={0.72} position={[0, 0, 0.65]}>
        <Backlight radius={NECK - 0.01} at={[0, 0, -0.5]} />
        <mesh rotation={FACING} material={glass}>
          <latheGeometry args={[profile, 96]} />
        </mesh>
        <Stopper />
      </group>
    </Tilt>
  );
}
