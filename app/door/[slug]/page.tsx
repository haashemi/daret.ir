import type { Metadata, ResolvingMetadata } from "next";

import { cn } from "cn";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DoorView } from "@/components/door-view";
import { RandomDoorButton } from "@/components/random-door-button";
import { ShareButton } from "@/components/share-button";
import { buttonVariants } from "@/components/ui/button";
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
  const url = `/door/${door.slug}`;

  return {
    title,
    alternates: { canonical: url },
    openGraph: { ...openGraph, title, url, images: parentOpenGraph?.images ?? [] },
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
        <div className="flex flex-col gap-4">
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
            <div className="flex animate-rise flex-wrap items-center gap-2 [animation-delay:2.2s]">
              <ShareButton name={door.name} />
              <RandomDoorButton current={door.slug} />
              <Link href="/" className={buttonVariants({ variant: "ghost", size: "lg" })}>
                همه‌ی درها
              </Link>
            </div>
          </div>
          <a
            href="https://donofa.com/haashemi"
            target="_blank"
            rel="noreferrer noopener"
            className="group relative flex animate-rise items-center justify-between gap-4 overflow-hidden border px-8 py-4 transition-[border-color,box-shadow] duration-500 outline-none [animation-delay:2.6s] hover:border-light hover:shadow-[0_0_48px_-8px_var(--light)] focus-visible:border-light focus-visible:shadow-[0_0_48px_-8px_var(--light)] md:px-12"
          >
            {/* The light floods in from the start edge, like a door swinging open. */}
            <span
              aria-hidden
              className="absolute inset-0 origin-right scale-x-0 bg-light transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
            />
            <span className="relative text-sm text-muted-foreground transition-colors duration-500 group-hover:text-background group-focus-visible:text-background">
              از درت خوشت اومد؟
            </span>
            <span className="relative flex items-center gap-2 font-black text-light transition-colors duration-500 group-hover:text-background group-focus-visible:text-background">
              دونیتمون کن!
              <ArrowLeft className="size-4 transition-transform duration-500 group-hover:-translate-x-1.5 group-focus-visible:-translate-x-1.5" />
            </span>
          </a>
        </div>
      </section>
      <div aria-hidden className="pointer-events-none fixed inset-0 animate-flash-out bg-light" />
    </>
  );
}
