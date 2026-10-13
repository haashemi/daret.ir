# Doors

Catalog: `lib/doors.ts` (server-safe `{ slug, name }[]`; grid order is shuffled per page load in `door-picker.tsx`, `name` is shown as «در {name}»).
Models: `components/doors/<slug>.tsx`, registered by slug in `components/doors/index.ts` (`Record<DoorSlug, ComponentType>`, so a missing model is a type error).

## Adding a door

1. Add `{ slug, name }` to `lib/doors.ts`.
2. Create `components/doors/<slug>.tsx` exporting a component with no props.
3. Register it in `components/doors/index.ts`.
4. Grid stays even at 3 and 5 columns only for multiples of 15; check the layout if the count changes.

## Coordinates and framing

- Meters. Standard opening `W = 0.9` x `H = 2.05`, centered on the origin: floor at `y = -H / 2`, front of a closed leaf near `z = 0`, viewer at `+z`.
- Views are 9:16. At the default camera distance the visible area at `z = 0` is about 1.55 wide by 2.75 tall; keep everything within `|x| < 0.75`, `y < 1.35`.
- Taller/shorter doors shift their group so they still stand on the floor (see `persian.tsx`, `fridge.tsx`, `hobbit.tsx`).

## Parts (`components/three/parts.tsx`)

| Part                        | Use                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `Box`, `Cylinder`, `Sphere` | Mesh + geometry with a shared `material`. `Cylinder` is upright; `rotation={[Math.PI / 2, 0, 0]}` faces the viewer. |
| `Frame`                     | Two jambs and a head around a `width` x `height` opening.                                                           |
| `Hinge`                     | Swings children **toward the viewer** by `angle * open`. Left hinge: leaf extends to `+x`; `side="right"`: to `-x`. |
| `Slide`                     | Moves children by `by * open` (elevator, shoji).                                                                    |
| `Backlight`                 | The light filling the opening (`width`/`height`, or `radius` for round doors).                                      |
| `OpenContext`               | Read `use(OpenContext).current` in `useFrame` for custom motion (vault wheel, cat flap, shutter, revolving).        |

Conventions:

- Materials are module-level `new MeshStandardMaterial(...)` constants, shared across every view of that door.
- Leaves swing outward so they never pass through the `Backlight` right behind the opening. Every door needs a `Backlight` sized to its opening, or the light shows around the frame.
- Typical leaf: `<Hinge at={[-W / 2, 0, 0.03]}>` with the leaf box at `[W / 2, 0, -0.025]`, sized `[W - 0.01, H - 0.01, 0.045]`. Details sit on the front face at `z ≈ 0..0.05`.
- Double doors use two `Hinge`s and a local `Leaf({ dir })` (`barn.tsx`, `persian.tsx`, `container.tsx`).
- `Hinge`s nest: a bi-fold is a `Hinge` holding a panel and a second `Hinge` at twice the angle on the other side (`bus.tsx`); `nested.tsx` puts doors in doors.
- Open amounts: grid `0`, hover/focus `0.2`, flight and result page `1`.
