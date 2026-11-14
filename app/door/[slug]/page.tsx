import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { DoorPicker } from "@/components/door-picker";
import { DoorResult } from "@/components/door-result";
import { JsonLd } from "@/components/json-ld";
import { RelatedDoors } from "@/components/related-doors";
import { config } from "@/lib/config";
import { openGraph, twitter } from "@/lib/config/metadata";
import { doors, doorSocialImage, findDoor } from "@/lib/doors";

export function generateStaticParams() {
  return doors.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/door/[slug]">): Promise<Metadata> {
  const door = findDoor((await params).slug);

  if (!door) return {};

  const title = `در ${door.name}`;
  const { description } = door;
  const url = `/door/${door.slug}`;
  // The door's own card. Both platforms take 1200x630 for a large image.
  const images = [{ url: doorSocialImage(door.slug), width: 1200, height: 630, alt: `${config.appName}: ${title}` }];

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { ...openGraph, title, description, url, images },
    twitter: { ...twitter, title, description, images },
  };
}

export default async function DoorPage({ params }: PageProps<"/door/[slug]">) {
  const door = findDoor((await params).slug);
  if (!door) notFound();

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: config.appName, item: config.appHost },
      { "@type": "ListItem", position: 2, name: `در ${door.name}`, item: `${config.appHost}/door/${door.slug}` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbs} />
      {/* Choosing another door below runs the same exit sequence as the home grid. */}
      <DoorPicker>
        <DoorResult door={door} />
        <RelatedDoors current={door.slug} />
      </DoorPicker>
    </>
  );
}
