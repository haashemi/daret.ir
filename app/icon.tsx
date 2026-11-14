import { iconResponse } from "@/lib/icon";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";
// Required by `output: "export"`.
export const dynamic = "force-static";

export default function Icon() {
  return iconResponse(size.width);
}
