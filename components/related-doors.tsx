import type { DoorSlug } from "@/lib/doors";

import { DoorCell } from "@/components/door-picker";
import { nextDoors } from "@/lib/doors";

/**
 * The next four doors in catalog order, as cells of the home grid: crawlers and visitors get somewhere to go besides
 * home, and choosing one runs the same exit sequence. Must be inside a `DoorPicker`.
 */
export function RelatedDoors({ current }: { current: DoorSlug }) {
  return (
    <section aria-labelledby="related-title" className="flex flex-col gap-6">
      <h2
        id="related-title"
        className="text-xl font-black transition-opacity duration-500 group-data-leaving/page:opacity-0 md:text-2xl"
      >
        درهای دیگه
      </h2>
      <ul className="grid grid-cols-2 border-s border-t transition-colors duration-500 group-data-leaving/page:border-transparent md:grid-cols-4">
        {nextDoors(current, 4).map((door, index) => (
          <DoorCell key={door.slug} door={door} index={index} />
        ))}
      </ul>
    </section>
  );
}
