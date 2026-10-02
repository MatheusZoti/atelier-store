import Image from "next/image";

import { MediaFrame } from "@/components/ui";
import type { Img } from "@/lib/catalog";

/**
 * Large product imagery. With one photo, shows it plus a close-up crop of the same photo.
 * Side by side from md up; a swipeable rail on small screens.
 */
export function ProductGallery({ images }: { images: Img[] }) {
  const views =
    images.length > 1
      ? images.map((image, index) => ({ key: `${index}`, src: image.src, alt: image.alt, className: "object-cover" }))
      : [
          { key: "full", src: images[0].src, alt: images[0].alt, className: "object-cover" },
          // Close-up of the same photograph (scaled crop), not a different product shot.
          {
            key: "detail",
            src: images[0].src,
            alt: `${images[0].alt}, close-up`,
            className: "scale-[1.8] object-cover object-center",
          },
        ];

  return (
    <section aria-label="Product images" className="scroll-rail gap-0.5 md:grid md:grid-cols-2 md:overflow-visible">
      {views.map((view, index) => (
        <MediaFrame key={view.key} className="w-[88%] shrink-0 snap-start md:w-auto">
          <Image
            src={view.src}
            alt={view.alt}
            fill
            sizes="(min-width: 48rem) 50vw, 88vw"
            preload={index === 0}
            className={view.className}
          />
        </MediaFrame>
      ))}
    </section>
  );
}
