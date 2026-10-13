"use client";

import type { Route } from "next";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/*
 * Browser back/forward starts Next's traversal with no transition type, and its state update
 * lands outside the transition, so no view transition runs. Each history entry records its
 * stack position instead; a traversal is "next" or "previous" by its delta, and is re-run as
 * a same-URL replace that carries that type.
 */
const POSITION_KEY = "__position";

let position = 0;

// Runs on import, before the router's effect captures the history methods, so every entry it writes is tagged.
if (typeof window !== "undefined") {
  position = Number(window.history.state?.[POSITION_KEY] ?? window.history.length - 1);
  window.history.replaceState({ ...window.history.state, [POSITION_KEY]: position }, "");

  const { pushState, replaceState } = window.history;

  window.history.pushState = (data, unused, url) => {
    position += 1;

    return pushState.call(window.history, { ...data, [POSITION_KEY]: position }, unused, url);
  };

  window.history.replaceState = (data, unused, url) => {
    return replaceState.call(window.history, { ...data, [POSITION_KEY]: position }, unused, url);
  };
}

export function HistoryTransitions() {
  const router = useRouter();

  useEffect(() => {
    function onPopState(event: PopStateEvent) {
      const target: unknown = event.state?.[POSITION_KEY];
      if (!event.state?.__NA || typeof target !== "number") return;

      const transitionType = target > position ? "next" : "previous";
      position = target;

      // Capture runs before the router's own popstate listener, so it doesn't traverse a second time.
      event.stopImmediatePropagation();
      // Same URL as the entry we're already on, so the history stack is unchanged; the replace only runs the transition.
      router.replace(window.location.href as Route, { scroll: false, transitionTypes: [transitionType] });
    }

    window.addEventListener("popstate", onPopState, { capture: true });

    return () => window.removeEventListener("popstate", onPopState, { capture: true });
  }, [router]);

  return null;
}
