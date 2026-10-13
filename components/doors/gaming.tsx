import { useFrame } from "@react-three/fiber";
import { MeshStandardMaterial } from "three";

import { Backlight, Box, Frame, H, Hinge, W } from "@/components/three/parts";

const carbon = new MeshStandardMaterial({ color: "#141518", metalness: 0.6, roughness: 0.35 });
const plate = new MeshStandardMaterial({ color: "#23252b", metalness: 0.7, roughness: 0.3 });
// Three LED channels a little apart in hue, cycled every frame.
const led = () =>
  new MeshStandardMaterial({ color: "#000", emissive: "#f0f", emissiveIntensity: 2.2, toneMapped: false });
const ledA = led();
const ledB = led();
const ledC = led();
const rgb = [ledA, ledB, ledC];

const hexes = [
  [0, 0] as const,
  ...[0, 1, 2, 3, 4, 5].map((k) => [Math.cos((k * Math.PI) / 3) * 0.1, Math.sin((k * Math.PI) / 3) * 0.1] as const),
];
const chevrons = [0.62, 0.42];

/** A matte-black gaming door with RGB everything: frame strips, chevrons and a glowing handle. */
export function Gaming() {
  useFrame(({ clock }) => {
    rgb.forEach((material, i) => material.emissive.setHSL((clock.elapsedTime * 0.15 + i * 0.12) % 1, 1, 0.5));
  });

  return (
    <>
      <Backlight />
      <Frame material={carbon} size={0.1} />
      <Box size={[0.02, H + 0.1, 0.01]} at={[-(W / 2 + 0.05), 0.05, 0.101]} material={ledA} />
      <Box size={[W + 0.12, 0.02, 0.01]} at={[0, H / 2 + 0.05, 0.101]} material={ledB} />
      <Box size={[0.02, H + 0.1, 0.01]} at={[W / 2 + 0.05, 0.05, 0.101]} material={ledC} />
      <Hinge at={[-W / 2, 0, 0.03]}>
        <Box size={[W - 0.01, H - 0.01, 0.045]} at={[W / 2, 0, -0.025]} material={carbon} />
        <Box size={[0.12, H - 0.2, 0.02]} at={[W / 2, 0, 0.005]} material={plate} />
        {chevrons.map((y) =>
          [-1, 1].map((dir) => (
            <Box
              key={`${y}${dir}`}
              size={[0.32, 0.025, 0.01]}
              at={[W / 2 + dir * 0.13, y, 0.018]}
              rotation={[0, 0, dir * 0.5]}
              material={ledB}
            />
          )),
        )}
        {[-1, 1].map((dir) => (
          <Box
            key={dir}
            size={[0.32, 0.025, 0.01]}
            at={[W / 2 + dir * 0.13, -0.62, 0.018]}
            rotation={[0, 0, -dir * 0.5]}
            material={ledA}
          />
        ))}
        {hexes.map(([x, y]) => (
          <mesh key={`${x}${y}`} position={[W / 2 + x, -0.2 + y, 0.02]} rotation={[Math.PI / 2, 0, 0]} material={plate}>
            <cylinderGeometry args={[0.05, 0.05, 0.02, 6]} />
          </mesh>
        ))}
        <Box size={[0.012, H - 0.05, 0.01]} at={[W - 0.03, 0, 0.003]} material={ledC} />
        <Box size={[0.06, 0.14, 0.015]} at={[W - 0.09, 0.05, 0.005]} material={plate} />
        <Box size={[0.16, 0.03, 0.03]} at={[W - 0.15, 0.05, 0.035]} material={ledB} />
      </Hinge>
    </>
  );
}
