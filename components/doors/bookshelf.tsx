import { MeshStandardMaterial } from "three";

import { Backlight, Box, Frame, H, Hinge, Sphere, W } from "@/components/three/parts";

const oak = new MeshStandardMaterial({ color: "#4a2e1b", roughness: 0.6 });
const back = new MeshStandardMaterial({ color: "#2e1c10", roughness: 0.8 });
const casing = new MeshStandardMaterial({ color: "#2c190e", roughness: 0.55 });
const brass = new MeshStandardMaterial({ color: "#e0b860", metalness: 0.85, roughness: 0.3 });
const globe = new MeshStandardMaterial({ color: "#3f6f8f", roughness: 0.5 });
const lever = new MeshStandardMaterial({ color: "#a3201c", roughness: 0.5 });
const covers = ["#6e1f1f", "#1f3d2b", "#23324f", "#7a5a2a", "#3b2a3f", "#8c7b62", "#14141a"].map(
  (color) => new MeshStandardMaterial({ color, roughness: 0.7 }),
);

const CW = W - 0.01;
const CH = H - 0.01;
const DEPTH = 0.3;
const SIDE = 0.04;
const SHELVES = 5;
const BAY = (CH - SIDE) / SHELVES;
// The red book on the middle shelf, tipped out: the one that opens the door.
const LEVER_SHELF = 2;
const LEVER_X = 0.62;

// Fixed pseudo-random books, so every view and every visit shows the same shelf.
let seed = 7;

function random() {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
}

const books: { x: number; y: number; w: number; h: number; d: number; material: MeshStandardMaterial }[] = [];

for (let shelf = 0; shelf < SHELVES; shelf++) {
  const floor = -CH / 2 + SIDE + shelf * BAY;
  let x = SIDE + 0.01;

  while (x < CW - SIDE - 0.08) {
    // Leave room for the globe on the top shelf and the lever book.
    if (shelf === SHELVES - 1 && x > 0.5) break;
    if (shelf === LEVER_SHELF && Math.abs(x - LEVER_X) < 0.05) {
      x += 0.08;
      continue;
    }

    const w = 0.03 + random() * 0.035;
    const h = 0.2 + random() * 0.12;
    books.push({
      x: x + w / 2,
      y: floor + h / 2,
      w,
      h,
      d: 0.18 + random() * 0.06,
      material: covers[Math.floor(random() * covers.length)] ?? oak,
    });
    x += w + 0.004;
  }
}

/** A bookcase in a paneled study that turns out to be a door, once someone pulls the right book. */
export function Bookshelf() {
  return (
    <>
      <Backlight at={[0, 0, -DEPTH - 0.04]} />
      <group position={[0, 0, -0.1]}>
        <Frame material={casing} size={0.1} depth={0.44} />
      </group>
      <Hinge at={[-W / 2, 0, 0]} angle={1.15}>
        <group position={[CW / 2 + 0.005, 0, -DEPTH / 2]}>
          <Box size={[SIDE, CH, DEPTH]} at={[-CW / 2 + SIDE / 2, 0, 0]} material={oak} />
          <Box size={[SIDE, CH, DEPTH]} at={[CW / 2 - SIDE / 2, 0, 0]} material={oak} />
          <Box size={[CW, CH, 0.02]} at={[0, 0, -DEPTH / 2 + 0.01]} material={back} />
          {Array.from({ length: SHELVES + 1 }, (_, i) => (
            <Box key={i} size={[CW, SIDE, DEPTH]} at={[0, -CH / 2 + SIDE / 2 + i * BAY, 0]} material={oak} />
          ))}
        </group>
        {books.map(({ x, y, w, h, d, material }) => (
          <Box key={`${x}${y}`} size={[w, h, d]} at={[x, y, -0.04 - d / 2]} material={material} />
        ))}
        <Box
          size={[0.045, 0.27, 0.2]}
          at={[LEVER_X, -CH / 2 + SIDE + LEVER_SHELF * BAY + 0.16, -0.09]}
          rotation={[0.35, 0, 0]}
          material={lever}
        />
        {/* Globe on the top shelf */}
        <group position={[0.68, -CH / 2 + SIDE + (SHELVES - 1) * BAY, -0.15]}>
          <Box size={[0.08, 0.02, 0.08]} at={[0, 0.01, 0]} material={brass} />
          <Box size={[0.012, 0.08, 0.012]} at={[0, 0.06, 0]} material={brass} />
          <Sphere radius={0.1} at={[0, 0.19, 0]} material={globe} />
        </group>
      </Hinge>
    </>
  );
}
