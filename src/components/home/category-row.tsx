import Image from "next/image";
import Link from "next/link";

import { Container, MediaFrame } from "@/components/ui";
import { homeCategorySlugs } from "@/lib/catalog";
import { getCategoriesBySlugs } from "@/lib/catalog-queries";

export async function CategoryRow() {
  const categories = await getCategoriesBySlugs(homeCategorySlugs);

  return (
    <section aria-labelledby="categories-heading" className="section">
      <h2 id="categories-heading" className="sr-only">
        Shop by category
      </h2>
      <Container>
        <ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link href={`/collections/${category.slug}`} className="group block text-center">
                <MediaFrame ratio="square">
                  <Image
                    src={category.image.src}
                    alt={category.image.alt}
                    fill
                    sizes="(min-width: 64rem) 25vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-standard group-hover:scale-[1.03]"
                  />
                </MediaFrame>
                <span className="mt-4 inline-block text-body-sm group-hover:underline group-hover:underline-offset-[0.3em]">
                  {category.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
