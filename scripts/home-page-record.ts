/**
 * Records the home page scrolling from top to bottom as a 1920x1080, 30fps MP4 for social media: a hold on the hero,
 * one ease-in-out scroll through the whole page, then a hold on the footer.
 *
 * Usage (with `pnpm dev` running, Chrome and ffmpeg installed):
 *   node scripts/home-page-record.ts [url] [out]
 *   defaults: http://localhost:3000/  .temp/home-page-record.mp4
 *
 * The page runs on a virtual clock (rAF, `performance.now`, CSS/WAAPI animations) that advances exactly 1/30s per
 * captured frame, so the video is smooth however long each frame takes to render and capture.
 */
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { chromium } from "playwright-core";

const URL = process.argv[2] ?? "http://localhost:3000/";
const OUT = process.argv[3] ?? ".temp/home-page-record.mp4";
const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 30;

const HOLD_START = 3; // s still on the hero
const SCROLL = 8; // s to scroll top to bottom
const HOLD_END = 3; // s still on the footer

declare global {
  interface Window {
    __recorder: { start: () => void; step: (y: number, dt: number) => Promise<void> };
  }
}

/** Runs in the page before any of its scripts. */
function installVirtualClock() {
  // Between frames the compositor sometimes presents the canvas's cleared buffer, which shows up as the doors and the
  // hero blinking out every ~18 frames. Keeping the buffer keeps the last drawn frame on screen instead.
  const realGetContext = HTMLCanvasElement.prototype.getContext as (
    this: HTMLCanvasElement,
    type: string,
    options?: Record<string, unknown>,
  ) => RenderingContext | null;
  const contexts: WebGLRenderingContext[] = [];

  // @ts-expect-error -- getContext's overloads can't be reassigned with a single signature.
  HTMLCanvasElement.prototype.getContext = function getContext(type: string, options?: Record<string, unknown>) {
    if (!type.startsWith("webgl")) return realGetContext.call(this, type, options);

    const context = realGetContext.call(this, type, { ...options, preserveDrawingBuffer: true });
    if (context && !contexts.includes(context as WebGLRenderingContext))
      contexts.push(context as WebGLRenderingContext);
    return context;
  };

  // A kept buffer is no longer cleared each frame, and the views only clear their own boxes, so doors that moved
  // would leave trails. Clear the whole canvas before each frame like the browser does, restoring the state three.js
  // has cached.
  const clearCanvases = () => {
    for (const gl of contexts) {
      const framebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer | null;
      const scissor = gl.isEnabled(gl.SCISSOR_TEST);
      const color = gl.getParameter(gl.COLOR_CLEAR_VALUE) as Float32Array;
      const mask = gl.getParameter(gl.COLOR_WRITEMASK) as boolean[];
      const depthMask = gl.getParameter(gl.DEPTH_WRITEMASK) as boolean;
      const stencilMask = gl.getParameter(gl.STENCIL_WRITEMASK) as number;

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.disable(gl.SCISSOR_TEST);
      gl.clearColor(0, 0, 0, 0);
      gl.colorMask(true, true, true, true);
      gl.depthMask(true);
      gl.stencilMask(0xff);
      // eslint-disable-next-line no-bitwise -- WebGL clear mask
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      if (scissor) gl.enable(gl.SCISSOR_TEST);
      gl.clearColor(color[0]!, color[1]!, color[2]!, color[3]!);
      gl.colorMask(mask[0]!, mask[1]!, mask[2]!, mask[3]!);
      gl.depthMask(depthMask);
      gl.stencilMask(stencilMask);
    }
  };

  const realRAF = window.requestAnimationFrame.bind(window);
  const realCancel = window.cancelAnimationFrame.bind(window);
  const realNow = performance.now.bind(performance);
  let virtual: number | undefined; // real time until recording starts
  let queue: { id: number; callback: FrameRequestCallback }[] = [];
  let lastId = 0;

  performance.now = () => virtual ?? realNow();

  window.requestAnimationFrame = (callback) => {
    if (virtual === undefined) return realRAF(callback);
    queue.push({ id: ++lastId, callback });
    return lastId;
  };

  window.cancelAnimationFrame = (handle) => {
    queue = queue.filter(({ id }) => id !== handle);
    realCancel(handle);
  };

  // CSS and WAAPI animations run on the real clock: pause them and move them by hand.
  const paused = new WeakSet<Animation>();

  const advanceAnimations = (dt: number) => {
    for (const animation of document.getAnimations()) {
      if (animation.playState === "running") {
        animation.pause();
        paused.add(animation);
      }
      if (!paused.has(animation) || animation.playState !== "paused") continue;

      const end = Number(animation.effect?.getComputedTiming().endTime ?? Infinity);
      const time = Number(animation.currentTime ?? 0) + dt * animation.playbackRate;

      if (Number.isFinite(end) && time >= end) {
        paused.delete(animation);
        animation.finish();
      } else {
        animation.currentTime = time;
      }
    }
  };

  window.__recorder = {
    start() {
      virtual = realNow();
    },
    step: (y, dt) =>
      new Promise((resolve) => {
        realRAF(() => {
          window.scrollTo({ top: y, behavior: "instant" });
          virtual! += dt;
          advanceAnimations(dt);
          clearCanvases();
          const due = queue;
          queue = [];
          for (const { callback } of due) callback(virtual!);
          // Let the compositor present this frame before it's captured.
          realRAF(() => realRAF(() => resolve()));
        });
      }),
  };
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

function scrollPositions(max: number) {
  return [
    ...Array.from<number>({ length: HOLD_START * FPS }).fill(0),
    ...Array.from({ length: SCROLL * FPS }, (_, i) => max * easeInOut((i + 1) / (SCROLL * FPS))),
    ...Array.from<number>({ length: HOLD_END * FPS }).fill(max),
  ];
}

mkdirSync(dirname(OUT), { recursive: true });

const browser = await chromium.launch({
  channel: "chrome",
  args: ["--ignore-gpu-blocklist", "--enable-gpu", "--use-angle=gl-egl"],
});
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
await page.addInitScript(installVirtualClock);
await page.goto(URL, { waitUntil: "networkidle" });
await page.addStyleTag({
  content:
    "nextjs-portal { display: none !important } html { scroll-behavior: auto !important; scrollbar-width: none }",
});
await page.mouse.move(-10, -10); // no hovered door
await page.waitForTimeout(4000); // scene ready, entrance animations done

const positions = scrollPositions(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight));
console.log(`${positions.length} frames (${(positions.length / FPS).toFixed(1)}s) -> ${OUT}`);

// H.264 High in MP4 with a silent AAC track and faststart: what social platforms accept and play first try.
// prettier-ignore
const ffmpeg = spawn("ffmpeg", [
  "-y", "-loglevel", "error",
  "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-",
  "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-shortest",
  "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-maxrate", "14M", "-bufsize", "28M",
  "-profile:v", "high", "-level", "4.1", "-pix_fmt", "yuv420p", "-g", String(FPS * 2),
  "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
  "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart",
  OUT,
], { stdio: ["pipe", "inherit", "inherit"] });
const encoded = new Promise<void>((resolve, reject) => {
  ffmpeg.on("error", reject);
  ffmpeg.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`))));
});

const cdp = await page.context().newCDPSession(page);
await page.evaluate(() => window.__recorder.start());

// Frames are captured one after another by design.
/* eslint-disable no-await-in-loop */
for (const [i, y] of positions.entries()) {
  await page.evaluate(([top, dt]) => window.__recorder.step(top!, dt!), [Math.round(y), 1000 / FPS]);
  const { data } = await cdp.send("Page.captureScreenshot", { format: "png", optimizeForSpeed: true });

  if (!ffmpeg.stdin.write(Buffer.from(data, "base64"))) {
    await new Promise((resolve) => {
      ffmpeg.stdin.once("drain", resolve);
    });
  }
  if (i % 60 === 0) console.log(`frame ${i}/${positions.length}`);
}

/* eslint-enable no-await-in-loop */
ffmpeg.stdin.end();
await browser.close();
await encoded;
console.log(`done: ${OUT}`);
