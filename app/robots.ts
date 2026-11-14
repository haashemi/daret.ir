import type { MetadataRoute } from "next";

import { config } from "@/lib/config";

// Required by `output: "export"`.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${config.appHost}/sitemap.xml`,
    host: config.appHost,
  };
}
