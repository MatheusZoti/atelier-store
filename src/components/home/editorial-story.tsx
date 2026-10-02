import Image from "next/image";

import { Eyebrow, TextLink } from "@/components/ui";
import { story } from "@/lib/catalog";

/** Full-bleed image with an editorial text column; stacks on small screens. */
export function EditorialStory() {
  return (
    <section aria-labelledby="story-heading" className="grid bg-surface lg:grid-cols-12">
      <div className="relative aspect-[4/3] lg:col-span-7 lg:aspect-auto lg:min-h-[40rem]">
        <Image
          src={story.image.src}
          alt={story.image.alt}
          fill
          sizes="(min-width: 64rem) 58vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col items-start justify-center gap-6 px-gutter py-section lg:col-span-5 lg:px-16">
        <Eyebrow>{story.eyebrow}</Eyebrow>
        <h2 id="story-heading" className="heading-statement max-w-md">
          {story.title}
        </h2>
        <p className="max-w-md text-lead font-light">{story.body}</p>
        <TextLink href={story.cta.href} variant="cta" className="mt-2">
          {story.cta.label}
        </TextLink>
      </div>
    </section>
  );
}
