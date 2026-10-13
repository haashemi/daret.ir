# Architecture

A Persian (RTL, `lang="fa"`, forced dark theme) single-purpose meme site: a luxury-looking door catalog where choosing a door ends in «اینم از در جدیدت / در {name} / حالا بذارش!».

## Routes

| Route          | File                       | What                                                                                  |
| -------------- | -------------------------- | ------------------------------------------------------------------------------------- |
| `/`            | `app/page.tsx`             | Server hero, passed as `children` to the client `DoorPicker` (grid + exit sequence).  |
| `/door/[slug]` | `app/door/[slug]/page.tsx` | Result page. `generateStaticParams` from `lib/doors.ts`; unknown slugs `notFound()`.  |

- Next 16 with `cacheComponents`: `dynamicParams` is not allowed (use `notFound()`), and pages that read `params` outside `<Suspense>` export `instant = false`.
- Next keeps visited pages mounted but hidden (`<Activity>`), so transient UI state is reset in a `useLayoutEffect` cleanup (see `DoorPicker`).

## 3D rendering: one canvas, many views

- `components/three/scene-canvas.tsx` mounts the **only** WebGL canvas (in `app/layout.tsx`), `position: fixed`, `z-index: -1`, `pointer-events: none`.
- `components/door-view.tsx` renders drei's `<View>`: a DOM box whose screen rect the canvas draws into each frame (scissored). Size and position doors with ordinary CSS on that box; CSS transforms (scale, motion) are followed too.
- **The canvas is under the DOM.** Any element with a background above a door hides it. That's how the grid's reveal/dismiss "covers" work (each cover also holds a shimmering door placeholder until `DoorScene` calls `onReady` on its first frame), and why page containers must stay transparent.
- `SceneAssetsContext` (environment map + halo texture) is built once per renderer in the canvas and reaches every view because views render through `View.Port`.
- Views with a higher `index` draw later (the flying door uses `index={2}`).

`components/three/door-scene.tsx` wraps each door: camera (fov 25, slightly off to the right so outward-swinging doors reveal the light), lights, the halo, and `OpenContext`, a damped `{ current: 0..1 }` the door parts read in `useFrame`. Props: `open` (target), `from` (initial), `distance`, `halo`.

## Exit sequence (`components/door-picker.tsx`)

`Leaving` state drives everything; `choose()` is an async timeline:

1. `{ slug }`: page scales to 0.94 around the chosen door, hero/labels/grid lines fade, other cells' covers fade in. 450ms.
2. `{ slug, flight }`: a `fixed` motion box mounts at the chosen cell's rect with its own `DoorView`; other cells unmount their views (covers still on). 50ms, so both draw the chosen door at the same spot.
3. `{ …, handedOff: true }`: the cell's view and all covers unmount; the box flies to the center (door opens to 1), then scales ×2.6 while a full-screen `bg-light` overlay fades in.
4. `router.push('/door/[slug]')`. The result page starts with its own `bg-light` overlay (`animate-flash-out`), so the light carries across the cut.

Modified clicks (new tab etc.) and `prefers-reduced-motion` skip the sequence and navigate normally.

## Styling

- Tailwind v4 + shadcn (`base-nova`, Base UI). Tokens in `styles/theme.css`; `--radius: 0` (sharp, border-line design).
- `--light` / `bg-light` is the color behind every door. Keep it in sync with `LIGHT_COLOR` in `components/three/parts.tsx`.
- Animations (`scroll-cue`, `flash-out`, `rise`) live in `styles/animations.css`.
- Font: Dana (`styles/fonts.ts`). Persian digits via `toLocaleString("fa-IR")`.

## Social images

`app/opengraph-image.png` (1200x630) and `app/twitter-image.png` (1200x600), with `*.alt.txt`, are static files picked up by Next's file convention. They are screenshots of `app/og/page.tsx` (`/og`), a dev-only composition built from the real site: hero type and three grid cells with live 3D doors. It is not `next/og`, because satori can't shape Persian text, doesn't read the woff2 fonts and can't draw WebGL. In production `/og` is a 404 and `noindex`.

To change them, edit `app/og/page.tsx`, then capture it:

1. `pnpm dev` and open `/og` in Chrome. The dev-tools badge is hidden on that page.
2. DevTools → device toolbar → Responsive, set **1200 x 630**, DPR 1 → ⋮ → *Capture screenshot* → save as `app/opengraph-image.png`.
3. Repeat at **1200 x 600** for `app/twitter-image.png`.

Headless `chrome --screenshot` leaves the doors blank because its virtual time never paints WebGL; use a real browser or Playwright with a real wait. Update `*.alt.txt` if the doors shown change.

Door pages set their own `openGraph`/`twitter` titles. Setting those objects replaces the layout's, so `app/door/[slug]/page.tsx` spreads the shared base from `lib/config/metadata.ts` and carries over the parent's resolved images.

## Icons

- `app/icon.tsx`: 512px PNG via `next/og`, drawn as an SVG on a 32-unit grid (an ajar walnut door with the light behind it). Coordinates stay on even units so it stays crisp at 16px. `dynamic = "force-static"` is required by `output: "export"`.
- `app/favicon.ico`: the same SVG at 16/32/48px as 32-bit BGRA bitmap entries (Next's ICO decoder rejects RGB PNG entries). Regenerate it whenever `icon.tsx` changes: render the SVG to a canvas at each size and pack the pixels into an ICO.

## Known config issue

`next.config.ts` combines `output: "export"` with `cacheComponents`; Next's export step rejects that (`Invariant: PPR cannot be enabled in export mode`) after prerendering succeeds. Pick one: drop `cacheComponents` (and the `instant` exports) for a static `out/`, or drop `output: "export"` and serve with `next start` / standalone.
