import localFont from "next/font/local";

export const danaFont = localFont({
  src: [
    { path: "./fonts/Dana-Thin.woff2", weight: "100", style: "normal" },
    { path: "./fonts/Dana-UltraLight.woff2", weight: "200", style: "normal" },
    { path: "./fonts/Dana-Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/Dana-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Dana-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Dana-DemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Dana-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/Dana-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "./fonts/Dana-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});
