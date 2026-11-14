import { ImageResponse } from "next/og";

import { config } from "@/lib/config";

/**
 * An ajar walnut door with the light behind it, on a 32-unit grid, as a square PNG. `app/favicon.ico` is the same
 * drawing rendered at 16/32/48px; regenerate it if this changes.
 *
 * `maskable` shrinks the door to 75% around the center, so it stays inside the 80% safe circle that launchers crop
 * maskable icons to; the background still bleeds to the edges.
 */
export function iconResponse(size: number, { maskable = false } = {}) {
  return new ImageResponse(
    <svg width={size} height={size} viewBox="0 0 32 32">
      <defs>
        <radialGradient id="glow" cx="50%" cy="56%" r="50%">
          <stop offset="0%" stopColor="#ffd59a" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#ffd59a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="32" height="32" fill={config.themeColor} />
      <rect width="32" height="32" fill="url(#glow)" />
      <g transform={maskable ? "translate(16 16) scale(0.75) translate(-16 -16)" : undefined}>
        {/* Frame, then the lit opening inside it */}
        <rect x="8" y="4" width="16" height="26" fill="#a1a1aa" />
        <rect x="10" y="6" width="12" height="24" fill="#ffd59a" />
        {/* Leaf swung toward the viewer on its left hinge, and its brass knob */}
        <polygon points="10,6 16,4 16,30 10,30" fill="#4b2c1a" />
        <rect x="14" y="16" width="2" height="2" fill="#e0b860" />
      </g>
    </svg>,
    { width: size, height: size },
  );
}

/** The manifest's icons, served by `app/icons/[file]/route.tsx` under real `.png` names so any static host types them. */
export const manifestIcons = {
  "icon-192.png": { size: 192, maskable: false },
  "icon-512.png": { size: 512, maskable: false },
  "maskable-512.png": { size: 512, maskable: true },
} as const;
