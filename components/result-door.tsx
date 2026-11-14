"use client";

import { cn } from "cn";
import { useLayoutEffect, useState, ViewTransition } from "react";

import type { DoorSlug } from "@/lib/doors";

import { DoorView } from "@/components/door-view";
import { doorStill } from "@/lib/doors";

/** The view transition class of a chosen door's still flying to its page (styles/view-transitions.css). */
export const DOOR_MORPH = "door-morph";

/** The transition type of navigating to a chosen door. */
export const DOOR_TRANSITION = "door";

/** Pairs a chosen grid cell's still with the door page's. */
export const doorMorphName = (slug: DoorSlug) => `door-${slug}`;

// The door pages' camera distance, against the grid's 6.4 (`DoorScene`): the still is shrunk to frame the door the same.
const DISTANCE = 7.4;
const STILL_HEIGHT = `${(6.4 / DISTANCE) * 100}%`;

// Set when a door is chosen, read by the door page it lands on.
let pending = false;

/** Call when a door is chosen: its page holds its 3D door back until the still has flown in. */
export function markDoorMorph() {
  pending = true;
}

const isViewTransition = (animation: Animation) =>
  animation.effect instanceof KeyframeEffect &&
  Boolean(animation.effect.pseudoElement?.startsWith("::view-transition"));

/**
 * The result page's door, shut. Its still (`doorStill`) shows until the 3D door is drawn, framed to match it. When a
 * door is chosen, the grid cell's still morphs into this one; the canvas draws under the DOM and isn't part of the
 * morph, so the 3D door only mounts once the morph is done.
 */
export function ResultDoor({ slug, className }: { slug: DoorSlug; className: string }) {
  const [morphing, setMorphing] = useState(false);
  const [ready, setReady] = useState(false);

  // Layout, so it also runs when Next shows this page again from `<Activity>` (choosing the same door twice).
  useLayoutEffect(() => {
    if (!pending) return;
    pending = false;
    setMorphing(true);
    setReady(false);
  }, []);

  // Without view transitions (or if one is skipped) `onShare` never fires: don't hold the door back forever.
  useLayoutEffect(() => {
    if (!morphing) return;
    const timeout = setTimeout(() => setMorphing(false), "startViewTransition" in document ? 1500 : 0);

    return () => clearTimeout(timeout);
  }, [morphing]);

  function onShare() {
    const animations = document.getAnimations().filter(isViewTransition);
    void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => setMorphing(false));
  }

  return (
    <div className={cn("relative", className)}>
      {!morphing && (
        <DoorView
          slug={slug}
          open={0}
          distance={DISTANCE}
          halo={[2.2, 3]}
          onReady={() => setReady(true)}
          className="absolute inset-0"
        />
      )}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
          ready && !morphing && "opacity-0",
        )}
      >
        <ViewTransition name={doorMorphName(slug)} share={DOOR_MORPH} default="none" onShare={onShare}>
          <img
            src={doorStill(slug)}
            alt=""
            width={450}
            height={800}
            decoding="async"
            style={{ height: STILL_HEIGHT }}
            className="aspect-9/16 w-auto"
          />
        </ViewTransition>
      </div>
    </div>
  );
}
