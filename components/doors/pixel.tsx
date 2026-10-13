import { MeshStandardMaterial } from "three";

import { Backlight, Box, H, Hinge, W } from "@/components/three/parts";

const wood = {
  a: new MeshStandardMaterial({ color: "#a8794a", roughness: 0.9 }),
  b: new MeshStandardMaterial({ color: "#8f6238", roughness: 0.9 }),
  c: new MeshStandardMaterial({ color: "#6e4a2a", roughness: 0.9 }),
};
const stone = new MeshStandardMaterial({ color: "#7d7d7d", roughness: 1 });
const darkStone = new MeshStandardMaterial({ color: "#686868", roughness: 1 });
const moss = new MeshStandardMaterial({ color: "#5d7a45", roughness: 1 });
const iron = new MeshStandardMaterial({ color: "#5b5b5b", metalness: 0.6, roughness: 0.6 });

// 7 x 16 blocks, top row first; "." is an open window pixel.
const art = [
  "ccccccc",
  "c..c..c",
  "c..c..c",
  "ccccccc",
  "c..c..c",
  "c..c..c",
  "ccccccc",
  "abaabba",
  "bbabaab",
  "aabbaba",
  "ccccccc",
  "babaabb",
  "abbabaa",
  "baabbab",
  "abbaaba",
  "ccccccc",
];
const COLS = 7;
const PX = W / COLS;
const PY = H / art.length;

const blocks = art.flatMap((row, r) =>
  [...row].flatMap((ch, c) => (ch in wood ? [{ r, c, material: wood[ch as keyof typeof wood] }] : [])),
);
// Cobblestone frame: a column of blocks each side and a row across the top.
const frame = [
  ...Array.from({ length: art.length + 1 }, (_, i) => [-(W + PX) / 2, H / 2 + PY / 2 - i * PY] as const),
  ...Array.from({ length: art.length + 1 }, (_, i) => [(W + PX) / 2, H / 2 + PY / 2 - i * PY] as const),
  ...Array.from({ length: COLS }, (_, i) => [-W / 2 + PX / 2 + i * PX, H / 2 + PY / 2] as const),
];

/** A blocky voxel door straight out of a sandbox game, four see-through window pixels and all. */
export function Pixel() {
  return (
    <>
      <Backlight />
      {frame.map(([x, y], i) => (
        <Box
          key={`${x}${y}`}
          size={[PX, PY, 0.2]}
          at={[x, y, 0]}
          material={i % 5 === 2 ? moss : i % 2 ? darkStone : stone}
        />
      ))}
      <Hinge at={[-W / 2, 0, 0.03]}>
        {blocks.map(({ r, c, material }) => (
          <Box
            key={`${r}-${c}`}
            size={[PX, PY, 0.06]}
            at={[(c + 0.5) * PX, H / 2 - (r + 0.5) * PY, -0.035]}
            material={material}
          />
        ))}
        <Box size={[PX * 0.5, PY * 0.35, 0.04]} at={[W - PX * 0.9, H / 2 - 9.5 * PY, 0.01]} material={iron} />
      </Hinge>
    </>
  );
}
