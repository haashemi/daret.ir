"use client";

import type { MouseEvent, ReactNode } from "react";

import { cn } from "cn";
import { motion, useInView, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

import type { Door, DoorSlug } from "@/lib/doors";

import { DoorView } from "@/components/door-view";
import { doors } from "@/lib/doors";

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

const HOVER_OPEN = 0.2;
const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

// A fresh order per page load. Only read on the client, so the server and hydration keep the catalog order.
let shuffled: readonly Door[] | undefined;
const getShuffled = () =>
  (shuffled ??= doors
    .map((door) => ({ door, key: Math.random() }))
    .toSorted((a, b) => a.key - b.key)
    .map(({ door }) => door));
const getCatalog = () => doors;
// Nothing to subscribe to: the order never changes after the first read.
const subscribe = () => () => undefined;

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
  const pageRef = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState<Leaving>();
  const [origin, setOrigin] = useState("50% 50%");
  const order = useSyncExternalStore(subscribe, getShuffled, getCatalog);

  // Next keeps this page mounted but hidden after navigating away; come back to a fresh grid.
  useLayoutEffect(() => () => setLeaving(undefined), []);

  async function choose(event: MouseEvent, slug: DoorSlug, box: HTMLElement) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (reduceMotion) return;
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
        className="group/page transition-[scale] duration-700 ease-in-out data-leaving:scale-[0.94]"
      >
        <div className="transition-opacity duration-500 group-data-leaving/page:opacity-0">{children}</div>
        <ul className="grid grid-cols-2 border-s border-t transition-colors duration-500 group-data-leaving/page:border-transparent md:grid-cols-3 xl:grid-cols-5">
          {order.map((door, index) => (
            <DoorCell key={door.slug} door={door} index={index} leaving={leaving} onChoose={choose} />
          ))}
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

function DoorCell({ door, index, leaving, onChoose }: DoorCellProps) {
  const ref = useRef<HTMLLIElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [hovered, setHovered] = useState(false);

  const { chosen, dismissed, showView, showCover } = exitState(leaving, door.slug);
  // A cover the color of the page hides the door: before it scrolls into view, and when another door is chosen.
  const covered = !inView || dismissed;
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
        className="group block p-3 outline-none md:p-6"
        onClick={(event) => boxRef.current && onChoose(event, door.slug, boxRef.current)}
        onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <div ref={boxRef} className="relative aspect-9/16">
          {showView && (
            <DoorView slug={door.slug} open={hovered || chosen ? HOVER_OPEN : 0} className="absolute inset-0" />
          )}
          {showCover && (
            <div
              className={cn(
                "absolute inset-0 bg-background transition-opacity",
                covered ? "opacity-100" : "opacity-0",
                leaving ? "duration-400" : "duration-700",
              )}
              style={{ transitionDelay: `${stagger}ms` }}
            />
          )}
        </div>
        <div
          className={cn(
            "mt-3 flex items-baseline justify-between gap-2 border-t pt-3 transition duration-700 group-focus-visible:border-foreground md:mt-6",
            inView && !leaving ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
          )}
          style={{ transitionDelay: `${leaving ? 0 : stagger + 200}ms` }}
        >
          <span className="text-sm font-medium md:text-base">{door.name}</span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {(index + 1).toLocaleString("fa-IR", { minimumIntegerDigits: 2 })}
          </span>
        </div>
      </Link>
    </li>
  );
}
