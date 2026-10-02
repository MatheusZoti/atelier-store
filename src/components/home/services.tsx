import Image from "next/image";

import { Container, Heading, MediaFrame, TextLink } from "@/components/ui";
import { services } from "@/lib/catalog";

export function Services() {
  return (
    <section aria-labelledby="services-heading" className="section border-t">
      <Container>
        <Heading id="services-heading" className="mb-12 text-center">
          Atelier services
        </Heading>
        <ul role="list" className="grid gap-14 md:grid-cols-3 md:gap-10">
          {services.map((service) => (
            <li key={service.title} className="flex flex-col items-center text-center">
              <MediaFrame ratio="square" className="w-full">
                <Image
                  src={service.image.src}
                  alt={service.image.alt}
                  fill
                  sizes="(min-width: 48rem) 30vw, 100vw"
                  className="object-cover"
                />
              </MediaFrame>
              <h3 className="heading-section mt-8">{service.title}</h3>
              <TextLink href={service.href} variant="cta" className="mt-5">
                {service.cta}
              </TextLink>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
