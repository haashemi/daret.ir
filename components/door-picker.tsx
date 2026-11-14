"use client";

import type { ReactNode, RefObject } from "react";

import { cn } from "cn";
import { useInView } from "motion/react";
import Link from "next/link";
import { createContext, use, useLayoutEffect, useRef, useState, useSyncExternalStore, ViewTransition } from "react";

import type { Door, DoorSlug } from "@/lib/doors";

import { DoorView } from "@/components/door-view";
import { DOOR_MORPH, DOOR_TRANSITION, doorMorphName, markDoorMorph } from "@/components/result-door";
import { useSceneFailed } from "@/components/three/scene-status";
import { doors, doorStill, isNewDoor } from "@/lib/doors";

/** The chosen door's slug, for the cells inside a `DoorPicker`. */
const PickerContext = createContext<{ chosen: DoorSlug | undefined; choose: (slug: DoorSlug) => void } | null>(null);
PickerContext.displayName = "PickerContext";

function usePicker() {
  const picker = use(PickerContext);
  if (!picker) throw new Error("Door cells must be inside a DoorPicker.");

  return picker;
}

const HOVER_OPEN = 0.2;

// A fresh order per page load, new doors first. Only read on the client, so the server and hydration keep the
// catalog order (which also lists new doors first).
let shuffled: readonly Door[] | undefined;
const getShuffled = () =>
  (shuffled ??= doors
    .map((door) => ({ door, key: Math.random() - (isNewDoor(door) ? 1 : 0) }))
    .toSorted((a, b) => a.key - b.key)
    .map(({ door }) => door));
const getCatalog = () => doors;
// Nothing to subscribe to: the order never changes after the first read.
const subscribe = () => () => undefined;

// Touch devices have no hover, so their doors open as they cross the middle of the screen instead.
const NO_HOVER = "(hover: none)";

const subscribeNoHover = (onChange: () => void) => {
  const query = window.matchMedia(NO_HOVER);
  query.addEventListener("change", onChange);

  return () => query.removeEventListener("change", onChange);
};

const getNoHover = () => window.matchMedia(NO_HOVER).matches;
const getNoHoverOnServer = () => false;

/**
 * A page of doors to choose from: `children` holds them (`DoorGrid`, `DoorCell`s) along with whatever else is on the
 * page. Choosing a door swaps its 3D view for its still, which the navigation's view transition morphs into the door
 * page's (`ResultDoor`) while the rest of the page cross-fades.
 */
export function DoorPicker({ children }: { children: ReactNode }) {
  const [chosen, setChosen] = useState<DoorSlug>();

  // Next keeps this page mounted but hidden after navigating away; come back to a fresh grid.
  useLayoutEffect(() => () => setChosen(undefined), []);

  function choose(slug: DoorSlug) {
    setChosen(slug);
    markDoorMorph();
  }

  // eslint-disable-next-line @eslint-react/no-unstable-context-value -- React Compiler memoizes it.
  return <PickerContext value={{ chosen, choose }}>{children}</PickerContext>;
}

/** The home page's grid: every door, in a fresh order per page load, closed by the suggestion cell. */
export function DoorGrid() {
  const order = useSyncExternalStore(subscribe, getShuffled, getCatalog);

  return (
    <ul className="grid grid-cols-2 border-s border-t md:grid-cols-3 xl:grid-cols-5">
      {order.map((door, index) => (
        <DoorCell key={door.slug} door={door} index={index} />
      ))}
      <SuggestCell />
    </ul>
  );
}

/**
 * What a cell's cover shows until its door is drawn: a still of the door, shut (`doorStill`), over a door-shaped
 * shimmer while the still loads. The still matches the first frame, so the cover's fade into the 3D door is seamless,
 * and it stays as the door when there is no WebGL. It is also what flies to the door page once the door is chosen.
 */
function DoorPlaceholder({ door, loading }: { door: Door; loading: boolean }) {
  return (
    <>
      <div
        className={cn(
          "absolute inset-x-[16%] top-[10%] bottom-[14%] bg-muted",
          loading && "animate-shimmer bg-linear-to-l from-muted via-muted-foreground/15 to-muted bg-size-[200%_100%]",
        )}
      />
      <img
        src={doorStill(door.slug)}
        alt={`در ${door.name}`}
        width={450}
        height={800}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full"
      />
    </>
  );
}

/** Whether a cell's door stands ajar: `active` (pointed at, focused or chosen), or on touch devices while it crosses the middle of the screen. */
function useAjar(boxRef: RefObject<HTMLDivElement | null>, active: boolean) {
  const noHover = useSyncExternalStore(subscribeNoHover, getNoHover, getNoHoverOnServer);
  // A band 20% of the viewport tall, centered: with two columns that is one row at a time.
  const centered = useInView(boxRef, { margin: "-40% 0px -40% 0px" });

  return active || (noHover && centered);
}

/** «جدید» next to the name of a door marked `isNew` in the catalog. */
function NewBadge({ door }: { door: Door }) {
  if (!isNewDoor(door)) return null;

  return (
    <span className="bg-light px-1.5 py-0.5 text-[0.625rem] leading-none font-bold text-background md:text-xs">
      جدید
    </span>
  );
}

/** One door to choose, with its label. Must be inside a `DoorPicker`. */
export function DoorCell({ door, index }: { door: Door; index: number }) {
  const picker = usePicker();
  const boxRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [ready, setReady] = useState(false);
  const sceneFailed = useSceneFailed();

  // The canvas draws under the DOM and can't be captured with the page, so the chosen door shows its still instead.
  const chosen = picker.chosen === door.slug;
  const ajar = useAjar(boxRef, hovered);

  return (
    <li className="border-e border-b">
      <Link
        href={`/door/${door.slug}`}
        transitionTypes={[DOOR_TRANSITION]}
        aria-label={`در ${door.name}`}
        className="group block p-3 -outline-offset-2 outline-light focus-visible:outline-2 md:p-6"
        onClick={(event) => {
          if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
            picker.choose(door.slug);
          }
        }}
        onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <div ref={boxRef} className="relative aspect-9/16">
          {!chosen && (
            <DoorView
              slug={door.slug}
              open={ajar ? HOVER_OPEN : 0}
              onReady={() => setReady(true)}
              className="absolute inset-0"
            />
          )}
          <ViewTransition name={chosen ? doorMorphName(door.slug) : undefined} share={DOOR_MORPH} default="none">
            <div
              className={cn(
                "absolute inset-0 bg-background",
                !chosen && "transition-opacity duration-200",
                ready && !chosen && "opacity-0",
              )}
            >
              <DoorPlaceholder door={door} loading={!ready && !sceneFailed} />
            </div>
          </ViewTransition>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-2 border-t pt-3 group-focus-visible:border-foreground md:mt-6">
          <span className="flex items-center gap-2 text-sm font-medium md:text-base">
            {door.name}
            <NewBadge door={door} />
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {(index + 1).toLocaleString("fa-IR", { minimumIntegerDigits: 2 })}
          </span>
        </div>
      </Link>
    </li>
  );
}

// Spans the columns left over in the last row, per breakpoint (2 / 3 / 5 columns), or a whole row of its own when the
// last row is full. Indexed by `left(columns)`; full class names so Tailwind can see them.
const FILL_BASE = ["col-span-2", "col-span-1"] as const;
const FILL_MD = ["md:col-span-3", "md:col-span-1", "md:col-span-2"] as const;
const FILL_XL = ["xl:col-span-5", "xl:col-span-1", "xl:col-span-2", "xl:col-span-3", "xl:col-span-4"] as const;

const left = (columns: number) => (columns - (doors.length % columns)) % columns;

/** Always shown: closes the last row of the grid, whatever the number of doors, and asks for the next one. */
function SuggestCell() {
  return (
    <li
      className={cn(
        "flex flex-col items-center justify-center gap-4 border-e border-b p-6 text-center",
        FILL_BASE[left(2)],
        FILL_MD[left(3)],
        FILL_XL[left(5)],
      )}
    >
      <p className="text-sm font-medium md:text-base">درِ دلخواهت اینجا نیست؟</p>
      <a
        href="https://github.com/haashemi/daret.ir/issues/new"
        target="_blank"
        rel="noreferrer noopener"
        className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
      >
        پیشنهادش بده
      </a>
    </li>
  );
}
