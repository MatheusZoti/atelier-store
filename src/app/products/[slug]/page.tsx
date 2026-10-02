import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Disclosure } from "@/components/product/disclosure";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductRail } from "@/components/product/product-rail";
import { StockStatus } from "@/components/product/stock-status";
import { BagIcon, Button, ButtonLink, Container, Heading, PlusIcon } from "@/components/ui";
import { formatPrice, getStockState } from "@/lib/catalog";
import { getProduct, getProductSlugs, getRelatedProducts } from "@/lib/catalog-queries";

// Catalog and stock come from the database; regenerate at most once a minute.
// Products added after a build render on first visit; unknown slugs 404.
export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} | Atelier Store`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const category = product.categoryName;
  const stock = getStockState(product);
  const soldOut = stock.status === "out-of-stock";
  const related = await getRelatedProducts(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image.src,
    description: product.description,
    category,
    color: product.colour,
    offers: {
      "@type": "Offer",
      price: (product.price / 100).toFixed(2),
      priceCurrency: "USD",
      availability: soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />

        <ProductGallery image={product.image} />

        <Container className="grid gap-x-12 gap-y-10 pt-10 pb-section lg:grid-cols-12 lg:pt-14">
          {/* Summary: name, price, colour, stock */}
          <div className="flex flex-col gap-4 lg:col-span-7 lg:row-start-1">
            <nav aria-label="Breadcrumb" className="text-caption">
              <ol className="flex flex-wrap items-center gap-1.5">
                <li>
                  <Link href="/" className="link">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href={`/collections/${product.category}`} className="link">
                    {category}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-muted">
                  {product.name}
                </li>
              </ol>
            </nav>

            <h1 className="mt-4 text-title font-normal">{product.name}</h1>
            <p className="text-lead font-medium">{formatPrice(product.price)}</p>
            <dl className="flex flex-col gap-1 text-body-sm">
              <div className="flex gap-2">
                <dt className="text-muted">Category</dt>
                <dd>{category}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted">Colour</dt>
                <dd>{product.colour}</dd>
              </div>
            </dl>
            <StockStatus product={product} />
          </div>

          {/* Purchase panel: sticky beside the details on desktop, after the summary on mobile */}
          <aside
            aria-label="Purchase"
            className="flex flex-col gap-6 lg:sticky lg:top-8 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:self-start xl:col-span-4 xl:col-start-9"
          >
            {/* TODO: wire to the cart once it exists. */}
            <Button block disabled={soldOut}>
              <BagIcon width={16} height={16} />
              {soldOut ? "Out of stock" : "Add to bag"}
            </Button>
            {soldOut && (
              <p className="-mt-2 text-body-sm text-muted">
                This piece is currently unavailable online. Our client advisors can check availability in store.
              </p>
            )}
            <ButtonLink href="/services/appointments" variant="secondary" block>
              Book an appointment
            </ButtonLink>

            <ul role="list" className="flex flex-col gap-4 border-t pt-6 text-body-sm">
              <li>Complimentary shipping, exchanges and returns.</li>
              <li>Collect in store available in 1–2 business days.</li>
              <li>
                <Link href="/contact" className="link-quiet inline-flex items-center gap-2 font-medium">
                  <PlusIcon width={14} height={14} />
                  Contact a client advisor
                </Link>
              </li>
            </ul>
          </aside>

          {/* Description and details */}
          <div className="lg:col-span-7 lg:row-start-2">
            <Heading as="h2">Product description</Heading>
            <p className="mt-4 max-w-prose text-lead font-light">{product.description}</p>

            <div className="mt-10 border-t">
              <Disclosure title="Product details">
                <ul role="list" className="flex list-disc flex-col gap-2 pl-5">
                  {product.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </Disclosure>
              <Disclosure title="Materials & care">
                <p>{product.materials}</p>
              </Disclosure>
              <Disclosure title="Shipping & returns">
                <p>
                  Complimentary standard delivery in 2–4 business days. Returns and exchanges are free within 30
                  days in the original condition and packaging.
                </p>
              </Disclosure>
            </div>
          </div>
        </Container>

        <section aria-labelledby="related-heading" className="pb-section">
          <Container className="mb-10 text-center">
            <Heading id="related-heading" size="title">
              You may also like
            </Heading>
          </Container>
          <ProductRail products={related} label="Related products" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
