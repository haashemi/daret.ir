"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const subscribe = () => () => undefined;

/** How long after hydration the splash waits for the scene before lifting without it. */
const GIVE_UP_AFTER = 8000;

/**
 * The home page's splash on a direct visit: a line drawing of a door swings open and «دَرِت» slides out of it, the
 * pair settling at the center. It covers the page until the intro has played and `sceneReady` (the hero drew, or the
 * canvas failed; or `GIVE_UP_AFTER`), then fades out. The intro is CSS in the server HTML, so it plays before the JS arrives; on a slow
 * network «در حال بارگیری» fades in under it.
 *
 * Client-side navigations to the home page render nothing: only the hydrating render sees the server snapshot.
 */
export function Splash({ sceneReady }: { sceneReady: boolean }) {
  const hydrating = useSyncExternalStore(
    subscribe,
    () => false,
    () => true,
  );
  const [shown, setShown] = useState(hydrating);
  const [played, setPlayed] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const introRef = useRef<HTMLDivElement>(null);
  const exiting = played && (sceneReady || gaveUp);

  // The intro may have finished before hydration; `finished` resolves either way.
  useEffect(() => {
    const animations = introRef.current?.getAnimations({ subtree: true }) ?? [];
    let cancelled = false;
    Promise.all(animations.map((animation) => animation.finished))
      .then(() => !cancelled && setPlayed(true))
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  // Never hold the page hostage to a scene that doesn't report back: lift anyway once the JS has been running a while.
  useEffect(() => {
    const timer = setTimeout(() => setGaveUp(true), GIVE_UP_AFTER);
    return () => clearTimeout(timer);
  }, []);

  if (!shown) return null;

  return (
    <div
      data-splash
      data-exiting={exiting ? "" : undefined}
      onTransitionEnd={(event) => exiting && event.target === event.currentTarget && setShown(false)}
      aria-hidden
      className="fixed inset-0 z-60 grid place-items-center bg-background text-foreground transition-opacity duration-500 ease-snappy [--size:clamp(56px,14vw,104px)] data-exiting:pointer-events-none data-exiting:opacity-0"
    >
      {/* Without JS nothing would ever lift it. */}
      <noscript>
        <style>{"[data-splash]{display:none}"}</style>
      </noscript>

      {/* Laid out left to right: the door, then the word coming out of its opening edge. The pair starts shifted so
          the door alone is centered (`--shift`), then settles while the word slides out. */}
      <div
        ref={introRef}
        dir="ltr"
        className="flex animate-splash-settle items-center gap-(--gap) text-(length:--size) [--door-w:0.82em] [--gap:0.3em] [--shift:calc((var(--gap)+var(--word))/2)] [--word:1.72em]"
      >
        <div className="relative h-[1.3em] w-(--door-w) animate-splash-door border-[1.5px] border-white/40 perspective-[3em]">
          <div className="absolute inset-0 animate-splash-light bg-light shadow-[0_0_0.6em_color-mix(in_oklab,var(--light)_35%,transparent)]" />
          <div className="absolute inset-0 origin-left animate-splash-swing border-[1.5px] border-white/75 bg-background">
            <span className="absolute inset-e-[0.09em] top-[52%] size-[0.07em] rounded-full bg-white/75" />
          </div>
        </div>
        {/* Clips the word at the door's edge, with room above and below for the diacritics. */}
        <div className="my-[-0.25em] -ms-(--gap) overflow-hidden py-[0.25em] ps-(--gap)">
          <span className="block w-(--word) animate-splash-word leading-none font-black whitespace-nowrap">دَرِت</span>
        </div>
      </div>

      <p className="absolute inset-x-0 top-[calc(50%+var(--size)*0.65+40px)] animate-splash-loading bg-linear-to-l from-white/35 from-40% via-white/90 via-50% to-white/35 to-60% bg-size-[200%_100%] bg-clip-text text-center text-[15px] font-medium text-transparent">
        در حال بارگیری
      </p>
    </div>
  );
}
