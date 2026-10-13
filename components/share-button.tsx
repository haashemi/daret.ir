"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function ShareButton({ name, className }: { name: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: `در ${name}`, text: `اینم از در جدید من: در ${name}`, url });
      } catch {
        // The user dismissed the share sheet.
      }

      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
  }

  return (
    <Button variant="outline" size="lg" className={className} onClick={share}>
      {copied ? <Check data-icon="inline-start" /> : <Share2 data-icon="inline-start" />}
      {copied ? "لینکش کپی شد" : "نشونش بده"}
    </Button>
  );
}
