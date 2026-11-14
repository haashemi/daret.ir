import { cn } from "cn";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import type { Door } from "@/lib/doors";

import { ArrivalLight } from "@/components/arrival-light";
import { RandomDoorButton } from "@/components/random-door-button";
import { ResultDoor } from "@/components/result-door";
import { ShareButton } from "@/components/share-button";
import { buttonVariants } from "@/components/ui/button";

const stripButton = "h-15 w-full rounded-none text-[13px] hover:bg-light/8 max-sm:[&_svg]:hidden";

/**
 * The result page: one hairline frame, the text and actions on one side and the chosen door, shut, on the other.
 * The fading light is the page's entrance: everything is in place under it, so the punchline (the largest text, its
 * LCP) shows as the light clears. Only the seal moves, stamped once the light is mostly gone.
 */
export function DoorResult({ door }: { door: Door }) {
  return (
    <>
      <section className="flex min-h-svh items-center py-10">
        <div className="grid w-full border transition-colors duration-500 group-data-leaving/page:border-transparent md:grid-cols-[1.15fr_1fr]">
          <div className="flex min-w-0 flex-col transition-opacity duration-500 group-data-leaving/page:opacity-0">
            {/* The seal hangs a little past the row's borders, like a stamp pressed over the frame. */}
            <div className="relative border-b px-7 py-4.5 text-sm text-muted-foreground md:px-11">
              در جدید خدمت شما
              <DaretSeal className="absolute top-1/2 left-6 size-16 -translate-y-1/2 text-[13px] [animation-delay:1.1s] md:left-10" />
            </div>
            <div className="flex flex-1 flex-col justify-center gap-7 px-7 py-10 md:px-11 md:py-14">
              <div className="flex flex-col gap-4">
                <h1 className="text-4xl/tight font-extrabold text-balance md:text-5xl/tight">در {door.name}‌!</h1>
                {/* The punchline is the point of the site: it outranks everything else here. */}
                <p className="text-[2.5rem]/tight font-black text-balance text-light text-glow sm:text-5xl/tight md:text-6xl/tight">
                  حالا برو درتو بذار
                </p>
              </div>
              <p className="max-w-[44ch] text-[13px]/loose text-pretty text-muted-foreground/70">{door.description}</p>
            </div>
            <div className="grid grid-cols-3 border-t [&>*+*]:border-s">
              <div>
                <ShareButton name={door.name} variant="ghost" className={stripButton} />
              </div>
              <div>
                <RandomDoorButton current={door.slug} className={cn(stripButton, "text-muted-foreground")} />
              </div>
              <div>
                <Link
                  href="/"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "lg",
                    className: cn(stripButton, "text-muted-foreground"),
                  })}
                >
                  همه‌ی درها
                </Link>
              </div>
            </div>
            <a
              href="https://donofa.com/haashemi"
              target="_blank"
              rel="noreferrer noopener"
              className="group relative flex items-center justify-between gap-4 overflow-hidden border-t px-7 py-4.5 outline-none md:px-11"
            >
              {/* The light floods in from the start edge, like a door swinging open. */}
              <span
                aria-hidden
                className="absolute inset-0 origin-right scale-x-0 bg-light transition-transform duration-300 ease-snappy group-hover:scale-x-100 group-focus-visible:scale-x-100"
              />
              <span className="relative text-[13px] text-muted-foreground transition-colors duration-200 group-hover:text-background group-focus-visible:text-background">
                از درت خوشت اومد؟
              </span>
              <span className="relative flex items-center gap-2 text-sm font-black text-light transition-colors duration-200 group-hover:text-background group-focus-visible:text-background">
                دونیتمون کن
                <ArrowLeft className="size-4 transition-transform duration-300 ease-snappy group-hover:-translate-x-1 group-focus-visible:-translate-x-1" />
              </span>
            </a>
          </div>
          <div className="order-first grid place-items-center border-b p-6 transition-colors duration-500 group-data-leaving/page:border-transparent md:order-0 md:border-s md:border-b-0">
            {/* Shut: putting it in is the owner's job. */}
            <ResultDoor slug={door.slug} className="aspect-3/4 w-full max-w-95" />
          </div>
        </div>
      </section>
      {/* The page arrives through the light the home page flooded the screen with. */}
      <ArrivalLight />
    </>
  );
}

/**
 * The site's gold wax seal; it links home. Size, position and timing come from `className`.
 * The link carries the entrance stamp and the resting tilt, the face inside it the hover and press, so the
 * entrance's fill never pins the properties the hover transitions.
 */
function DaretSeal({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="دَرِت، همه‌ی درها"
      className={cn(
        "group/seal relative block -rotate-12 animate-stamp rounded-full outline-light focus-visible:outline-2 focus-visible:outline-offset-4",
        className,
      )}
    >
      {/* Hover straightens and lifts the seal; pressing pushes it down like stamping it again. */}
      <span className="relative grid size-full place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,color-mix(in_oklab,var(--light),white_45%),var(--light)_45%,color-mix(in_oklab,var(--light),black_18%))] font-black text-background shadow-[0_8px_24px_rgb(0_0_0/0.45)] transition-[rotate,scale,box-shadow] duration-250 ease-snappy group-hover/seal:scale-108 group-hover/seal:rotate-12 group-hover/seal:shadow-[0_14px_32px_rgb(0_0_0/0.5),0_0_32px_color-mix(in_oklab,var(--light)_35%,transparent)] group-focus-visible/seal:rotate-12 group-active/seal:scale-92 group-active/seal:shadow-[0_3px_8px_rgb(0_0_0/0.5)] group-active/seal:duration-100">
        <span aria-hidden className="absolute inset-2 rounded-full border border-dashed border-background/40" />
        دَرِت
      </span>
    </Link>
  );
}
