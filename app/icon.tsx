import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";
// Required by `output: "export"`.
export const dynamic = "force-static";

/**
 * An ajar walnut door with the light behind it, on a 32-unit grid. `app/favicon.ico` is the same
 * drawing rendered at 16/32/48px; regenerate it if this changes.
 */
export default function Icon() {
  return new ImageResponse(
    <svg width={size.width} height={size.height} viewBox="0 0 32 32">
      <defs>
        <radialGradient id="glow" cx="50%" cy="56%" r="50%">
          <stop offset="0%" stopColor="#ffd59a" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#ffd59a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="32" height="32" fill="#09090b" />
      <rect width="32" height="32" fill="url(#glow)" />
      {/* Frame, then the lit opening inside it */}
      <rect x="8" y="4" width="16" height="26" fill="#a1a1aa" />
      <rect x="10" y="6" width="12" height="24" fill="#ffd59a" />
      {/* Leaf swung toward the viewer on its left hinge, and its brass knob */}
      <polygon points="10,6 16,4 16,30 10,30" fill="#4b2c1a" />
      <rect x="14" y="16" width="2" height="2" fill="#e0b860" />
    </svg>,
    size,
  );
}
