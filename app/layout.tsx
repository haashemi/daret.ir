import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";

import { cn } from "cn";
import { Vazirmatn } from "next/font/google";
import { ViewTransition } from "react";

import { HistoryTransitions } from "@/components/history-transitions";
import { Footer } from "@/components/layout/footer";
import { SceneCanvas } from "@/components/three/scene-canvas";
import { config } from "@/lib/config";
import { openGraph, twitter } from "@/lib/config/metadata";

export const vazirmatnFont = Vazirmatn({
  variable: "--font-sans",
  display: "swap",
  // Subsets let next/font preload the files; Persian is the `arabic` one.
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  metadataBase: config.appHost,
  alternates: { canonical: "/" },
  title: { default: config.appTitle, template: `%s | ${config.appName}` },
  description: config.appDescription,
  applicationName: config.appName,
  openGraph,
  twitter,
  robots: { index: true, follow: true, "max-image-preview": "large" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#09090b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className={cn(vazirmatnFont.variable, "dark")} data-scroll-behavior="smooth">
      <body>
        <SceneCanvas />
        <ViewTransition default="page-fade">
          <div className="flex min-h-screen flex-col gap-16 overflow-x-clip">
            <main className="container mx-auto flex max-w-7xl flex-1 flex-col gap-6 px-4 pb-8">{children}</main>
            <Footer />
          </div>
        </ViewTransition>
        <HistoryTransitions />
      </body>
    </html>
  );
}
