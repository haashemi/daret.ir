"use client";

import type { ReactNode } from "react";
import type { Group, Material } from "three";

import { useFrame } from "@react-three/fiber";
import { createContext, use, useRef } from "react";
import { MeshBasicMaterial } from "three";

export type Vec3 = [number, number, number];

/** Standard opening in meters. The opening is centered on the origin, so the floor is at `y = -H / 2`. */
export const W = 0.9;
export const H = 2.05;

/** Damped open amount of the current door, `0` closed to `1` fully open. Read it inside `useFrame`, never in render. */
export const OpenContext = createContext({ current: 0 });
OpenContext.displayName = "OpenContext";

export const LIGHT_COLOR = "#ffd59a";

// Doors swing toward the viewer, so the light behind the opening never intersects the leaf.
const lightMaterial = new MeshBasicMaterial({ color: LIGHT_COLOR, toneMapped: false });

const ORIGIN: Vec3 = [0, 0, 0];
const BEHIND_LEAF: Vec3 = [0, 0, -0.08];

interface MeshProps {
  at?: Vec3;
  rotation?: Vec3;
  material: Material;
}

export function Box({ size, at = ORIGIN, rotation = ORIGIN, material }: MeshProps & { size: Vec3 }) {
  return (
    <mesh position={at} rotation={rotation} material={material}>
      <boxGeometry args={size} />
    </mesh>
  );
}

/** Upright cylinder; rotate it `[Math.PI / 2, 0, 0]` to face the viewer. */
export function Cylinder({
  radius,
  height,
  at = ORIGIN,
  rotation = ORIGIN,
  material,
}: MeshProps & { radius: number; height: number }) {
  return (
    <mesh position={at} rotation={rotation} material={material}>
      <cylinderGeometry args={[radius, radius, height, 32]} />
    </mesh>
  );
}

export function Sphere({ radius, at = ORIGIN, material }: MeshProps & { radius: number }) {
  return (
    <mesh position={at} material={material}>
      <sphereGeometry args={[radius, 16, 12]} />
    </mesh>
  );
}

/** Swings its children toward the viewer around a vertical axis at `at`. A left hinge holds a leaf that extends to `+x`. */
export function Hinge({
  at,
  side = "left",
  angle = 1.75,
  children,
}: {
  at: Vec3;
  side?: "left" | "right";
  angle?: number;
  children: ReactNode;
}) {
  const ref = useRef<Group>(null);
  const open = use(OpenContext);

  useFrame(() => {
    if (ref.current) ref.current.rotation.y = (side === "left" ? -1 : 1) * angle * open.current;
  });

  return (
    <group ref={ref} position={at}>
      {children}
    </group>
  );
}

/** Moves its children by `by` when fully open. */
export function Slide({ by, children }: { by: Vec3; children: ReactNode }) {
  const ref = useRef<Group>(null);
  const open = use(OpenContext);

  useFrame(() => {
    ref.current?.position.set(by[0] * open.current, by[1] * open.current, by[2] * open.current);
  });

  return <group ref={ref}>{children}</group>;
}

/** Two jambs and a head around a `width` x `height` opening. */
export function Frame({
  material,
  width = W,
  height = H,
  size = 0.08,
  depth = 0.2,
}: {
  material: Material;
  width?: number;
  height?: number;
  size?: number;
  depth?: number;
}) {
  const x = (width + size) / 2;

  return (
    <>
      <Box size={[size, height + size, depth]} at={[-x, size / 2, 0]} material={material} />
      <Box size={[size, height + size, depth]} at={[x, size / 2, 0]} material={material} />
      <Box size={[width + size * 2, size, depth]} at={[0, (height + size) / 2, 0]} material={material} />
    </>
  );
}

/** The light on the other side of the door: fills the opening, a little behind the closed leaf. */
export function Backlight({
  width = W,
  height = H,
  radius,
  at = BEHIND_LEAF,
}: {
  width?: number;
  height?: number;
  radius?: number;
  at?: Vec3;
}) {
  return (
    <mesh position={at} material={lightMaterial}>
      {radius ? <circleGeometry args={[radius, 48]} /> : <planeGeometry args={[width, height]} />}
    </mesh>
  );
}
