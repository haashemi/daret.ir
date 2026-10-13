import { MeshStandardMaterial } from "three";

import { Backlight, Box, Frame, H, Hinge, W } from "@/components/three/parts";

const board = new MeshStandardMaterial({ color: "#b98a56", roughness: 0.95 });
const fold = new MeshStandardMaterial({ color: "#a37444", roughness: 0.95 });
const tape = new MeshStandardMaterial({ color: "#d8b77a", roughness: 0.3, transparent: true, opacity: 0.8 });
const marker = new MeshStandardMaterial({ color: "#141414", roughness: 0.9 });
const red = new MeshStandardMaterial({ color: "#c0392b", roughness: 0.8 });
const label = new MeshStandardMaterial({ color: "#f4f2ec", roughness: 0.8 });

const barcode = [0, 0.012, 0.02, 0.034, 0.041, 0.055, 0.068, 0.076, 0.09, 0.1];

/** A door cut from a moving box: taped together, taped to the frame, and a handle drawn on with a marker. */
export function Cardboard() {
  return (
    <>
      <Backlight />
      <Frame material={board} size={0.08} />
      <Hinge at={[-W / 2, 0, 0.03]}>
        <group rotation={[0, 0, 0.008]}>
          <Box size={[W - 0.01, H - 0.01, 0.03]} at={[W / 2, 0, -0.02]} material={board} />
          <Box size={[W - 0.01, 0.006, 0.031]} at={[W / 2, 0.1, -0.02]} material={fold} />
          <Box size={[W - 0.01, 0.06, 0.004]} at={[W / 2, 0.1, -0.003]} material={tape} />
          {/* Tape hinges */}
          {[0.7, -0.7].map((y) => (
            <Box key={y} size={[0.12, 0.08, 0.004]} at={[0, y, -0.003]} material={tape} />
          ))}
          {/* This side up */}
          {[0.3, 0.42].map((x) => (
            <group key={x} position={[x, 0.75, -0.003]}>
              <Box size={[0.012, 0.1, 0.002]} material={marker} />
              <mesh position={[0, 0.06, 0]} rotation={[0, 0, Math.PI / 2]} material={marker}>
                <circleGeometry args={[0.035, 3]} />
              </mesh>
            </group>
          ))}
          {/* Shipping label with a barcode */}
          <Box size={[0.22, 0.15, 0.002]} at={[0.62, 0.62, -0.004]} material={label} />
          {barcode.map((x, i) => (
            <Box key={x} size={[i % 3 ? 0.004 : 0.008, 0.06, 0.002]} at={[0.57 + x, 0.6, -0.003]} material={marker} />
          ))}
          <Box size={[0.26, 0.12, 0.002]} at={[W / 2, -0.5, -0.004]} material={red} />
          {/* Drawn-on knob and keyhole */}
          <mesh position={[W - 0.1, 0, -0.004]} material={marker}>
            <torusGeometry args={[0.04, 0.004, 6, 32]} />
          </mesh>
          <Box size={[0.006, 0.03, 0.002]} at={[W - 0.1, -0.08, -0.004]} material={marker} />
        </group>
      </Hinge>
    </>
  );
}
