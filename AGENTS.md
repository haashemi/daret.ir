<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project docs

Read the doc for the area you touch before changing it:

- [.agents/docs/architecture.md](.agents/docs/architecture.md): routes, the single shared WebGL canvas (doors draw *under* the DOM), the door-choice exit sequence, styling tokens, known config issue.
- [.agents/docs/doors.md](.agents/docs/doors.md): door catalog and 3D models: adding a door, coordinates/framing, `parts.tsx` building blocks.

Map: `lib/doors.ts` (catalog) · `components/doors/*` (one 3D model per door) · `components/three/*` (canvas, scene, parts) · `components/door-picker.tsx` (grid + exit sequence) · `components/door-view.tsx` · `app/door/[slug]/page.tsx` (result).
