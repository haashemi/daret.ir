"use client";

import { cn } from "cn";

import type { DoorSlug } from "@/lib/doors";

import { useExitState } from "@/components/door-picker";
import { DoorView } from "@/components/door-view";

/**
 * The result page's door, shut. When another door is chosen below, a page-colored cover fades in over it like the
 * dismissed grid cells (fading the DOM can't hide what the canvas draws), and the view goes before the flight begins.
 */
export function ResultDoor({ slug, className }: { slug: DoorSlug; className: string }) {
  const { dismissed, showView, showCover } = useExitState();

  return (
    <div className={cn("relative", className)}>
      {showView && <DoorView slug={slug} open={0} distance={7.4} halo={[2.2, 3]} className="absolute inset-0" />}
      {showCover && (
        <div
          className={cn(
            "absolute inset-0 bg-background transition-opacity duration-400",
            dismissed ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </div>
  );
}
