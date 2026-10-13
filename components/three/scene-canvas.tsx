"use client";

import type { Texture } from "three";

import { View } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { createContext, useMemo } from "react";
import { CanvasTexture, PMREMGenerator, SRGBColorSpace } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/** Textures every door scene shares, built once per renderer. */
export const SceneAssetsContext = createContext<{ environment: Texture; halo: Texture } | null>(null);
SceneAssetsContext.displayName = "SceneAssetsContext";

function createHalo() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");

  if (context) {
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgb(255 255 255 / 1)");
    gradient.addColorStop(0.4, "rgb(255 255 255 / 0.35)");
    gradient.addColorStop(1, "rgb(255 255 255 / 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

// Views render through this port, so they sit under the provider like any child.
function Port() {
  const gl = useThree((state) => state.gl);
  const assets = useMemo(
    () => ({ environment: new PMREMGenerator(gl).fromScene(new RoomEnvironment(), 0.04).texture, halo: createHalo() }),
    [gl],
  );

  return (
    <SceneAssetsContext value={assets}>
      <View.Port />
    </SceneAssetsContext>
  );
}

/**
 * The app's only WebGL canvas, fixed behind the page. Every `<DoorView>` is a DOM box that
 * drei's `View` tracks and draws into this canvas, so anything with a background that sits
 * above a door hides it.
 */
export function SceneCanvas() {
  return (
    <Canvas style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" }} dpr={[1, 2]} aria-hidden>
      <Port />
    </Canvas>
  );
}
