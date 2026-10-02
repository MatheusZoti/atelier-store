import Image from "next/image";

import { ButtonLink } from "@/components/ui";
import { collections } from "@/lib/catalog";

/** Two full-bleed collection panels, side by side from md up. */
export function CollectionSplit() {
  return (
    <section aria-label="Featured collections" className="grid md:grid-cols-2">
      {collections.map((collection) => (
        <article key={collection.slug} className="relative aspect-product overflow-hidden bg-ink">
          <Image
            src={collection.image.src}
            alt={collection.image.alt}
            fill
            sizes="(min-width: 48rem) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-gutter pb-12 text-center text-white">
            <h2 className="text-lead font-medium">{collection.title}</h2>
            <p className="text-body-sm text-white/85">{collection.description}</p>
            <ButtonLink
              href={`/collections/${collection.slug}`}
              variant="on-image-outline"
              size="sm"
              className="mt-3"
            >
              Shop now
            </ButtonLink>
          </div>
        </article>
      ))}
    </section>
  );
}
