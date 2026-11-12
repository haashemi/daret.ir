import type { Group } from "three";

import { useFrame } from "@react-three/fiber";
import { use, useRef } from "react";
import { DoubleSide, MeshStandardMaterial, Vector2 } from "three";

import { Backlight, Box, OpenContext, Tilt } from "@/components/three/parts";

const plastic = new MeshStandardMaterial({
  color: "#cfe9f7",
  roughness: 0.04,
  metalness: 0.1,
  transparent: true,
  opacity: 0.32,
  side: DoubleSide,
});
const water = new MeshStandardMaterial({
  color: "#7cc4ec",
  roughness: 0.1,
  transparent: true,
  opacity: 0.22,
  depthWrite: false,
});
const cap = new MeshStandardMaterial({ color: "#1f6fd1", roughness: 0.4 });
const label = new MeshStandardMaterial({ color: "#2a9bd8", roughness: 0.6, side: DoubleSide });

// Built standing up along +y: the mouth at `y = 0`, the base at `y = -LENGTH`.
const R = 0.42;
const NECK = 0.2;
const LENGTH = 1.7;
const profile = [
  [NECK, 0.02],
  [NECK, -0.12],
  [NECK + 0.05, -0.13],
  [NECK + 0.05, -0.15],
  [NECK, -0.16],
  [NECK + 0.02, -0.22],
  [R * 0.8, -0.4],
  [R, -0.58],
  [R, -0.8],
  [R - 0.025, -0.84],
  [R, -0.88],
  [R, -1.6],
  [R - 0.08, -LENGTH + 0.01],
  [0, -LENGTH],
].map(([r, y]) => new Vector2(r, y));

const CAP_R = NECK + 0.025;
const CAP_DEPTH = 0.13;
const ridges = Array.from({ length: 48 }, (_, i) => (i / 48) * Math.PI * 2);

/** The cap unscrews as the door opens, then lifts off the mouth. In the bottle's frame, `+y` is out of the mouth. */
function Cap() {
  const ref = useRef<Group>(null);
  const open = use(OpenContext);

  useFrame(() => {
    if (!ref.current) return;
    const t = open.current;
    ref.current.rotation.set(-t * 0.6, t * Math.PI * 4, 0);
    // Out of the mouth, then up the screen (local `-z` once the bottle faces the viewer).
    ref.current.position.set(0, t * 0.3, -t * t * 0.55);
  });

  return (
    <group ref={ref}>
      <mesh position={[0, -CAP_DEPTH / 2 + 0.02, 0]} material={cap}>
        <cylinderGeometry args={[CAP_R, CAP_R, CAP_DEPTH, 64]} />
      </mesh>
      {ridges.map((angle) => (
        <Box
          key={angle}
          size={[0.012, CAP_DEPTH - 0.02, 0.012]}
          at={[Math.cos(angle) * CAP_R, -CAP_DEPTH / 2 + 0.02, Math.sin(angle) * CAP_R]}
          rotation={[0, -angle, 0]}
          material={cap}
        />
      ))}
    </group>
  );
}

/** «در پیچی»: a plastic water bottle whose screw cap is the door. Seen from above, it turns to face you as it opens. */
export function WaterBottle() {
  // Laid mouth to the viewer and pivoting around its middle, so it stays framed while it turns.
  return (
    <Tilt>
      <group rotation={[Math.PI / 2, 0, 0]} position={[0, 0, LENGTH / 2]}>
        {/* The light inside the neck, facing out of the mouth */}
        <group rotation={[-Math.PI / 2, 0, 0]}>
          <Backlight radius={NECK - 0.01} at={[0, 0, -0.25]} />
        </group>
        <mesh material={plastic}>
          <latheGeometry args={[profile, 96]} />
        </mesh>
        {/* Water up to the shoulder */}
        <mesh position={[0, -1.18, 0]} material={water}>
          <cylinderGeometry args={[R - 0.02, R - 0.02, 0.98, 64]} />
        </mesh>
        {/* Threads on the neck, seen once the cap is off */}
        {[-0.03, -0.07].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={plastic}>
            <torusGeometry args={[NECK, 0.01, 8, 64]} />
          </mesh>
        ))}
        <mesh position={[0, -1.15, 0]} material={label}>
          <cylinderGeometry args={[R + 0.004, R + 0.004, 0.36, 96, 1, true]} />
        </mesh>
        <Cap />
      </group>
    </Tilt>
  );
}
