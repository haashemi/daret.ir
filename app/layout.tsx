import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";

import { ViewTransition } from "react";

import { Providers } from "@/components/providers";
import { config } from "@/lib/config";
import { danaFont } from "@/styles/fonts";

export const metadata: Metadata = {
  metadataBase: config.appHost,
  title: { default: config.appName, template: `%s | ${config.appName}` },
  description: config.appDescription,
  applicationName: config.appName,
  keywords: ["تقویم", "تعطیلی", "مناسبت", "روزهای کاری", "تقویم شمسی", "Keyeh"],
  openGraph: {
    type: "website",
    siteName: config.appName,
    url: config.appHost,
    title: config.appName,
    description: config.appDescription,
  },
  twitter: { card: "summary", title: config.appName, description: config.appDescription },
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
          <div className="flex min-h-svh flex-col items-center gap-6 pb-6">
            <ViewTransition name="app-page">
              <main className="container flex max-w-7xl flex-1 flex-col gap-6 px-4">{children}</main>
            </ViewTransition>
          </div>
        </Providers>
      </body>
    </html>
  );
}
