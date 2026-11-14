import { About } from "@/components/about";
import { DoorPicker } from "@/components/door-picker";
import { Hero } from "@/components/hero";
import { config } from "@/lib/config";
import { doors } from "@/lib/doors";

// Not `Product`: nothing here is for sale.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${config.appHost}/#website`,
      url: config.appHost,
      name: config.appName,
      alternateName: config.appAlternateNames,
      description: config.appDescription,
      inLanguage: "fa-IR",
    },
    {
      "@type": "ItemList",
      name: "کلکسیون درهای دَرِت",
      numberOfItems: doors.length,
      itemListElement: doors.map((door, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${config.appHost}/door/${door.slug}`,
        name: `در ${door.name}`,
      })),
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // `<` escaped so the payload can never close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <DoorPicker>
        <Hero />
      </DoorPicker>
      <About />
    </>
  );
}
