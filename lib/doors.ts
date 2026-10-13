// Server-safe door catalog. The 3D models live in `components/doors`, keyed by the same slug.
export const doors = [
  { slug: "walnut", name: "کلاسیک گردویی" },
  { slug: "white-panel", name: "سفید شش‌پنل" },
  { slug: "security", name: "ضدسرقت" },
  { slug: "prison", name: "زندان" },
  { slug: "restroom", name: "سرویس بهداشتی" },
  { slug: "frosted-glass", name: "شیشه‌ای مات" },
  { slug: "barn", name: "انباری" },
  { slug: "persian", name: "سنتی با کوبه" },
  { slug: "vault", name: "گاوصندوق" },
  { slug: "fridge", name: "یخچال" },
  { slug: "elevator", name: "آسانسور" },
  { slug: "shoji", name: "شوجی" },
  { slug: "hobbit", name: "هابیتی" },
  { slug: "closet", name: "کمد کرکره‌ای" },
  { slug: "container", name: "کانتینر" },
  { slug: "saloon", name: "کابویی" },
  { slug: "dutch", name: "دوتکه" },
  { slug: "revolving", name: "گردان" },
  { slug: "scifi", name: "فضایی" },
  { slug: "phone-booth", name: "باجه تلفن" },
  { slug: "pride", name: "پراید" },
  { slug: "cat-flap", name: "گربه‌رو" },
  { slug: "shutter", name: "کرکره مغازه" },
  { slug: "washing-machine", name: "لباسشویی" },
  { slug: "cardboard", name: "کارتنی" },
  { slug: "paranoid", name: "ده‌قفله" },
  { slug: "gaming", name: "گیمینگ" },
  { slug: "operating-room", name: "اتاق عمل" },
  { slug: "bus", name: "اتوبوس" },
  { slug: "pixel", name: "پیکسلی" },
  { slug: "chocolate", name: "شکلاتی" },
  { slug: "heaven", name: "بهشت" },
  { slug: "hell", name: "جهنم" },
  { slug: "boss", name: "اتاق رئیس" },
  { slug: "nested", name: "تودرتو" },
] as const;

export type Door = (typeof doors)[number];
export type DoorSlug = Door["slug"];

export function findDoor(slug: string): Door | undefined {
  return doors.find((door) => door.slug === slug);
}
