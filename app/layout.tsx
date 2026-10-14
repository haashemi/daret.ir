import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";

import { ViewTransition } from "react";

import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";
import { SceneCanvas } from "@/components/three/scene-canvas";
import { config } from "@/lib/config";
import { openGraph, twitter } from "@/lib/config/metadata";
import { danaFont } from "@/styles/fonts";

export const metadata: Metadata = {
  metadataBase: config.appHost,
  title: { default: config.appName, template: `%s | ${config.appName}` },
  description: config.appDescription,
  applicationName: config.appName,
  keywords: ["در", "درت", "درب", "درب ضدسرقت", "Daret"],
  openGraph,
  twitter,
  robots: { index: true, follow: true, "max-image-preview": "large" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className={danaFont.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <Providers>
          <SceneCanvas />
          <ViewTransition name="app-page">
            <div className="min-h-screen">
              <main className="container flex max-w-7xl flex-1 flex-col gap-6 px-4 pb-8">{children}</main>
              <Footer />
            </div>
          </ViewTransition>
        </Providers>
      </body>
    </html>
  );
}
