"use client";

import { useSearchParams } from "next/navigation";
import { useRef } from "react";

import type { Door } from "@/lib/doors";

import { DoorView } from "@/components/door-view";
import { doors, findDoor } from "@/lib/doors";

const HOME_DOORS = [
  { slug: "walnut", open: 0 },
  { slug: "persian", open: 0.3 },
  { slug: "vault", open: 0 },
] as const;

/**
 * What `/og` shows, by query:
 * - none: the site's card (`app/opengraph-image.png`, `app/twitter-image.png`).
 * - `?door=<slug>`: that door's card (`public/social/<slug>.jpg`).
 * - `?still=<slug>`: the door shut, framed like its grid cell (`public/doors/<slug>.jpg`).
 * Sets `data-ready` on `<html>` once every door on it has drawn, for the capture script to wait on.
 */
export function SocialCard() {
  const params = useSearchParams();
  const card = findDoor(params.get("door") ?? "");
  const still = findDoor(params.get("still") ?? "");
  const onReady = useReadySignal(card || still ? 1 : HOME_DOORS.length);

  if (still) return <DoorView slug={still.slug} open={0} onReady={onReady} className="fixed inset-0" />;
  if (card) return <DoorCard door={card} onReady={onReady} />;

  return <HomeCard onReady={onReady} />;
}

function useReadySignal(count: number) {
  const drawn = useRef(0);

  return () => {
    drawn.current += 1;
    if (drawn.current === count) document.documentElement.dataset["ready"] = "";
  };
}

function HomeCard({ onReady }: { onReady: () => void }) {
  const shown = HOME_DOORS.map(({ slug, open }) => ({ door: doors.find((door) => door.slug === slug)!, open }));

  return (
    <div className="fixed inset-0 flex items-center justify-between gap-12 px-20">
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
            <DoorView slug={door.slug} open={open} onReady={onReady} className="aspect-9/16 w-full" />
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

/** The result page in brief: the door's name, the punchline and the door itself, shut. */
function DoorCard({ door, onReady }: { door: Door; onReady: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center gap-12 p-14">
      <div className="flex flex-1 flex-col justify-between self-stretch border p-12">
        <span className="text-xl text-muted-foreground">در جدید خدمت شما</span>
        <div className="flex flex-col gap-4">
          <p className="text-6xl/tight font-extrabold text-balance">در {door.name}‌!</p>
          <p className="text-6xl/tight font-black text-balance text-light text-glow">حالا برو درتو بذار</p>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-4xl font-black">دَرِت</span>
          <span className="text-lg tracking-widest text-muted-foreground" dir="ltr">
            daret.ir
          </span>
        </div>
      </div>
      <DoorView
        slug={door.slug}
        open={0}
        distance={7.4}
        halo={[2.2, 3]}
        onReady={onReady}
        className="aspect-3/4 h-full"
      />
    </div>
  );
}
