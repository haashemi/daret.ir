import { MeshStandardMaterial } from "three";

import { Backlight, Box, Cylinder, H, Hinge, Sphere } from "@/components/three/parts";

const green = new MeshStandardMaterial({ color: "#2c5a36", roughness: 0.6 });
const groove = new MeshStandardMaterial({ color: "#1d3d24", roughness: 0.7 });
const wood = new MeshStandardMaterial({ color: "#5e4027", roughness: 0.85 });
const brass = new MeshStandardMaterial({ color: "#e0b860", metalness: 0.85, roughness: 0.3 });
const iron = new MeshStandardMaterial({ color: "#26231f", metalness: 0.7, roughness: 0.5 });

const RADIUS = 0.6;
const RIM = 0.07;
// Round, and resting on the floor.
const CENTER_Y = -H / 2 + RADIUS + RIM;

/** A round green door in a round timber frame, with the knob dead center. */
export function Hobbit() {
  return (
    <group position={[0, CENTER_Y, 0]}>
      <Backlight radius={RADIUS} />
      <mesh material={wood}>
        <torusGeometry args={[RADIUS + RIM / 2, RIM, 16, 64]} />
      </mesh>
      <Hinge at={[-RADIUS, 0, 0.03]}>
        <Cylinder
          radius={RADIUS - 0.01}
          height={0.06}
          at={[RADIUS, 0, -0.03]}
          rotation={[Math.PI / 2, 0, 0]}
          material={green}
        />
        {[0.42, 0.25].map((radius) => (
          <mesh key={radius} position={[RADIUS, 0, 0.001]} material={groove}>
            <torusGeometry args={[radius, 0.006, 8, 64]} />
          </mesh>
        ))}
        {/* Iron hinge straps */}
        {[0.3, -0.3].map((y) => (
          <Box key={y} size={[0.36, 0.035, 0.01]} at={[0.18 + Math.abs(y) * 0.2, y, 0.004]} material={iron} />
        ))}
        <Cylinder radius={0.03} height={0.02} at={[RADIUS, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]} material={brass} />
        <Sphere radius={0.045} at={[RADIUS, 0, 0.05]} material={brass} />
      </Hinge>
    </group>
  );
}
