import type { MetadataRoute } from "next";

import { config } from "@/lib/config";
import { manifestIcons } from "@/lib/icon";
import { screenshotFormFactors, screenshots } from "@/lib/screenshots";

// Required by `output: "export"`.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: config.appName,
    short_name: config.appName,
    description: config.appDescription,
    lang: "fa",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: config.themeColor,
    theme_color: config.themeColor,
    categories: ["entertainment"],
    icons: Object.entries(manifestIcons).map(([file, { size, maskable }]) => ({
      src: `/icons/${file}`,
      sizes: `${size}x${size}`,
      type: "image/png",
      purpose: maskable ? "maskable" : "any",
    })),
    screenshots: Object.entries(screenshotFormFactors).flatMap(([formFactor, { viewport, deviceScaleFactor }]) =>
      screenshots.map(({ name, label }) => ({
        src: `/screenshots/${name}-${formFactor}.jpg`,
        sizes: `${viewport.width * deviceScaleFactor}x${viewport.height * deviceScaleFactor}`,
        type: "image/jpeg",
        form_factor: formFactor as keyof typeof screenshotFormFactors,
        label,
      })),
    ),
  };
}
