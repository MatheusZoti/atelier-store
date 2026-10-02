import { ProductCard } from "@/components/product/product-card";
import { ButtonLink, Container, Heading, ProductGrid } from "@/components/ui";
import { newArrivalSlugs } from "@/lib/catalog";
import { getProductsBySlugs } from "@/lib/catalog-queries";

export async function NewArrivals() {
  const newArrivals = await getProductsBySlugs(newArrivalSlugs);

  return (
    <section aria-labelledby="new-arrivals-heading" className="section">
      <Container className="mb-10 text-center">
        <Heading id="new-arrivals-heading" size="title">
          New arrivals
        </Heading>
      </Container>

      {/* 8 items: 2 → 4 columns so rows always fill (the default grid has 3 at md). */}
      <ProductGrid className="md:grid-cols-2 lg:grid-cols-4">
        {newArrivals.map((product) => (
          <li key={product.slug}>
            <ProductCard product={product} sizes="(min-width: 64rem) 25vw, 50vw" />
          </li>
        ))}
      </ProductGrid>

      <div className="mt-14 flex justify-center px-gutter">
        <ButtonLink href="/collections/new-arrivals" variant="secondary">
          View all
        </ButtonLink>
      </div>
    </section>
  );
}
