"use client";

import type { ReactNode } from "react";
import type { MeshBasicMaterial, PointLight } from "three";

import { Environment, PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { use, useRef } from "react";
import { MathUtils } from "three";

import { LIGHT_COLOR, OpenContext } from "./parts";
import { SceneAssetsContext } from "./scene-canvas";

const DEFAULT_HALO: [number, number] = [1.6, 2.7];

export interface DoorSceneProps {
  /** Target open amount, `0` closed to `1` fully open. The door eases toward it. */
  open: number;
  /** Open amount on mount; defaults to `open` so the door doesn't animate in. */
  from?: number;
  /** Camera distance; a larger value leaves more room around the door for the halo. */
  distance?: number;
  /** Width and height of the glow behind the door, in meters. */
  halo?: [number, number];
  children: ReactNode;
}

/** Camera, lights and the glow behind the door. Provides the damped open amount to the door's `Hinge`/`Slide` parts. */
export function DoorScene({ open, from = open, distance = 6.4, halo = DEFAULT_HALO, children }: DoorSceneProps) {
  const valueRef = useRef(from);
  const lightRef = useRef<PointLight>(null);
  const haloRef = useRef<MeshBasicMaterial>(null);
  const assets = use(SceneAssetsContext);

  useFrame((_, delta) => {
    valueRef.current = MathUtils.damp(valueRef.current, open, 3, delta);
    if (lightRef.current) lightRef.current.intensity = valueRef.current * 4;
    if (haloRef.current) haloRef.current.opacity = 0.12 + valueRef.current * 0.75;
  });

  return (
    <OpenContext value={valueRef}>
      {/* Slightly from the free-edge side, so a door swinging out reveals the light behind it. */}
      <PerspectiveCamera
        makeDefault
        fov={25}
        position={[distance * 0.15, distance * 0.04, distance]}
        onUpdate={(camera) => camera.lookAt(0, 0, 0)}
      />
      {assets && <Environment map={assets.environment} environmentIntensity={0.3} />}
      <ambientLight intensity={0.1} />
      <directionalLight position={[-3, 4, 3]} intensity={1.6} />
      <directionalLight position={[3, 1, 4]} intensity={0.35} />
      {/* Behind the opening: lights the back of the leaf and the jambs as the door swings out. */}
      <pointLight ref={lightRef} position={[0, 0.2, -0.3]} color={LIGHT_COLOR} distance={3} decay={1} />
      <mesh position={[0, 0, -0.6]}>
        <planeGeometry args={halo} />
        <meshBasicMaterial
          ref={haloRef}
          map={assets?.halo ?? null}
          color={LIGHT_COLOR}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {children}
    </OpenContext>
  );
}
