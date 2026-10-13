"use client";

import { View } from "@react-three/drei";

import type { DoorSceneProps } from "@/components/three/door-scene";
import type { DoorSlug } from "@/lib/doors";

import { models } from "@/components/doors";
import { DoorScene } from "@/components/three/door-scene";

interface DoorViewProps extends Omit<DoorSceneProps, "children"> {
  slug: DoorSlug;
  className: string;
  /** Draw order; views with a higher index paint over lower ones. */
  index?: number;
}

/** A DOM box the shared canvas draws a 3D door into. Size it with `className`; doors are framed for 9:16. */
export function DoorView({ slug, className, index = 1, ...scene }: DoorViewProps) {
  const Model = models[slug];

  return (
    <View className={className} index={index} aria-hidden>
      <DoorScene {...scene}>
        <Model />
      </DoorScene>
    </View>
  );
}
