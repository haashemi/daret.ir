import type { Metadata, ResolvingMetadata } from "next";

import { notFound } from "next/navigation";

import { DoorResult } from "@/components/door-result";
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
  const { description } = door;
  const url = `/door/${door.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { ...openGraph, title, description, url, images: parentOpenGraph?.images ?? [] },
    twitter: { ...twitter, title, description, images: parentTwitter?.images ?? [] },
  };
}

export default async function DoorPage({ params }: PageProps<"/door/[slug]">) {
  const door = findDoor((await params).slug);
  if (!door) notFound();

  return <DoorResult door={door} />;
}
