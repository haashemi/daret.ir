# Architecture

A Persian (RTL, `lang="fa"`, forced dark theme) single-purpose meme site: a luxury-looking door catalog where choosing a door ends in «اینم از در جدیدت / در {name} / حالا بذارش!».

## Routes

| Route          | File                       | What                                                                                                                |
| -------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `/`            | `app/page.tsx`             | `Hero` (`components/hero.tsx`), passed as `children` to `DoorPicker` (grid + exit sequence).                        |
| `/door/[slug]` | `app/door/[slug]/page.tsx` | Result page (`components/door-result.tsx`). `generateStaticParams` from `lib/doors.ts`; unknown slugs `notFound()`. |

- SEO: `app/robots.ts` and `app/sitemap.ts` (home plus every door from `lib/doors.ts`, `force-static` for the export). The home page renders `WebSite` + `ItemList` JSON-LD and `About` (`components/about.tsx`), a short FAQ under the grid. Door pages render `BreadcrumbList` JSON-LD (`components/json-ld.tsx`) and `RelatedDoors` (`components/related-doors.tsx`): the next four doors in catalog order as `DoorCell`s, so they look and choose like the home grid. Site title/description/alternate names live in `lib/config/index.ts`.
- Static export (`output: "export"`, `cacheComponents: false`): every door page is prerendered from `generateStaticParams`, and unknown slugs call `notFound()`.
- Next keeps visited pages mounted but hidden (`<Activity>`), so transient UI state is reset in a `useLayoutEffect` cleanup (see `DoorPicker`).

## 3D rendering: one canvas, many views

- `components/three/scene-canvas.tsx` mounts the **only** WebGL canvas (in `app/layout.tsx`), `position: fixed`, `z-index: -1`, `pointer-events: none`.
- `components/door-view.tsx` renders drei's `<View>`: a DOM box whose screen rect the canvas draws into each frame (scissored). Size and position doors with ordinary CSS on that box; CSS transforms (scale, motion) are followed too.
- **The canvas is under the DOM.** Any element with a background above a door hides it. That's how the grid's reveal/dismiss "covers" work (each cover also holds the door's still, `public/doors/<slug>.jpg`, over a shimmer until `DoorScene` calls `onReady` on its first frame), and why page containers must stay transparent.
- `SceneAssetsContext` (environment map + halo texture) is built once per renderer in the canvas and reaches every view because views render through `View.Port`.
- Views with a higher `index` draw later (the flying door uses `index={2}`).
- The home hero is one full-screen view, `components/three/scenery.tsx`: a fullscreen shader quad (sky, clouds, hills, rippling water reflecting them), the white door standing in the water, and its mirror image under a water "veil" of the same shader. Its DOM title must read as _behind_ the door, so the scene projects the door's outline each frame and writes it as a `clip-path` hole on the text layer, and moves that layer as if it stood 4m behind the door (parallax). Behind the door, a portal plane over the opening (and its mirrored copy) draws hell and a 👍 (a canvas-texture emoji) with the same ray approach. The hero is a sticky `h-svh` view inside a `300svh` track: the scene reads the track's scroll progress every frame, walks the camera up to the door while it opens, and writes `--hero-progress` for the DOM to fade the text. The hero fades its scene out through `LeavingContext` (from `DoorPicker`), since fading the DOM doesn't hide the canvas.
- If the canvas can't start (no WebGL), `SceneBoundary` in `scene-canvas.tsx` drops it and sets the flag read by `useSceneFailed()` (`components/three/scene-status.ts`). Cells then keep their stills and clicks navigate without the exit sequence.

### Home splash (`components/splash.tsx`)

On a direct visit to `/`, `Hero` renders `Splash`: a fixed `bg-background` overlay where a line-drawn door swings open and «دَرِت» slides out of its edge, the pair settling at the center (`splash-*` in `styles/animations.css`).

- The intro is pure CSS in the server HTML, so it plays before the JS arrives. «در حال بارگیری» (shimmer) fades in on its own 1.2s after the intro ends, so it still shows when the JS itself is what's slow.
- It lifts (500ms fade) once the intro has finished (`getAnimations().finished`) **and** the scene is ready (`Scenery`'s `onReady`, or `useSceneFailed()`), or after `GIVE_UP_AFTER` so a scene that never reports can't trap the page. `<noscript>` hides it.
- Client-side navigations to `/` render nothing: `useSyncExternalStore`'s server snapshot is only seen by the hydrating render.
- While it's up, `html:has([data-splash]:not([data-exiting]))` stops the page scrolling (`styles/globals.css`).

`components/three/door-scene.tsx` wraps each door: camera (fov 25, slightly off to the right so outward-swinging doors reveal the light), lights, the halo, and `OpenContext`, a damped `{ current: 0..1 }` the door parts read in `useFrame`. Props: `open` (target), `from` (initial), `distance`, `halo`.

## Result page (`components/door-result.tsx`)

- One hairline frame: greeting row with the gold «دَرِت» seal (a link home), «در {name}!», the punchline «حالا برو درتو بذار», the door's `description`, then share / random / all-doors and the donate row. The door sits on the far side, shut (`open={0}`).
- The punchline is the point of the site: it outranks everything on the page, and the `description` stays small and dim after it.

## Exit sequence (`components/door-picker.tsx`)

`DoorPicker` wraps a page of doors: the home page (`Hero` + `DoorGrid`) and the door page (`DoorResult` + `RelatedDoors`). It provides the state to every `DoorCell` inside it through `PickerContext`, plus `LeavingContext` for the hero. What should fade during the exit carries `group-data-leaving/page:opacity-0`. A door that isn't a cell, like the result page's (`components/result-door.tsx`), reads `useExitState()` and covers itself like a dismissed cell, because fading the DOM doesn't hide what the canvas draws.

`Leaving` state drives everything; `choose()` is an async timeline:

1. `{ slug }`: page scales to 0.94 around the chosen door, hero/labels/grid lines fade, other cells' covers fade in. 450ms.
2. `{ slug, flight }`: a `fixed` motion box mounts at the chosen cell's rect with its own `DoorView`; other cells unmount their views (covers still on). 50ms, so both draw the chosen door at the same spot.
3. `{ …, handedOff: true }`: the cell's view and all covers unmount; the box flies to the center (door opens to 1), then scales ×2.6 while a full-screen `bg-light` overlay fades in.
4. `router.push('/door/[slug]')`. The result page starts with its own `bg-light` overlay (`ArrivalLight`, `animate-flash-out`), so the light carries across the cut. `choose()` marks the navigation first (`markArrivalThroughLight()`); every other arrival (direct visit, other links, back/forward, no WebGL, reduced motion) has no overlay.

Modified clicks (new tab etc.) and `prefers-reduced-motion` skip the sequence and navigate normally.

## Styling

- Tailwind v4 + shadcn (`base-nova`, Base UI). Tokens in `styles/theme.css`; `--radius: 0` (sharp, border-line design).
- `--light` / `bg-light` is the color behind every door. Keep it in sync with `LIGHT_COLOR` in `components/three/parts.tsx`.
- Animations (`scroll-cue`, `flash-out`, `rise`, `stamp`, `shimmer`) live in `styles/animations.css`. Motion is kept to the hero, the door-choice sequence, the result page's light (`flash-out`) and seal (`stamp`); grid cells and result-page text don't animate in. `text-glow` (in `styles/globals.css`) is the light glowing off a line of text.
- Font: Vazirmatn (`app/layout.tsx`). Persian digits via `toLocaleString("fa-IR")`.

## Social images and door stills

All captured from `/og` (`app/og/page.tsx` + `app/og/social-card.tsx`), a dev-only page built from the real site, by `scripts/door-images.ts` (Playwright + Chrome, with `pnpm dev` running). It is not `next/og`, because satori can't shape Persian text, doesn't read the woff2 fonts and can't draw WebGL. In production `/og` is a 404 and `noindex`.

| Query           | Output                                                                      | Used by                                                                           |
| --------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| none            | `app/opengraph-image.png` (1200x630), `app/twitter-image.png` (1200x600)    | Next's file convention, for every page without its own images                     |
| `?door=<slug>`  | `public/social/<slug>.jpg` (1200x630)                                       | the door page's `openGraph`/`twitter` images (`doorSocialImage`)                  |
| `?still=<slug>` | `public/doors/<slug>.jpg` (450x800, the door shut, framed like a grid cell) | grid cell placeholders (also the no-WebGL fallback), `RelatedDoors` (`doorStill`) |

- `node scripts/door-images.ts` captures everything; `node scripts/door-images.ts <slug>…` only those doors. Rerun it for a door whose model changes.
- `/og` sets `data-ready` on `<html>` once every view on it has drawn; the script waits for it, then a few frames more.
- Don't force `preserveDrawingBuffer` for these captures: the transparent halo then blends over itself every frame and comes out blown out.
- Update `app/*.alt.txt` if the doors on the site card change.

Door pages set their own `openGraph`/`twitter` objects, which replace the layout's, so `app/door/[slug]/page.tsx` spreads the shared base from `lib/config/metadata.ts`.

## Icons

- `app/icon.tsx`: 512px PNG via `next/og`, drawn as an SVG on a 32-unit grid (an ajar walnut door with the light behind it). Coordinates stay on even units so it stays crisp at 16px. `dynamic = "force-static"` is required by `output: "export"`.
- `app/favicon.ico`: the same SVG at 16/32/48px as 32-bit BGRA bitmap entries (Next's ICO decoder rejects RGB PNG entries). Regenerate it whenever `icon.tsx` changes: render the SVG to a canvas at each size and pack the pixels into an ICO.
