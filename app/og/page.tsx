import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { DoorView } from "@/components/door-view";
import { doors } from "@/lib/doors";

// Dev-only source of `app/opengraph-image.png` and `app/twitter-image.png`. See .agents/docs/architecture.md#social-images.
export const metadata: Metadata = { robots: { index: false } };

const shown = [
  { door: doors[0], open: 0 },
  { door: doors[7], open: 0.3 },
  { door: doors[8], open: 0 },
];

export default function SocialCardPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="fixed inset-0 flex items-center justify-between gap-12 px-20">
      {/* Keep the dev-tools badge out of the screenshot. */}
      <style>{"nextjs-portal { display: none; }"}</style>
      <div className="relative isolate flex flex-col items-start gap-6">
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 -z-10 size-120 -translate-1/2 rounded-full bg-light/10 blur-3xl"
        />
        <span className="border px-3 py-1 text-sm tracking-[0.3em] text-muted-foreground">کلکسیون ۱۴۰۵</span>
        {/* The kasra hangs below the tight line box; the padding keeps it off the tagline. */}
        <h1 className="pb-10 text-[9rem] leading-none font-black">دَرِت</h1>
        <p className="max-w-72 text-xl text-balance text-muted-foreground">
          درهای دست‌ساز، برای کسانی که فرق یک درِ خوب را می‌شناسند.
        </p>
        <span className="text-sm tracking-widest text-muted-foreground" dir="ltr">
          daret.ir
        </span>
      </div>
      <ul className="flex border-s border-t">
        {shown.map(({ door, open }, index) => (
          <li key={door.slug} className="w-52 border-e border-b p-4">
            <DoorView slug={door.slug} open={open} className="aspect-9/16 w-full" />
            <div className="mt-3 flex items-baseline justify-between border-t pt-3">
              <span className="text-sm font-medium">{door.name}</span>
              <span className="text-xs text-muted-foreground">
                {(index + 1).toLocaleString("fa-IR", { minimumIntegerDigits: 2 })}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
