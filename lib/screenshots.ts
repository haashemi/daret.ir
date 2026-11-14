// The web app manifest's screenshots (`app/manifest.ts`), captured by `scripts/manifest-screenshots.ts` into
// `public/screenshots/<name>-<formFactor>.jpg`. Re-run the script after changing these.

/** Wide shots show in desktop install dialogs, narrow ones on mobile. */
export const screenshotFormFactors = {
  wide: { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, isMobile: false },
  narrow: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true },
} as const;

export const screenshots = [
  { name: "home", path: "/", label: "درِ سفید وسط آب" },
  { name: "grid", path: "/", scrollTo: "ul.grid", label: "کلکسیون درها" },
  { name: "door", path: "/door/walnut", label: "درِ کلاسیک گردویی، انتخاب‌شده" },
] as const;
