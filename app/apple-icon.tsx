import { iconResponse } from "@/lib/icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";
// Required by `output: "export"`.
export const dynamic = "force-static";

/** The home-screen icon on iOS, which ignores the manifest's icons. */
export default function AppleIcon() {
  return iconResponse(size.width);
}
