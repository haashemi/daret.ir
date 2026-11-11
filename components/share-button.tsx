"use client";

import { Check, Share2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type Status = "copied" | "failed" | "idle";

const LABEL: Record<Status, string> = {
  idle: "نشونش بده",
  copied: "لینکش کپی شد",
  failed: "کپی نشد، لینک رو دستی بردار",
};

export function ShareButton({ name, className }: { name: string; className?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const resetRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(resetRef.current), []);

  function flash(next: Status) {
    setStatus(next);
    clearTimeout(resetRef.current);
    resetRef.current = setTimeout(() => setStatus("idle"), 2500);
  }

  async function share() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: `در ${name}`, text: `اینم از در جدید من: در ${name}`, url });

        return;
      } catch (error) {
        // Dismissing the share sheet is not a failure; anything else falls back to copying.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      flash("copied");
    } catch {
      flash("failed");
    }
  }

  const Icon = status === "copied" ? Check : status === "failed" ? X : Share2;

  return (
    <Button variant="outline" size="lg" className={className} onClick={share}>
      <Icon data-icon="inline-start" />
      {LABEL[status]}
    </Button>
  );
}
