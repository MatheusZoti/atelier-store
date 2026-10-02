import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductListing } from "@/components/product/product-listing";
import { curatedCollections, type Product } from "@/lib/catalog";
import { getCategorySlugs, getCategoryWithProducts, getProductsBySlugs } from "@/lib/catalog-queries";

// Catalog and stock come from the database; regenerate at most once a minute.
// Categories added after a build render on first visit; unknown slugs 404.
export const revalidate = 60;

type Collection = { title: string; intro?: string; products: Product[] };

/** A database category, else a curated collection from catalog.ts. Shared by the page and its metadata. */
const getCollection = cache(async (slug: string): Promise<Collection | undefined> => {
  const category = await getCategoryWithProducts(slug);
  if (category) return { title: category.name, products: category.products };

  const curated = Object.hasOwn(curatedCollections, slug) ? curatedCollections[slug] : undefined;
  if (!curated) return undefined;
  return { title: curated.title, intro: curated.intro, products: await getProductsBySlugs(curated.productSlugs) };
});

export async function generateStaticParams() {
  const slugs = new Set([...(await getCategorySlugs()), ...Object.keys(curatedCollections)]);
  return [...slugs].map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps<"/collections/[category]">): Promise<Metadata> {
  const { category: slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) return {};
  return {
    title: `${collection.title} | Atelier Store`,
    description: collection.intro ?? `Shop ${collection.title.toLowerCase()} from Atelier.`,
  };
}

export default async function CollectionPage({ params }: PageProps<"/collections/[category]">) {
  const { category: slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) notFound();

  return (
    <>
      <SiteHeader />
      <main className="flex-1 pb-section">
        <ProductListing title={collection.title} intro={collection.intro} products={collection.products} />
      </main>
      <SiteFooter />
    </>
  );
}
