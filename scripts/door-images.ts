/**
 * Captures the site's static images from the dev-only `/og` page (`app/og/social-card.tsx`):
 * - `app/opengraph-image.png` (1200x630) and `app/twitter-image.png` (1200x600): the site's card.
 * - `public/social/<slug>.jpg` (1200x630): each door's card, used by its page's metadata.
 * - `public/doors/<slug>.jpg` (450x800): each door shut, framed like its grid cell; the cell's placeholder and the
 *   result page's "other doors".
 *
 * Usage (with `pnpm dev` running and Chrome installed):
 *   node scripts/door-images.ts            everything
 *   node scripts/door-images.ts cork tent  only these doors' images
 */
import type { Page } from "playwright-core";

import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

import { doors } from "../lib/doors.ts";

const BASE = "http://localhost:3000/og";
const slugs = process.argv.slice(2);
const unknown = slugs.filter((slug) => !doors.some((door) => door.slug === slug));
if (unknown.length > 0) throw new Error(`Unknown doors: ${unknown.join(", ")}`);
const selected = slugs.length > 0 ? doors.filter((door) => slugs.includes(door.slug)) : doors;

async function capture(page: Page, query: string, path: string) {
  await page.goto(`${BASE}${query}`, { waitUntil: "networkidle", timeout: 120_000 });
  await page.waitForSelector("html[data-ready]", { state: "attached", timeout: 60_000 });
  await page.evaluate(async () => document.fonts.ready);
  // A few more frames, so the views have settled after their first draw.
  await page.waitForTimeout(600);
  await page.screenshot(path.endsWith(".png") ? { path } : { path, type: "jpeg", quality: 85 });
  console.log(path);
}

mkdirSync("public/social", { recursive: true });
mkdirSync("public/doors", { recursive: true });

const browser = await chromium.launch({
  channel: "chrome",
  args: ["--ignore-gpu-blocklist", "--enable-gpu", "--use-angle=gl-egl"],
});

const cards = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const stills = await browser.newPage({ viewport: { width: 225, height: 400 }, deviceScaleFactor: 2 });

// One capture at a time: each page load starts its own WebGL context.
/* eslint-disable no-await-in-loop */
if (slugs.length === 0) {
  await capture(cards, "", "app/opengraph-image.png");
  await cards.setViewportSize({ width: 1200, height: 600 });
  await capture(cards, "", "app/twitter-image.png");
  await cards.setViewportSize({ width: 1200, height: 630 });
}

for (const { slug } of selected) {
  await capture(cards, `?door=${slug}`, `public/social/${slug}.jpg`);
  await capture(stills, `?still=${slug}`, `public/doors/${slug}.jpg`);
}
/* eslint-enable no-await-in-loop */

await browser.close();
