"use client";

import { cn } from "cn";
import { Check, Share2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { ButtonProps } from "@/components/ui/button";

import { Button } from "@/components/ui/button";

type Status = "copied" | "failed" | "idle";

const LABEL: Record<Status, string> = {
  idle: "نشونش بده",
  copied: "لینکش کپی شد",
  failed: "کپی نشد، لینک رو دستی بردار",
};

interface ShareButtonProps {
  name: string;
  className?: string;
  variant?: ButtonProps["variant"];
}

export function ShareButton({ name, className, variant = "outline" }: ShareButtonProps) {
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
    <Button variant={variant} size="lg" className={className} onClick={share}>
      {/* The confirmation's icon pops in; the quiet return to idle stays instant. */}
      <Icon
        key={status}
        data-icon="inline-start"
        className={cn(
          status !== "idle" &&
            "transition-[opacity,scale] duration-150 ease-snappy starting:scale-60 starting:opacity-0 starting:motion-reduce:scale-100",
        )}
      />
      {LABEL[status]}
    </Button>
  );
}
