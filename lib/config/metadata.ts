import type { Metadata } from "next";

import { config } from ".";

// A page that sets `openGraph` or `twitter` replaces the layout's object entirely, so pages spread these to keep the rest.
export const openGraph = {
  type: "website",
  siteName: config.appName,
  url: config.appHost,
  title: config.appName,
  description: config.appDescription,
} satisfies Metadata["openGraph"];

export const twitter = {
  card: "summary_large_image",
  title: config.appName,
  description: config.appDescription,
} satisfies Metadata["twitter"];
