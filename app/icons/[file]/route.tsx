import { notFound } from "next/navigation";

import { iconResponse, manifestIcons } from "@/lib/icon";

// Required by `output: "export"`.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(manifestIcons).map((file) => ({ file }));
}

export async function GET(_request: Request, { params }: RouteContext<"/icons/[file]">) {
  const { file } = await params;
  if (!Object.hasOwn(manifestIcons, file)) notFound();
  const { size, maskable } = manifestIcons[file as keyof typeof manifestIcons];
  return iconResponse(size, { maskable });
}
