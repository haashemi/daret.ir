import type { Metadata } from "next";

import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SocialCard } from "./social-card";

// Dev-only source of the social images and door stills, captured by `scripts/door-images.ts`. See
// .agents/docs/architecture.md#social-images.
export const metadata: Metadata = { robots: { index: false } };

export default function SocialCardPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <>
      {/* Keep the dev-tools badge and the footer out of the screenshot. */}
      <style>{"nextjs-portal, footer { display: none !important; }"}</style>
      <Suspense>
        <SocialCard />
      </Suspense>
    </>
  );
}
