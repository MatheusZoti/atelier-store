import { PageIntro } from "@/components/layout/page-intro";
import { ButtonLink, Container, ProductGrid } from "@/components/ui";
import type { Product } from "@/lib/catalog";

import { ProductCard } from "./product-card";

type ProductListingProps = {
  /** Page heading; also the last breadcrumb. */
  title: string;
  /** Optional short line under the heading. */
  intro?: string;
  products: Product[];
};

/** Collection page body: centred intro (breadcrumb, title, count) over a full-bleed product grid. */
export function ProductListing({ title, intro, products }: ProductListingProps) {
  return (
    <>
      <Container className="pt-10 pb-12 lg:pt-14 lg:pb-16">
        <PageIntro title={title} intro={intro}>
          {products.length > 0 && (
            <p className="text-body-sm text-muted">
              {products.length} {products.length === 1 ? "piece" : "pieces"}
            </p>
          )}
        </PageIntro>
      </Container>

      {products.length > 0 ? (
        <ProductGrid aria-label={title}>
          {products.map((product) => (
            <li key={product.slug}>
              <ProductCard product={product} sizes="(min-width: 80rem) 25vw, (min-width: 48rem) 33vw, 50vw" />
            </li>
          ))}
        </ProductGrid>
      ) : (
        <Container className="flex flex-col items-center gap-6 border-t pt-section text-center">
          <p className="text-lead font-light">New pieces are on their way. Please check back soon.</p>
          <ButtonLink href="/" variant="secondary">
            Back to home
          </ButtonLink>
        </Container>
      )}
    </>
  );
}
