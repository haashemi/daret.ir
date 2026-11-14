"use client";

import { useLayoutEffect, useState } from "react";

// Set by the home page's exit sequence right before it navigates, read by the door page it lands on.
let pending = false;

/** Call right before navigating out of the door-choice sequence, whose last frame is the screen flooded with light. */
export function markArrivalThroughLight() {
  pending = true;
}

/**
 * The light the home page flooded the screen with, fading out over the door page. Only after the door-choice
 * sequence: a direct visit, another link or back/forward lands with no light to carry over. Renders nothing on the
 * server, so a direct load hydrates without it.
 */
export function ArrivalLight() {
  const [show, setShow] = useState(() => pending);

  // Also runs when Next shows this page again from `<Activity>` (choosing the same door twice), where the state is
  // kept and the overlay already unmounted. Layout, so the light is up before that first paint.
  useLayoutEffect(() => {
    if (pending) setShow(true);
    pending = false;
  }, []);

  if (!show) return null;

  // Unmounts when done: a hidden page shown again restarts its CSS animations.
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 animate-flash-out bg-light"
      onAnimationEnd={() => setShow(false)}
    />
  );
}
