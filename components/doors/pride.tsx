import { MeshPhysicalMaterial, MeshStandardMaterial, Path, Shape } from "three";

import { Backlight, Box, Cylinder, Frame, H, Hinge, W } from "@/components/three/parts";

// Glossy white with a clear coat, like most Prides on the road.
const paint = new MeshPhysicalMaterial({
  color: "#ecebe6",
  metalness: 0.15,
  roughness: 0.35,
  clearcoat: 1,
  clearcoatRoughness: 0.08,
});
const crease = new MeshStandardMaterial({ color: "#c9c8c2", roughness: 0.5 });
const sash = new MeshStandardMaterial({ color: "#151515", roughness: 0.55 });
const rubber = new MeshStandardMaterial({ color: "#1b1b1b", roughness: 0.9 });
const glass = new MeshPhysicalMaterial({
  color: "#2b3b42",
  roughness: 0.03,
  metalness: 0.2,
  transparent: true,
  opacity: 0.5,
});
const chrome = new MeshStandardMaterial({ color: "#d9dde2", metalness: 1, roughness: 0.15 });
const rust = new MeshStandardMaterial({ color: "#8a4a1c", roughness: 1 });
const blue = new MeshStandardMaterial({ color: "#1f4fa8", roughness: 0.5 });
const plate = new MeshStandardMaterial({ color: "#f4f4f0", roughness: 0.4 });
const ink = new MeshStandardMaterial({ color: "#222222", roughness: 0.6 });
const block = new MeshStandardMaterial({ color: "#6d6a63", roughness: 0.9 });

// Leaf coordinates: `x` from the hinge (front of the car) to the latch (rear), `y` centered on the opening.
const BOTTOM = -(H - 0.01) / 2;
const TOP = (H - 0.01) / 2;
const FRONT = 0.005;
const REAR = W - 0.005;
// Belt line: painted body below, the black window sash above.
const BELT = 0.12;
// The A-pillar rakes back from the belt; the sash rounds off at the top rear corner.
const RAKE = 0.3;
const CORNER = 0.14;
const SASH = 0.05;

const body = new Shape()
  .moveTo(FRONT, BOTTOM + 0.1)
  .quadraticCurveTo(FRONT, BOTTOM, FRONT + 0.1, BOTTOM)
  .lineTo(REAR - 0.06, BOTTOM)
  .quadraticCurveTo(REAR, BOTTOM, REAR, BOTTOM + 0.06)
  .lineTo(REAR, BELT)
  .lineTo(FRONT, BELT)
  .closePath();

/** The window opening (or the sash around it, grown by `grow`). */
function windowOutline(grow: number) {
  return new Path()
    .moveTo(FRONT + SASH * 1.4 - grow, BELT)
    .lineTo(RAKE + SASH * 0.6 - grow, TOP - SASH + grow)
    .lineTo(REAR - SASH - CORNER + grow, TOP - SASH + grow)
    .quadraticCurveTo(REAR - SASH + grow, TOP - SASH + grow, REAR - SASH + grow, TOP - SASH - CORNER - grow)
    .lineTo(REAR - SASH + grow, BELT)
    .closePath();
}

const frame = new Shape(windowOutline(SASH).getPoints());
frame.holes.push(windowOutline(0));
const pane = new Shape(windowOutline(0).getPoints());
// The black sail that carries the mirror, filling the corner between the belt and the A-pillar.
const sail = new Shape()
  .moveTo(FRONT + SASH * 1.4, BELT)
  .lineTo(FRONT + SASH * 1.4 + 0.07, BELT + 0.17)
  .lineTo(FRONT + SASH * 1.4 + 0.15, BELT)
  .closePath();

const spots: [x: number, y: number, r: number][] = [
  [0.2, -0.88, 0.06],
  [0.29, -0.83, 0.03],
  [0.74, -0.94, 0.04],
  [0.84, -0.06, 0.022],
];

const flat = { depth: 0.045, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 3 };

/** A Pride's front door, repurposed as a front door: rust, a dent's worth of character and a plate for the number. */
export function Pride() {
  return (
    <>
      <Backlight />
      <Frame material={block} size={0.1} />
      <Hinge at={[-W / 2, 0, 0.03]}>
        <group position={[0, 0, -0.055]}>
          <mesh material={paint}>
            <extrudeGeometry args={[body, flat]} />
          </mesh>
          <mesh material={sash}>
            <extrudeGeometry args={[frame, { depth: 0.035, bevelEnabled: false }]} />
          </mesh>
          <mesh material={sash}>
            <extrudeGeometry args={[sail, { depth: 0.04, bevelEnabled: false }]} />
          </mesh>
          <mesh position={[0, 0, 0.012]} material={glass}>
            <shapeGeometry args={[pane]} />
          </mesh>
        </group>
        {/* Belt molding along the bottom of the window */}
        <Box size={[REAR - FRONT - 0.04, 0.025, 0.018]} at={[W / 2, BELT, 0.002]} material={rubber} />
        <Box size={[REAR - FRONT - 0.06, 0.006, 0.004]} at={[W / 2, BELT + 0.008, 0.012]} material={chrome} />
        {/* Mirror on the sail: a short arm and a rounded black housing */}
        <Box size={[0.03, 0.03, 0.07]} at={[0.15, BELT + 0.07, 0.02]} material={sash} />
        <group position={[0.15, BELT + 0.1, 0.09]}>
          <Box size={[0.17, 0.1, 0.05]} material={sash} />
          <Cylinder radius={0.05} height={0.05} at={[-0.085, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={sash} />
        </group>
        {/* Body crease running the length of the door */}
        <Box size={[REAR - FRONT - 0.06, 0.006, 0.004]} at={[W / 2, -0.12, 0.002]} material={crease} />
        {/* Pull handle in a black recess, key cylinder behind it */}
        <group position={[W - 0.17, -0.02, 0]}>
          <Box size={[0.17, 0.06, 0.006]} at={[0, 0, 0.002]} material={rubber} />
          <Box size={[0.13, 0.02, 0.016]} at={[0, -0.005, 0.01]} material={rubber} />
          <Cylinder
            radius={0.016}
            height={0.012}
            at={[0.12, 0, 0.005]}
            rotation={[Math.PI / 2, 0, 0]}
            material={chrome}
          />
          <Box size={[0.004, 0.016, 0.004]} at={[0.12, 0, 0.012]} material={ink} />
        </group>
        {/* Rubber side strip that never stopped the dents */}
        <Box size={[REAR - FRONT - 0.02, 0.045, 0.016]} at={[W / 2, -0.38, 0.004]} material={rubber} />
        {spots.map(([x, y, r]) => (
          <Cylinder
            key={x}
            radius={r}
            height={0.004}
            at={[x, y, 0.002]}
            rotation={[Math.PI / 2, 0, 0]}
            material={rust}
          />
        ))}
        {/* An Iranian plate as the house number: blue band on the left, region box on the right */}
        <group position={[W / 2, -0.6, 0.005]}>
          <Box size={[0.4, 0.09, 0.008]} material={plate} />
          <Box size={[0.045, 0.09, 0.009]} at={[-0.1775, 0, 0]} material={blue} />
          <Box size={[0.004, 0.08, 0.009]} at={[0.12, 0, 0]} material={ink} />
          {[-0.09, -0.03, 0.03, 0.08, 0.155].map((x) => (
            <Box key={x} size={[0.02, 0.045, 0.009]} at={[x, 0, 0.001]} material={ink} />
          ))}
        </group>
      </Hinge>
    </>
  );
}
