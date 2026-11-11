import { useSyncExternalStore } from "react";

// Set once, when the shared canvas fails to start (no WebGL). Doors then stay as placeholders.
let failed = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function markSceneFailed() {
  failed = true;
  listeners.forEach((listener) => listener());
}

/** `true` when the WebGL canvas could not be created, so no door will ever be drawn. */
export function useSceneFailed() {
  return useSyncExternalStore(
    subscribe,
    () => failed,
    () => false,
  );
}
