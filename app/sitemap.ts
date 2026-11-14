import type { MetadataRoute } from "next";

import { config } from "@/lib/config";
import { doors } from "@/lib/doors";

// Required by `output: "export"`.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: config.appHost, changeFrequency: "weekly", priority: 1 },
    ...doors.map(({ slug }) => ({
      url: `${config.appHost}/door/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
