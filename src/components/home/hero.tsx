import Image from "next/image";

import { ButtonLink, Eyebrow } from "@/components/ui";
import { hero } from "@/lib/catalog";

export function Hero() {
  return (
    <section className="relative h-svh max-h-[64rem] min-h-[36rem] overflow-hidden bg-ink">
      <Image
        src={hero.image.src}
        alt={hero.image.alt}
        fill
        preload
        sizes="100vw"
        className="object-cover object-[50%_30%]"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-5 px-gutter pb-16 text-center text-white sm:pb-20">
        <Eyebrow>{hero.eyebrow}</Eyebrow>
        <h1 className="text-statement font-light">{hero.title}</h1>
        <ButtonLink href={hero.cta.href} variant="on-image" className="mt-2">
          {hero.cta.label}
        </ButtonLink>
      </div>
    </section>
  );
}
