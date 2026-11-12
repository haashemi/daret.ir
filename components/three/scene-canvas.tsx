"use client";

import type { ReactNode } from "react";
import type { Texture } from "three";

import { View } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Component, createContext, useMemo } from "react";
import { CanvasTexture, PMREMGenerator, SRGBColorSpace } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import { markSceneFailed } from "./scene-status";

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

/** Without WebGL the renderer throws while mounting. Drop the canvas and let the page carry on without doors. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch() {
    markSceneFailed();
  }

  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * The app's only WebGL canvas, fixed behind the page. Every `<DoorView>` is a DOM box that
 * drei's `View` tracks and draws into this canvas, so anything with a background that sits
 * above a door hides it.
 */
export function SceneCanvas() {
  // Always the device's own resolution, capped at 2x. Dropping to 1x when frames fall behind left every door blurry
  // for the rest of the visit, since the hero's fullscreen shaders tripped it on most machines.
  return (
    <SceneBoundary>
      <Canvas style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" }} dpr={[1, 2]} aria-hidden>
        <Port />
      </Canvas>
    </SceneBoundary>
  );
}
