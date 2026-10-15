import type { Metadata, ResolvingMetadata } from "next";

import { cn } from "cn";
import { notFound } from "next/navigation";

import { DoorView } from "@/components/door-view";
import { ShareButton } from "@/components/share-button";
import { openGraph, twitter } from "@/lib/config/metadata";
import { doors, findDoor } from "@/lib/doors";

export function generateStaticParams() {
  return doors.map(({ slug }) => ({ slug }));
}

export async function generateMetadata(
  { params }: PageProps<"/door/[slug]">,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const door = findDoor((await params).slug);

  if (!door) return {};

  // Setting `openGraph`/`twitter` drops the inherited file-based images, so carry them over.
  const { openGraph: parentOpenGraph, twitter: parentTwitter } = await parent;
  const title = `در ${door.name}`;

  return {
    title,
    openGraph: { ...openGraph, title, images: parentOpenGraph?.images ?? [] },
    twitter: { ...twitter, title, images: parentTwitter?.images ?? [] },
  };
}

export default async function DoorPage({ params }: PageProps<"/door/[slug]">) {
  const door = findDoor((await params).slug);
  if (!door) notFound();

  const lines = ["در جدید خدمت شما", `در ${door.name}‌!`, "حالا برو درتو بذار"];

  return (
    <>
      <section className="grid min-h-svh items-center gap-8 md:grid-cols-2 md:gap-16">
        <DoorView
          slug={door.slug}
          open={1}
          from={0}
          distance={7.4}
          halo={[2.2, 3]}
          className="mx-auto aspect-3/4 w-full max-w-md"
        />
        <div className="flex flex-col items-start gap-10 border p-8 md:p-12">
          <h1 className="flex flex-col gap-5">
            {lines.map((line, index) => (
              <span
                key={line}
                className={cn(
                  "block animate-rise",
                  index === 1 ? "text-4xl font-black md:text-6xl" : "text-xl text-muted-foreground md:text-2xl",
                )}
                style={{ animationDelay: `${0.6 + index * 0.45}s` }}
              >
                {line}
              </span>
            ))}
          </h1>
          <ShareButton name={door.name} className="animate-rise [animation-delay:2.2s]" />
        </div>
      </section>
      <div aria-hidden className="pointer-events-none fixed inset-0 animate-flash-out bg-light" />
    </>
  );
}
