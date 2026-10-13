import { MeshStandardMaterial } from "three";

import { Backlight, Box, Frame, H, Hinge } from "@/components/three/parts";

const red = new MeshStandardMaterial({ color: "#b3201b", roughness: 0.45 });
const darkRed = new MeshStandardMaterial({ color: "#7d1512", roughness: 0.5 });
const glass = new MeshStandardMaterial({ color: "#dfeef2", roughness: 0.1, transparent: true, opacity: 0.3 });
const steel = new MeshStandardMaterial({ color: "#b9bec4", metalness: 1, roughness: 0.25 });
const sign = new MeshStandardMaterial({
  color: "#fff6e0",
  emissive: "#fff6e0",
  emissiveIntensity: 1.2,
  toneMapped: false,
});

const OW = 0.78;
const OH = 1.85;
const POST = 0.12;
const PLINTH = 0.08;
const CROWN = 0.2;
const DEPTH = 0.9;
// Stands on the floor; the roof reaches just under the top of the view.
const BASE_Y = -H / 2 + PLINTH + OH / 2;

const LW = OW - 0.01;
const LH = OH - 0.01;
const STILE = 0.07;
const TOP_RAIL = 0.08;
const BOTTOM_RAIL = 0.3;
const glazeW = LW - STILE * 2;
const glazeH = LH - TOP_RAIL - BOTTOM_RAIL;
const glazeY = (BOTTOM_RAIL - TOP_RAIL) / 2;
const mullionsY = Array.from({ length: 7 }, (_, i) => glazeY - glazeH / 2 + (glazeH * (i + 1)) / 8);

/** A red telephone box, entered through its many-paned door. */
export function PhoneBooth() {
  const crownY = OH / 2 + POST + CROWN / 2;

  return (
    <group position={[0, BASE_Y, 0]}>
      <Backlight width={OW} height={OH} />
      <Frame material={red} width={OW} height={OH} size={POST} depth={0.24} />
      {[-1, 1].map((dir) => (
        <Box
          key={dir}
          size={[0.04, OH, DEPTH - 0.1]}
          at={[dir * (OW / 2 + POST - 0.02), 0, -DEPTH / 2]}
          material={darkRed}
        />
      ))}
      <Box size={[OW + POST * 2 + 0.06, CROWN, DEPTH]} at={[0, crownY, -DEPTH / 2 + 0.12]} material={red} />
      <Box size={[OW, 0.08, 0.01]} at={[0, crownY, 0.125]} material={sign} />
      <Box
        size={[OW + POST * 2, 0.06, DEPTH - 0.1]}
        at={[0, crownY + CROWN / 2 + 0.03, -DEPTH / 2 + 0.1]}
        material={red}
      />
      <Box
        size={[OW + POST * 2 + 0.08, PLINTH, DEPTH + 0.1]}
        at={[0, -OH / 2 - PLINTH / 2, -DEPTH / 2 + 0.12]}
        material={darkRed}
      />
      <Hinge at={[-OW / 2, 0, 0.03]}>
        <group position={[0, 0, -0.025]}>
          <Box size={[STILE, LH, 0.045]} at={[0.005 + STILE / 2, 0, 0]} material={red} />
          <Box size={[STILE, LH, 0.045]} at={[OW - 0.005 - STILE / 2, 0, 0]} material={red} />
          <Box size={[LW, TOP_RAIL, 0.045]} at={[OW / 2, LH / 2 - TOP_RAIL / 2, 0]} material={red} />
          <Box size={[LW, BOTTOM_RAIL, 0.045]} at={[OW / 2, -LH / 2 + BOTTOM_RAIL / 2, 0]} material={red} />
          <Box size={[glazeW, glazeH, 0.01]} at={[OW / 2, glazeY, 0]} material={glass} />
          {[-1, 1].map((dir) => (
            <Box key={dir} size={[0.025, glazeH, 0.035]} at={[OW / 2 + (dir * glazeW) / 6, glazeY, 0]} material={red} />
          ))}
          {mullionsY.map((y) => (
            <Box key={y} size={[glazeW, 0.025, 0.035]} at={[OW / 2, y, 0]} material={red} />
          ))}
        </group>
        <Box size={[0.025, 0.22, 0.03]} at={[OW - 0.04, 0, 0.03]} material={steel} />
      </Hinge>
    </group>
  );
}
