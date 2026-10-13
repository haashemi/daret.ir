import { MeshStandardMaterial, Path, Shape } from "three";

import { Backlight, Box, Cylinder, H, Hinge } from "@/components/three/parts";

const enamel = new MeshStandardMaterial({ color: "#f1efea", roughness: 0.3, metalness: 0.05 });
const fascia = new MeshStandardMaterial({ color: "#d9dcdf", roughness: 0.4 });
const gasket = new MeshStandardMaterial({ color: "#3b3e42", roughness: 0.8 });
const chrome = new MeshStandardMaterial({ color: "#c9ced3", metalness: 1, roughness: 0.2 });
const glass = new MeshStandardMaterial({ color: "#b8d4e0", roughness: 0.05, transparent: true, opacity: 0.35 });
const sock = new MeshStandardMaterial({ color: "#c62828", roughness: 0.9 });
const display = new MeshStandardMaterial({
  color: "#7dff9a",
  emissive: "#7dff9a",
  emissiveIntensity: 1.4,
  toneMapped: false,
});

// Modeled at real size with the floor at y = 0, then scaled up to door size.
const SCALE = 2;
const MW = 0.6;
const MH = 0.85;
const MD = 0.55;
const R = 0.19;
const DOOR_Y = 0.36;

const front = new Shape()
  .moveTo(-MW / 2, 0)
  .lineTo(MW / 2, 0)
  .lineTo(MW / 2, MH)
  .lineTo(-MW / 2, MH);
front.holes.push(new Path().absarc(0, DOOR_Y, R + 0.01, 0, Math.PI * 2, true));

/** A front-loading washing machine, door-sized, with the one lost sock still inside. */
export function WashingMachine() {
  return (
    <group position={[0, -H / 2, 0]} scale={SCALE}>
      <Backlight radius={R + 0.01} at={[0, DOOR_Y, -0.03]} />
      <mesh position={[0, 0, -0.02]} material={enamel}>
        <extrudeGeometry args={[front, { depth: 0.02, bevelEnabled: false, curveSegments: 48 }]} />
      </mesh>
      <Box size={[MW, MH, MD]} at={[0, MH / 2, -0.04 - MD / 2]} material={enamel} />
      <mesh position={[0, DOOR_Y, -0.005]} material={gasket}>
        <torusGeometry args={[R + 0.005, 0.02, 12, 48]} />
      </mesh>
      {/* Lost sock */}
      <Box size={[0.1, 0.035, 0.01]} at={[-0.02, DOOR_Y - 0.12, -0.02]} rotation={[0, 0, 0.3]} material={sock} />
      <Box size={[0.035, 0.07, 0.01]} at={[0.04, DOOR_Y - 0.09, -0.02]} rotation={[0, 0, 0.3]} material={sock} />
      {/* Control panel */}
      <Box size={[MW, 0.12, 0.01]} at={[0, MH - 0.07, 0.005]} material={fascia} />
      <Box size={[0.18, 0.07, 0.02]} at={[-0.18, MH - 0.07, 0.015]} material={enamel} />
      <Box size={[0.12, 0.04, 0.004]} at={[0.02, MH - 0.07, 0.012]} material={display} />
      <Cylinder
        radius={0.04}
        height={0.03}
        at={[0.19, MH - 0.07, 0.02]}
        rotation={[Math.PI / 2, 0, 0]}
        material={chrome}
      />
      <Box size={[MW - 0.02, 0.04, 0.02]} at={[0, 0.02, 0.005]} material={gasket} />
      <Hinge at={[-R - 0.05, DOOR_Y, 0]}>
        <Box size={[0.05, 0.1, 0.02]} at={[0.02, 0, 0.02]} material={chrome} />
        <mesh position={[R + 0.05, 0, 0.04]} material={chrome}>
          <torusGeometry args={[R + 0.02, 0.035, 16, 48]} />
        </mesh>
        <Cylinder
          radius={R + 0.01}
          height={0.03}
          at={[R + 0.05, 0, 0.03]}
          rotation={[Math.PI / 2, 0, 0]}
          material={glass}
        />
        <Box size={[0.03, 0.1, 0.03]} at={[2 * R + 0.1, 0, 0.04]} material={gasket} />
      </Hinge>
    </group>
  );
}
