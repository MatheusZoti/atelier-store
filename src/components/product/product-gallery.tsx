import Image from "next/image";

import { MediaFrame } from "@/components/ui";
import type { Img } from "@/lib/catalog";

/**
 * Large product imagery: the full shot plus a close-up crop of the same photo.
 * Side by side from md up; a swipeable rail on small screens.
 */
export function ProductGallery({ image }: { image: Img }) {
  const views = [
    { key: "full", alt: image.alt, className: "object-cover" },
    // Close-up of the same photograph (scaled crop), not a different product shot.
    { key: "detail", alt: `${image.alt}, close-up`, className: "scale-[1.8] object-cover object-center" },
  ];

  return (
    <section aria-label="Product images" className="scroll-rail gap-0.5 md:grid md:grid-cols-2 md:overflow-visible">
      {views.map((view, index) => (
        <MediaFrame key={view.key} className="w-[88%] shrink-0 snap-start md:w-auto">
          <Image
            src={image.src}
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
