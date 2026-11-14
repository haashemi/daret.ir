/**
 * Captures the web app manifest's screenshots (`lib/screenshots.ts`) into `public/screenshots/`.
 *
 * Usage (with `pnpm dev` running and Chrome installed):
 *   node scripts/manifest-screenshots.ts [base]
 *   default base: http://localhost:3000
 */
import type { Page } from "playwright-core";

import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

import { screenshotFormFactors, screenshots } from "../lib/screenshots.ts";

const BASE = process.argv[2] ?? "http://localhost:3000";

async function capture(page: Page, shot: (typeof screenshots)[number], out: string) {
  await page.goto(`${BASE}${shot.path}`, { waitUntil: "networkidle", timeout: 120_000 });
  await page.evaluate(async () => document.fonts.ready);
  // `next dev`'s indicator and the scrollbar aren't part of the app.
  await page.addStyleTag({ content: "nextjs-portal { display: none } html { scrollbar-width: none }" });
  // The home page's splash lifts once its scene has drawn.
  await page.waitForSelector("[data-splash]", { state: "detached", timeout: 60_000 });
  if ("scrollTo" in shot) await page.locator(shot.scrollTo).evaluate((el) => el.scrollIntoView({ block: "start" }));
  // Let the doors' views draw and their stills fade out.
  await page.waitForTimeout(2500);
  await page.screenshot({ path: out, type: "jpeg", quality: 85 });
  console.log(out);
}

mkdirSync("public/screenshots", { recursive: true });

const browser = await chromium.launch({
  channel: "chrome",
  args: ["--ignore-gpu-blocklist", "--enable-gpu", "--use-angle=gl-egl"],
});

// One capture at a time: each page load starts its own WebGL context.
/* eslint-disable no-await-in-loop */
for (const [formFactor, options] of Object.entries(screenshotFormFactors)) {
  const page = await browser.newPage(options);
  for (const shot of screenshots) await capture(page, shot, `public/screenshots/${shot.name}-${formFactor}.jpg`);
  await page.close();
}
/* eslint-enable no-await-in-loop */

await browser.close();
