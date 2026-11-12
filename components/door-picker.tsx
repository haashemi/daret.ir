"use client";

import type { MouseEvent, ReactNode, RefObject } from "react";

import { cn } from "cn";
import { motion, useInView, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

import type { Door, DoorSlug } from "@/lib/doors";

import { DoorView } from "@/components/door-view";
import { useSceneFailed } from "@/components/three/scene-status";
import { doors, isNewDoor } from "@/lib/doors";

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Leaving {
  slug: DoorSlug;
  /** Set once the other doors are covered: the chosen door leaves the grid and flies to the center. */
  flight?: { from: Box; to: Box };
  /** The canvas draws doors under the DOM, so the chosen door can't be covered in its cell. It stays there for a few
   * frames after the flight box mounts, both drawing it at the same spot, and is removed once the flight is drawn. */
  handedOff?: boolean;
}

/** `true` once a door is chosen and the page is fading out, for the hero to fade what the canvas draws behind it. */
export const LeavingContext = createContext(false);
LeavingContext.displayName = "LeavingContext";

const HOVER_OPEN = 0.2;
const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

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

function toBox({ top, left, width, height }: DOMRect): Box {
  return { top, left, width, height };
}

function centeredBox(): Box {
  const height = Math.min(window.innerHeight * 0.62, window.innerWidth * 0.9 * (16 / 9));
  const width = height * (9 / 16);

  return { top: (window.innerHeight - height) / 2, left: (window.innerWidth - width) / 2, width, height };
}

/**
 * The hero (`children`) and the door grid. Choosing a door runs the exit sequence, then navigates:
 * 1. The page scales out around the door while the other doors are covered and the text fades.
 * 2. The door is handed to a fixed box that flies to the center while the door swings open.
 * 3. The box scales up into the light, the screen floods with it, and `/door/[slug]` takes over.
 */
export function DoorPicker({ children }: { children: ReactNode }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const sceneFailed = useSceneFailed();
  const pageRef = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState<Leaving>();
  const [origin, setOrigin] = useState("50% 50%");
  const order = useSyncExternalStore(subscribe, getShuffled, getCatalog);

  // Next keeps this page mounted but hidden after navigating away; come back to a fresh grid.
  useLayoutEffect(() => () => setLeaving(undefined), []);

  async function choose(event: MouseEvent, slug: DoorSlug, box: HTMLElement) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (reduceMotion || sceneFailed) return;
    event.preventDefault();
    if (leaving) return;

    const rect = box.getBoundingClientRect();
    const page = pageRef.current?.getBoundingClientRect() ?? rect;
    setOrigin(`${rect.left + rect.width / 2 - page.left}px ${rect.top + rect.height / 2 - page.top}px`);
    setLeaving({ slug });
    await wait(450);

    const flight = { from: toBox(box.getBoundingClientRect()), to: centeredBox() };
    setLeaving({ slug, flight });
    await wait(50);

    setLeaving({ slug, flight, handedOff: true });
    await wait(1550);

    router.push(`/door/${slug}`);
  }

  return (
    <>
      <div
        ref={pageRef}
        data-leaving={leaving ? "" : undefined}
        style={{ transformOrigin: origin }}
        className="group/page flex flex-col gap-16 transition-[scale] duration-700 ease-in-out data-leaving:scale-[0.94]"
      >
        <div className="transition-opacity duration-500 group-data-leaving/page:opacity-0">
          <LeavingContext value={Boolean(leaving)}>{children}</LeavingContext>
        </div>
        <ul className="grid grid-cols-2 border-s border-t transition-colors duration-500 group-data-leaving/page:border-transparent md:grid-cols-3 xl:grid-cols-5">
          {order.map((door, index) => (
            <DoorCell key={door.slug} door={door} index={index} leaving={leaving} onChoose={choose} />
          ))}
          <SuggestCell />
        </ul>
      </div>

      {leaving?.flight && (
        <>
          <motion.div
            className="fixed"
            initial={{ ...leaving.flight.from }}
            animate={{ ...leaving.flight.to, scale: 2.6 }}
            transition={{
              default: { delay: 0.06, duration: 0.85, ease: EASE_IN_OUT },
              scale: { delay: 0.95, duration: 0.7, ease: [0.55, 0, 1, 0.45] },
            }}
          >
            <DoorView slug={leaving.slug} open={1} from={HOVER_OPEN} index={2} className="size-full" />
          </motion.div>
          <motion.div
            className="pointer-events-none fixed inset-0 bg-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5, ease: "easeIn" }}
          />
        </>
      )}
    </>
  );
}

interface DoorCellProps {
  door: Door;
  index: number;
  leaving: Leaving | undefined;
  onChoose: (event: MouseEvent, slug: DoorSlug, box: HTMLElement) => void;
}

/** What the exit sequence does to one cell. */
function exitState(leaving: Leaving | undefined, slug: DoorSlug) {
  if (!leaving) return { chosen: false, dismissed: false, showView: true, showCover: true };

  const chosen = leaving.slug === slug;
  // Covers sit above the canvas and would cut into the flying door, so dismissed doors go first, then their covers.
  return {
    chosen,
    dismissed: !chosen,
    showView: chosen ? !leaving.handedOff : !leaving.flight,
    showCover: !leaving.handedOff,
  };
}

/**
 * Door-shaped placeholder inside a cell's cover, roughly where the door's frame lands. It shimmers until the door is
 * drawn, then cross-fades into it with the cover. Hidden on the covers that dismiss the other doors.
 */
function DoorPlaceholder({ hidden, loading }: { hidden: boolean; loading: boolean }) {
  if (hidden) return null;

  return (
    <div
      className={cn(
        "absolute inset-x-[16%] top-[10%] bottom-[14%] bg-muted",
        loading && "animate-shimmer bg-linear-to-l from-muted via-muted-foreground/15 to-muted bg-size-[200%_100%]",
      )}
    />
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

function DoorCell({ door, index, leaving, onChoose }: DoorCellProps) {
  const ref = useRef<HTMLLIElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [hovered, setHovered] = useState(false);
  const [ready, setReady] = useState(false);
  const sceneFailed = useSceneFailed();

  const { chosen, dismissed, showView, showCover } = exitState(leaving, door.slug);
  const ajar = useAjar(boxRef, hovered || chosen);
  // A cover the color of the page hides the door: before it scrolls into view, while the canvas is still loading it,
  // and when another door is chosen.
  const covered = !inView || !ready || dismissed;
  // Doors reveal one by one across a row.
  const stagger = leaving ? 0 : (index % 4) * 120;

  return (
    <li
      ref={ref}
      className="border-e border-b transition-colors duration-500 group-data-leaving/page:border-transparent"
    >
      <Link
        href={`/door/${door.slug}`}
        aria-label={`در ${door.name}`}
        className="group block p-3 -outline-offset-2 outline-light focus-visible:outline-2 md:p-6"
        onClick={(event) => boxRef.current && onChoose(event, door.slug, boxRef.current)}
        onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <div ref={boxRef} className="relative aspect-9/16">
          {showView && (
            <DoorView
              slug={door.slug}
              open={ajar ? HOVER_OPEN : 0}
              onReady={() => setReady(true)}
              className="absolute inset-0"
            />
          )}
          {showCover && (
            <div
              className={cn(
                "absolute inset-0 bg-background transition-opacity",
                covered ? "opacity-100" : "opacity-0",
                leaving ? "duration-400" : "duration-700",
              )}
              style={{ transitionDelay: `${stagger}ms` }}
            >
              <DoorPlaceholder hidden={Boolean(leaving)} loading={!ready && !sceneFailed} />
            </div>
          )}
        </div>
        <div
          className={cn(
            "mt-3 flex items-baseline justify-between gap-2 border-t pt-3 transition duration-700 group-focus-visible:border-foreground md:mt-6",
            inView && !leaving ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
          )}
          style={{ transitionDelay: `${leaving ? 0 : stagger + 200}ms` }}
        >
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
        "flex flex-col items-center justify-center gap-4 border-e border-b p-6 text-center transition duration-500 group-data-leaving/page:border-transparent group-data-leaving/page:opacity-0",
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
