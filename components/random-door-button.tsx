"use client";

import { Shuffle } from "lucide-react";
import { useRouter } from "next/navigation";

import type { DoorSlug } from "@/lib/doors";

import { Button } from "@/components/ui/button";
import { doors } from "@/lib/doors";

/** Navigates to a random door other than `current`. */
export function RandomDoorButton({ current, className }: { current: DoorSlug; className?: string }) {
  const router = useRouter();

  function go() {
    const others = doors.filter((door) => door.slug !== current);
    const next = others[Math.floor(Math.random() * others.length)];
    if (next) router.push(`/door/${next.slug}`);
  }

  return (
    <Button variant="ghost" size="lg" className={className} onClick={go}>
      <Shuffle data-icon="inline-start" />
      یه در شانسی
    </Button>
  );
}
