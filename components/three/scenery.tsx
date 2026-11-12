"use client";

import type { RefObject } from "react";
import type { PerspectiveCamera as Camera, Mesh, PointLight, Texture } from "three";

import { Environment, PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { use, useEffect, useRef } from "react";
import { CanvasTexture, MathUtils, ShaderMaterial, Vector3 } from "three";

import { WhitePanel } from "@/components/doors/white-panel";

import { H, OpenContext, W } from "./parts";
import { SceneAssetsContext } from "./scene-canvas";

/**
 * Scrolling walks the camera up to the door as it opens onto hell. Off: the hero is a single screen and the door stays
 * closed.
 */
export const SCROLL_WALK = false;

/** Pointer position over the viewport, `-1..1` on both axes (`y` up), or `null` when there is no mouse. */
export type Pointer = { x: number; y: number } | null;

interface SceneryProps {
  pointerRef: RefObject<Pointer>;
  /** Reduced motion: no clouds drifting, no ripples, no camera sway. */
  still: boolean;
  /** Fades the whole scene into the page background (the door-choice exit sequence). */
  faded: boolean;
  /** Gets a `clip-path` with a hole where the door stands, so its content reads as behind the door. */
  holeRef: RefObject<HTMLElement | null>;
  /** Moved as if it stood a few meters behind the door, for parallax. */
  depthRef: RefObject<HTMLElement | null>;
  /**
   * The tall element the hero sticks in. Scrolling through it walks the camera up to the door as it opens; the scene
   * writes how far as `--hero-progress` (`0..1`) on it for the DOM.
   */
  trackRef: RefObject<HTMLElement | null>;
  onReady: () => void;
}

/** The door stands a little into the water. */
const WATER_Y = -H / 2 + 0.02;
// Low, near the water, looking slightly up: the horizon sits below the middle of the screen.
const CAMERA = new Vector3(0, -0.45, 7.5);
const TARGET = new Vector3(0, 0.2, 0);
// Scrolled all the way: right in front of the open door, looking straight through it.
const CLOSE_CAMERA = new Vector3(0, 0.05, 0.5);
const CLOSE_TARGET = new Vector3(0, 0.05, -5);
/** Where the DOM layer behind the door "stands" for parallax. */
const TEXT_ANCHOR = new Vector3(0, 0.6, -4);

// Sun high on the left, in front of the camera, so it lights the clouds from behind.
const SUN = new Vector3(-0.35, 0.3, -0.8).normalize();
const vec3 = (v: Vector3) => `vec3(${v.x.toFixed(4)}, ${v.y.toFixed(4)}, ${v.z.toFixed(4)})`;

// Frame bounds of the white door (frame size 0.09), with some depth for the knob.
const DOOR_CORNERS = [-1, 1].flatMap((x) =>
  [-H / 2, H / 2 + 0.09].flatMap((y) => [-0.1, 0.1].map((z) => new Vector3(x * (W / 2 + 0.09), y, z))),
);
// The leaf around its hinge (see `WhitePanel`: hinge at [-W / 2, 0, 0.03], swinging 1.75 rad toward the viewer).
const LEAF_CORNERS = [0.005, W - 0.005].flatMap((x) =>
  [-H / 2, H / 2].flatMap((y) => [-0.05, 0.09].map((z) => new Vector3(x, y, z))),
);
const HINGE = new Vector3(-W / 2, 0, 0.03);
const SWING = 1.75;

// The opening, where the hell behind the door is drawn, just in front of `WhitePanel`'s backlight.
const PORTAL_Z = -0.07;
const VEIL_DEPTH = CAMERA.z + 0.15;
const FLOOR_Y = -H / 2;
// The 👍 floating in hell, a vertical square facing the door.
const THUMB = { z: -4, y: 0.25, size: 1.7 };

/** Sky, clouds, distant hills and shallow rippling water, all from a world-space view direction. */
const SCENERY_GLSL = /* glsl */ `
  uniform float uTime;

  const vec3 SUN = ${vec3(SUN)};
  const float WATER_Y = ${WATER_Y.toFixed(4)};

  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      if (i >= octaves) break;
      value += amplitude * noise(p);
      p = mat2(1.6, 1.2, -1.2, 1.6) * p;
      amplitude *= 0.5;
    }
    return value;
  }

  vec3 sky(vec3 d) {
    float y = max(d.y, 0.0);
    vec3 col = mix(vec3(0.66, 0.84, 0.97), vec3(0.13, 0.40, 0.80), pow(y, 0.5));

    float s = max(dot(d, SUN), 0.0);
    col += vec3(1.0, 0.9, 0.7) * (0.1 * pow(s, 10.0) + 0.35 * pow(s, 120.0));
    col += smoothstep(0.9994, 0.9997, s);

    // Clouds on a plane overhead: smaller and flatter toward the horizon.
    vec2 uv = d.xz / (y + 0.08);
    float cirrus = fbm(uv * vec2(0.16, 0.8) + vec2(uTime * 0.004, 0.0), 4);
    col = mix(col, vec3(1.0), smoothstep(0.55, 0.9, cirrus) * 0.35 * smoothstep(0.02, 0.3, y));

    vec2 cu = uv * 0.8 + vec2(uTime * 0.01, 0.0);
    float density = fbm(cu, 5);
    float cover = smoothstep(0.56, 0.66, density);
    if (cover > 0.0) {
      // Thicker toward the sun means the near side is in shadow.
      // Lighting only needs the broad shape.
      float toward = fbm(cu + SUN.xz * 0.06, 3);
      float lit = clamp(0.85 + (density - toward) * 6.0, 0.0, 1.0);
      vec3 cloud = mix(vec3(0.64, 0.72, 0.84), vec3(1.0, 0.98, 0.95), lit);
      cloud += vec3(1.0, 0.92, 0.75) * pow(s, 8.0) * (1.0 - cover) * 0.8;
      col = mix(col, cloud, cover * smoothstep(0.0, 0.12, y));
    }

    // Low hills far away.
    float across = d.x / max(-d.z, 0.05);
    float ridge = 0.004 + 0.03 * pow(noise(vec2(across * 1.5 + 4.0, 0.0)), 3.0) + 0.004 * noise(vec2(across * 30.0, 1.0));
    if (d.y < ridge) col = vec3(0.30, 0.46, 0.50);

    return mix(col, vec3(0.80, 0.90, 0.97), exp(-y * 18.0) * 0.7);
  }

  float waves(vec2 p) {
    return noise(p + vec2(uTime * 0.35, uTime * 0.2)) + 0.5 * noise(p * 2.3 - vec2(uTime * 0.25, -uTime * 0.3));
  }

  /** Looking down at the water from \`ro\`: a mirror of the sky over a pale tiled floor. */
  vec3 water(vec3 ro, vec3 d) {
    float t = (WATER_Y - ro.y) / d.y;
    vec2 p = ro.xz + d.xz * t;
    float near = exp(-t * 0.05);

    vec2 q = p * 2.2;
    float h = waves(q);
    vec2 slope = vec2(waves(q + vec2(0.05, 0.0)) - h, waves(q + vec2(0.0, 0.05)) - h) / 0.05;
    vec3 n = normalize(vec3(-slope.x * 0.012 * near, 1.0, -slope.y * 0.012 * near));
    vec3 r = reflect(d, n);
    r.y = abs(r.y);

    vec2 tile = abs(fract(p * 0.8 + slope * 0.01) - 0.5);
    float grout = smoothstep(0.46, 0.5, max(tile.x, tile.y)) * exp(-t * 0.15);
    vec3 floorColor = mix(vec3(0.30, 0.47, 0.55), vec3(0.22, 0.36, 0.44), grout);

    float fresnel = 0.6 + 0.4 * pow(1.0 + d.y, 5.0);
    vec3 col = mix(floorColor, sky(r), fresnel);
    return col + vec3(1.0, 0.95, 0.85) * pow(max(dot(r, SUN), 0.0), 400.0) * 2.0;
  }

  vec3 dither(vec3 col) {
    return col + (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  }
`;

// One scene on the page, so its uniforms and materials are shared module constants, like the doors' materials.
const uniforms = {
  uTime: { value: 0 },
  uFade: { value: 0 },
  /** Darkens the top of the sky behind the title, `0..1`. */
  uScrim: { value: 1 },
  uEmoji: { value: null as Texture | null },
};

/**
 * Fullscreen: a ray per pixel from the camera, sky above the horizon and water below it. Drawn after the door, on the
 * far plane, so the depth test skips every pixel the door (or hell through it) already covers.
 */
const backdropMaterial = new ShaderMaterial({
  uniforms,
  depthWrite: false,
  vertexShader: /* glsl */ `
      varying vec3 vRay;
      varying float vY;
      void main() {
        vec4 view = inverse(projectionMatrix) * vec4(position.xy, 1.0, 1.0);
        vRay = (inverse(viewMatrix) * vec4(view.xyz / view.w, 0.0)).xyz;
        vY = position.y;
        gl_Position = vec4(position.xy, 1.0, 1.0);
      }
    `,
  fragmentShader: /* glsl */ `
      ${SCENERY_GLSL}
      uniform float uScrim;
      varying vec3 vRay;
      varying float vY;
      void main() {
        vec3 d = normalize(vRay);
        vec3 col = d.y >= 0.0 ? sky(d) : water(cameraPosition, d);
        // A deeper sky toward the top of the screen, so white text stays readable over the clouds.
        col = mix(col, col * vec3(0.45, 0.58, 0.82), smoothstep(-0.2, 0.9, vY) * 0.55 * uScrim);
        gl_FragColor = vec4(dither(col), 1.0);
      }
    `,
});

/**
 * The water surface again, over the door's mirror image. Same color as the backdrop at every pixel, so it only shows
 * where the reflected door is under it, which it veils.
 */
const veilMaterial = new ShaderMaterial({
  uniforms,
  transparent: true,
  depthWrite: false,
  vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
  fragmentShader: /* glsl */ `
      ${SCENERY_GLSL}
      varying vec3 vWorld;
      void main() {
        gl_FragColor = vec4(dither(water(cameraPosition, normalize(vWorld - cameraPosition))), 0.45);
      }
    `,
});

/** Behind the door: lava fields, smoke, black spires, rising embers and a 👍, from a world-space ray. */
const HELL_GLSL = /* glsl */ `
  uniform sampler2D uEmoji;

  const vec3 HAZE = vec3(0.6, 0.12, 0.03);

  vec3 hell(vec3 ro, vec3 d) {
    vec3 col;
    float y = d.y;
    if (y < 0.0) {
      float t = (${FLOOR_Y.toFixed(4)} - ro.y) / y;
      vec2 p = ro.xz + d.xz * t;
      float n = fbm(p * 0.9 + vec2(0.0, uTime * 0.05), 4);
      float crack = pow(1.0 - abs(2.0 * n - 1.0), 10.0);
      float pulse = 0.75 + 0.25 * sin(uTime * 2.0 + n * 12.0);
      col = vec3(0.07, 0.02, 0.02) + vec3(1.0, 0.32, 0.05) * crack * 2.5 * pulse;
      col = mix(col, HAZE, 1.0 - exp(-t * 0.08));
    } else {
      col = mix(vec3(0.55, 0.1, 0.03), vec3(0.06, 0.0, 0.01), clamp(pow(y, 0.4) * 1.2, 0.0, 1.0));
      vec2 uv = d.xz / (y + 0.15);
      float smoke = fbm(uv * 0.6 + vec2(uTime * 0.03, -uTime * 0.02), 5);
      col = mix(col, vec3(0.02, 0.0, 0.0) + vec3(0.6, 0.15, 0.02) * (1.0 - y) * 0.4, smoothstep(0.4, 0.75, smoke) * 0.85);

      float across = d.x / max(-d.z, 0.05);
      float spire = 0.02 + 0.12 * pow(noise(vec2(across * 4.0, 7.0)), 4.0) + 0.05 * pow(noise(vec2(across * 18.0, 2.0)), 3.0);
      if (y < spire) col = mix(vec3(0.03, 0.0, 0.0), vec3(0.8, 0.2, 0.03), smoothstep(spire - 0.006, spire, y) * 0.6);
      col = mix(col, HAZE, exp(-y * 10.0) * 0.8);
    }

    // Embers drifting up.
    vec2 e = d.xy / max(-d.z, 0.05) * 14.0 - vec2(0.0, uTime * 1.5);
    vec2 cell = floor(e);
    float h = hash(cell);
    vec2 offset = vec2(hash(cell + 3.1), hash(cell + 7.7)) - 0.5;
    float ember = smoothstep(0.08, 0.0, length(fract(e) - 0.5 - offset * 0.7)) * step(0.85, h);
    col += vec3(1.0, 0.5, 0.1) * ember * (0.5 + 0.5 * sin(uTime * 4.0 + h * 30.0));

    float t = (${THUMB.z.toFixed(4)} - ro.z) / d.z;
    if (t > 0.0) {
      vec2 q = (ro.xy + d.xy * t - vec2(0.0, ${THUMB.y.toFixed(4)} + sin(uTime * 1.2) * 0.05)) / ${THUMB.size.toFixed(4)} + 0.5;
      col += vec3(1.0, 0.35, 0.05) * 0.3 * smoothstep(0.7, 0.0, length(q - 0.5));
      if (all(greaterThan(q, vec2(0.0))) && all(lessThan(q, vec2(1.0)))) {
        vec4 thumb = texture2D(uEmoji, q);
        // Lit by the lava from below.
        col = mix(col, thumb.rgb * mix(vec3(1.2, 0.55, 0.35), vec3(1.05, 0.9, 0.8), q.y), thumb.a);
      }
    }
    return col;
  }
`;

/** Fills the door's opening with hell. The mirrored copy traces from the camera's mirror image, like a reflection. */
const portalMaterial = (mirrored: boolean) =>
  new ShaderMaterial({
    uniforms,
    defines: mirrored ? { MIRRORED: "" } : {},
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      ${SCENERY_GLSL}
      ${HELL_GLSL}
      varying vec3 vWorld;
      void main() {
        vec3 ro = cameraPosition;
        vec3 world = vWorld;
        #ifdef MIRRORED
          ro.y = 2.0 * WATER_Y - ro.y;
          world.y = 2.0 * WATER_Y - world.y;
        #endif
        gl_FragColor = vec4(dither(hell(ro, normalize(world - ro))), 1.0);
      }
    `,
  });
const portal = portalMaterial(false);
const mirroredPortal = portalMaterial(true);

function createThumb() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");

  if (context) {
    context.font = "200px 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("👍", 128, 140);
  }

  return new CanvasTexture(canvas);
}

/**
 * The bottom fifth of the view fading into the page background. In the canvas rather than the DOM: the canvas follows
 * scrolling a frame late, so a DOM gradient would slip against it.
 */
const bottomFadeMaterial = new ShaderMaterial({
  transparent: true,
  depthTest: false,
  depthWrite: false,
  vertexShader: /* glsl */ `
      varying float vY;
      void main() {
        vY = position.y;
        gl_Position = vec4(position.x, position.y * 0.2 - 0.8, 0.0, 1.0);
      }
    `,
  fragmentShader: /* glsl */ `
      varying float vY;
      void main() { gl_FragColor = vec4(0.035, 0.035, 0.043, smoothstep(1.0, -1.0, vY)); }
    `,
});

/** Covers the view with the page background. */
const fadeMaterial = new ShaderMaterial({
  uniforms,
  transparent: true,
  depthTest: false,
  depthWrite: false,
  vertexShader: /* glsl */ `void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  // The `--background` token, oklch(0.141 0.005 285.823).
  fragmentShader: /* glsl */ `
      uniform float uFade;
      void main() { gl_FragColor = vec4(0.035, 0.035, 0.043, uFade); }
    `,
});

type Point = [number, number];

const UP = new Vector3(0, 1, 0);

const projected = new Vector3();

/** `point` on screen, as percentages of the view from the top left. */
function toPercent(point: Vector3, camera: Camera): Point {
  projected.copy(point).project(camera);
  return [(projected.x + 1) * 50, (1 - projected.y) * 50];
}

/** Convex hull (monotone chain), counter-clockwise. */
function hull(points: Point[]) {
  const sorted = points.toSorted((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Point, a: Point, b: Point) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

  const half = (list: Point[]) => {
    const out: Point[] = [];

    for (const point of list) {
      while (out.length >= 2 && cross(out[out.length - 2] as Point, out[out.length - 1] as Point, point) <= 0)
        out.pop();
      out.push(point);
    }

    out.pop();
    return out;
  };

  return [...half(sorted), ...half(sorted.toReversed())];
}

/** Follow the mouse; without one, drift slowly. */
function swayTarget(still: boolean, pointer: Pointer, time: number) {
  if (still) return { x: 0, y: 0 };

  return pointer ?? { x: Math.sin(time * 0.13), y: Math.sin(time * 0.21) * 0.6 };
}

/**
 * How far the page has scrolled through the track, `0..1`, also written as `--hero-progress` for the DOM. Read every
 * frame rather than on scroll events, so the walk stays in step with the page.
 */
function scrollProgress(track: HTMLElement | null) {
  if (!track) return { progress: 0, onScreen: false };
  const { top, bottom, height } = track.getBoundingClientRect();
  const progress = SCROLL_WALK ? MathUtils.clamp(-top / Math.max(height - window.innerHeight, 1), 0, 1) : 0;
  track.style.setProperty("--hero-progress", progress.toFixed(4));

  return { progress, onScreen: bottom > 0 && top < window.innerHeight };
}

const leafCorner = new Vector3();
const walkPosition = new Vector3();
const walkLook = new Vector3();

/** The page minus the door's outline (frame and the leaf swung `open`), as a `clip-path`. */
function clipAroundDoor(camera: Camera, open: number) {
  const corners = DOOR_CORNERS.map((corner) => toPercent(corner, camera));

  if (open > 0.001) {
    for (const corner of LEAF_CORNERS) {
      leafCorner
        .copy(corner)
        .applyAxisAngle(UP, -SWING * open)
        .add(HINGE);
      corners.push(toPercent(leafCorner, camera));
    }
  }

  const points = hull(corners);
  // The hole joins the outer edge through a zero-width seam that can still show as a hairline. Run it straight down
  // from the door's lowest corner, through the water, where there is no text.
  const lowest = points.reduce((best, point, index) => (point[1] > (points[best]?.[1] ?? -Infinity) ? index : best), 0);
  const outline = [...points.slice(lowest), ...points.slice(0, lowest + 1)]
    .map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`)
    .join(", ");
  const seam = `${points[lowest]?.[0].toFixed(2) ?? 50}% 100%`;

  return `polygon(evenodd, ${seam}, 100% 100%, 100% 0%, 0% 0%, 0% 100%, ${seam}, ${outline})`;
}

/**
 * An idyllic flooded landscape with a white door standing in shallow water, and hell behind it. The camera sways with
 * the pointer (or slowly on its own), and the DOM layer between the sky and the door follows it at its own depth.
 * Scrolling walks the camera up to the door as it swings open, until hell fills the screen.
 */
export function Scenery({ pointerRef, still, faded, holeRef, depthRef, trackRef, onReady }: SceneryProps) {
  const cameraRef = useRef<Camera>(null);
  const fadeRef = useRef<Mesh>(null);
  const swayRef = useRef({ x: 0, y: 0 });
  const readyRef = useRef(false);
  const lastClipRef = useRef("");
  const openRef = useRef(0);
  const hellLightRef = useRef<PointLight>(null);
  const assets = use(SceneAssetsContext);

  useEffect(() => {
    const thumb = createThumb();
    uniforms.uEmoji.value = thumb;

    return () => thumb.dispose();
  }, []);

  useFrame((state, delta) => {
    const camera = cameraRef.current;
    if (!camera) return;

    // Scrolled past: the view isn't drawn, so skip the camera and DOM work too.
    const { progress, onScreen } = scrollProgress(trackRef.current);
    if (!onScreen) return;

    if (!still) uniforms.uTime.value += delta;
    uniforms.uScrim.value = MathUtils.clamp(1 - progress * 4, 0, 1);
    uniforms.uFade.value = MathUtils.damp(uniforms.uFade.value, faded ? 1 : 0, 6, delta);
    if (fadeRef.current) fadeRef.current.visible = uniforms.uFade.value > 0.001;

    const target = swayTarget(still, pointerRef.current, state.clock.elapsedTime);
    swayRef.current.x = MathUtils.damp(swayRef.current.x, target.x, 2.5, delta);
    swayRef.current.y = MathUtils.damp(swayRef.current.y, target.y, 2.5, delta);

    // The door is open before the camera gets close, so the leaf swings clear of it.
    openRef.current = MathUtils.smoothstep(progress, 0.05, 0.6);
    if (hellLightRef.current) hellLightRef.current.intensity = openRef.current * 6;
    const walk = still ? 0 : MathUtils.smoothstep(progress, 0, 1);
    const position = walkPosition.lerpVectors(CAMERA, CLOSE_CAMERA, walk);
    const look = walkLook.lerpVectors(TARGET, CLOSE_TARGET, walk);

    // Where the text layer would be without the sway, then where it is now.
    camera.position.copy(position);
    camera.lookAt(look);
    camera.updateMatrixWorld();
    const [restX, restY] = toPercent(TEXT_ANCHOR, camera);

    // The camera slides more than it turns, so the door shifts against the sky behind it. Less up close.
    const swayX = swayRef.current.x * (1 - walk);
    const swayY = swayRef.current.y * (1 - walk);
    camera.position.set(position.x + swayX * 0.7, position.y + swayY * 0.2, position.z);
    camera.lookAt(look.x + swayX * 0.45, look.y + swayY * 0.12, look.z);
    camera.updateMatrixWorld();
    const [x, y] = toPercent(TEXT_ANCHOR, camera);

    if (depthRef.current) depthRef.current.style.translate = `${(x - restX).toFixed(3)}% ${(y - restY).toFixed(3)}%`;

    const clip = clipAroundDoor(camera, openRef.current);

    if (holeRef.current && clip !== lastClipRef.current) {
      holeRef.current.style.clipPath = clip;
      lastClipRef.current = clip;
    }

    if (!readyRef.current) {
      readyRef.current = true;
      onReady();
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault fov={35} position={CAMERA.toArray()} />
      {assets && <Environment map={assets.environment} environmentIntensity={0.6} />}
      <hemisphereLight args={["#d6eaff", "#5f8296", 1.4]} />
      <directionalLight position={[-3, 4, 6]} intensity={2.2} color="#fff4e2" />

      <mesh material={backdropMaterial} renderOrder={1} frustumCulled={false}>
        <planeGeometry args={[2, 2]} />
      </mesh>

      {/* Hell glows out through the opening as the door opens. */}
      <pointLight ref={hellLightRef} position={[0, 0.3, -0.5]} color="#ff5a1f" intensity={0} distance={4} decay={1} />

      <OpenContext value={openRef}>
        <WhitePanel />
        <mesh material={portal} position={[0, 0, PORTAL_Z]}>
          <planeGeometry args={[W, H]} />
        </mesh>
        {/* Mirrored in the water surface. Three flips the face winding for the negative scale. */}
        <group position={[0, 2 * WATER_Y, 0]} scale={[1, -1, 1]}>
          <WhitePanel />
          <mesh material={mirroredPortal} position={[0, 0, PORTAL_Z]}>
            <planeGeometry args={[W, H]} />
          </mesh>
        </group>
      </OpenContext>

      {/* Only where the mirrored door can show: between the door and the camera, as wide as the sway reaches. */}
      <mesh material={veilMaterial} position={[0, WATER_Y, VEIL_DEPTH / 2 - 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.8, VEIL_DEPTH]} />
      </mesh>

      <mesh material={bottomFadeMaterial} renderOrder={9} frustumCulled={false}>
        <planeGeometry args={[2, 2]} />
      </mesh>

      <mesh ref={fadeRef} material={fadeMaterial} renderOrder={10} frustumCulled={false} visible={false}>
        <planeGeometry args={[2, 2]} />
      </mesh>
    </>
  );
}
