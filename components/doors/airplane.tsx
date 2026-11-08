import type { Group } from "three";

import { useFrame } from "@react-three/fiber";
import { use, useRef } from "react";
import { MeshStandardMaterial, Path, Shape } from "three";

import { Backlight, Box, Cylinder, OpenContext } from "@/components/three/parts";

const skin = new MeshStandardMaterial({ color: "#eef0f2", roughness: 0.35, metalness: 0.15 });
const leaf = new MeshStandardMaterial({ color: "#e2e5e8", roughness: 0.4, metalness: 0.15 });
const trim = new MeshStandardMaterial({ color: "#9aa1a8", metalness: 0.8, roughness: 0.35 });
const cheatline = new MeshStandardMaterial({ color: "#1f4e8c", roughness: 0.4 });
const stripe = new MeshStandardMaterial({ color: "#c8202b", roughness: 0.4 });
const porthole = new MeshStandardMaterial({ color: "#20262d", roughness: 0.1, metalness: 0.4 });
const exit = new MeshStandardMaterial({
  color: "#ff4b4b",
  emissive: "#ff3030",
  emissiveIntensity: 1.2,
  toneMapped: false,
});

const DW = 0.8;
const DH = 1.8;
const CORNER = 0.18;
const SKIN_W = 1.5;
const SKIN_BOTTOM = -1;
const SKIN_TOP = 1.3;
const PLUG = 0.12;
// The door hangs on an arm from beside the opening and swings out parallel to the fuselage.
const ARM = DW / 2 + 0.02;
const SWING = 2;
const WINDOW_Y = 0.48;

/** Traces a `w` x `h` rectangle with corners of radius `r` onto `shape`. */
function rounded<T extends Path>(shape: T, [w, h]: [number, number], r: number) {
  return shape
    .moveTo(-w / 2 + r, -h / 2)
    .lineTo(w / 2 - r, -h / 2)
    .absarc(w / 2 - r, -h / 2 + r, r, -Math.PI / 2, 0, false)
    .lineTo(w / 2, h / 2 - r)
    .absarc(w / 2 - r, h / 2 - r, r, 0, Math.PI / 2, false)
    .lineTo(-w / 2 + r, h / 2)
    .absarc(-w / 2 + r, h / 2 - r, r, Math.PI / 2, Math.PI, false)
    .lineTo(-w / 2, -h / 2 + r)
    .absarc(-w / 2 + r, -h / 2 + r, r, Math.PI, Math.PI * 1.5, false) as T;
}

const fuselage = new Shape()
  .moveTo(-SKIN_W / 2, SKIN_BOTTOM)
  .lineTo(SKIN_W / 2, SKIN_BOTTOM)
  .lineTo(SKIN_W / 2, SKIN_TOP)
  .lineTo(-SKIN_W / 2, SKIN_TOP);
fuselage.holes.push(rounded(new Path(), [DW, DH], CORNER));
const plug = rounded(new Shape(), [DW - 0.02, DH - 0.02], CORNER - 0.01);

/** Pops out of its frame first, then swings aside on its arm, staying parallel to the fuselage. */
function Door() {
  const plugRef = useRef<Group>(null);
  const armRef = useRef<Group>(null);
  const leafRef = useRef<Group>(null);
  const open = use(OpenContext);

  useFrame(() => {
    const out = Math.min(open.current / 0.2, 1);
    const swing = SWING * Math.max((open.current - 0.2) / 0.8, 0);
    if (plugRef.current) plugRef.current.position.z = PLUG * out;
    if (armRef.current) armRef.current.rotation.y = -swing;
    if (leafRef.current) leafRef.current.rotation.y = swing;
  });

  return (
    <group ref={plugRef}>
      <group ref={armRef} position={[-ARM, 0, 0]}>
        <Box size={[ARM, 0.12, 0.03]} at={[ARM / 2, 0.1, -0.03]} material={trim} />
        <group ref={leafRef} position={[ARM, 0, 0]}>
          <mesh position={[0, 0, -0.06]} material={leaf}>
            <extrudeGeometry args={[plug, { depth: 0.07, bevelEnabled: false, curveSegments: 12 }]} />
          </mesh>
          <Cylinder
            radius={0.1}
            height={0.02}
            at={[0, WINDOW_Y, 0.01]}
            rotation={[Math.PI / 2, 0, 0]}
            material={trim}
          />
          <Cylinder
            radius={0.08}
            height={0.02}
            at={[0, WINDOW_Y, 0.013]}
            rotation={[Math.PI / 2, 0, 0]}
            material={porthole}
          />
          {/* Recessed handle and the armed-slide placard */}
          <Box size={[0.26, 0.1, 0.01]} at={[0.08, 0.02, 0.012]} material={trim} />
          <Box size={[0.22, 0.025, 0.03]} at={[0.08, 0.02, 0.03]} material={leaf} />
          <Box size={[0.2, 0.045, 0.006]} at={[0, -0.28, 0.013]} rotation={[0, 0, 0.25]} material={stripe} />
          <Box size={[DW - 0.1, 0.012, 0.006]} at={[0, -0.6, 0.013]} material={trim} />
        </group>
      </group>
    </group>
  );
}

/** A passenger jet's cabin door, with its cheatline and windows, the light in the cabin. */
export function Airplane() {
  return (
    <>
      <Backlight width={DW} height={DH} at={[0, 0, -0.1]} />
      <mesh position={[0, 0, -0.06]} material={skin}>
        <extrudeGeometry args={[fuselage, { depth: 0.06, bevelEnabled: false, curveSegments: 12 }]} />
      </mesh>
      {[-1, 1].map((dir) => (
        <group key={dir} position={[dir * (DW / 2 + 0.17), 0, 0]}>
          <Box size={[0.3, 0.07, 0.006]} at={[0, WINDOW_Y - 0.18, 0.003]} material={cheatline} />
          <Box size={[0.3, 0.025, 0.006]} at={[0, WINDOW_Y - 0.25, 0.003]} material={stripe} />
          <mesh position={[0, WINDOW_Y, 0.002]} scale={[1, 1, 0.1]} material={porthole}>
            <capsuleGeometry args={[0.055, 0.07, 4, 16]} />
          </mesh>
        </group>
      ))}
      <Box size={[0.24, 0.07, 0.02]} at={[0, DH / 2 + 0.12, 0.01]} material={exit} />
      <Door />
    </>
  );
}
