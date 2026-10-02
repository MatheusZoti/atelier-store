// Catalog reads from the database, returned in the storefront's `Product` / `Category`
// shapes. Server-only: never import from client components.
import { and, asc, desc, eq, inArray, ne } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { categories, productImages, products } from "@/db/schema";
import type { Category, Product } from "@/lib/catalog";

const withRelations = {
  category: true,
  stock: true,
  images: { orderBy: asc(productImages.position) },
} as const;
const productOrder = [desc(products.createdAt), asc(products.slug)];

type ProductRow = NonNullable<Awaited<ReturnType<typeof findProduct>>>;

function findProduct(slug: string) {
  return db.query.products.findFirst({ where: eq(products.slug, slug), with: withRelations });
}

/** Maps a row to a `Product`. Products without images are skipped (returns undefined). */
function toProduct(row: ProductRow): Product | undefined {
  const images = row.images.map((image) => ({ src: image.url, alt: image.alt }));
  if (images.length === 0) {
    console.warn(`Product "${row.slug}" has no images and is hidden from the storefront.`);
    return undefined;
  }
  return {
    slug: row.slug,
    name: row.name,
    price: row.priceCents,
    category: row.category.slug,
    categoryName: row.category.name,
    colour: row.colour,
    stock: row.stock?.quantity ?? 0,
    image: images[0],
    images,
    description: row.description,
    details: row.details,
    materials: row.materials,
    badge: row.badge ?? undefined,
  };
}

/** Returns items in the order of `slugs`, skipping slugs that have no row. */
function inSlugOrder<T extends { slug: string }>(rows: T[], slugs: string[]): T[] {
  const bySlug = new Map(rows.map((row) => [row.slug, row]));
  return slugs.flatMap((slug) => bySlug.get(slug) ?? []);
}

/** Categories by slug, in the given order. Categories without an image are skipped. */
export async function getCategoriesBySlugs(slugs: string[]): Promise<Category[]> {
  const rows = await db.query.categories.findMany({ where: inArray(categories.slug, slugs) });
  return inSlugOrder(rows, slugs).flatMap((row) =>
    row.imageUrl && row.imageAlt
      ? [{ slug: row.slug, name: row.name, image: { src: row.imageUrl, alt: row.imageAlt } }]
      : [],
  );
}

/** Products by slug, in the given order. */
export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  const rows = await db.query.products.findMany({
    where: inArray(products.slug, slugs),
    with: withRelations,
  });
  return inSlugOrder(rows.flatMap((row) => toProduct(row) ?? []), slugs);
}

/** Most recently added products first. */
export async function getLatestProducts(limit = 24): Promise<Product[]> {
  const rows = await db.query.products.findMany({ with: withRelations, orderBy: productOrder, limit });
  return rows.flatMap((row) => toProduct(row) ?? []);
}

export async function getCategorySlugs(): Promise<string[]> {
  const rows = await db.select({ slug: categories.slug }).from(categories);
  return rows.map((row) => row.slug);
}

/** A category and its products, newest first. Deduplicated per request like `getProduct`. */
export const getCategoryWithProducts = cache(
  async (slug: string): Promise<{ slug: string; name: string; products: Product[] } | undefined> => {
    const row = await db.query.categories.findFirst({
      where: eq(categories.slug, slug),
      with: { products: { with: withRelations, orderBy: productOrder } },
    });
    if (!row) return undefined;
    return {
      slug: row.slug,
      name: row.name,
      products: row.products.flatMap((product) => toProduct(product) ?? []),
    };
  },
);

/** Deduplicated per request, so metadata and the page share one query. */
export const getProduct = cache(async (slug: string): Promise<Product | undefined> => {
  const row = await findProduct(slug);
  return row && toProduct(row);
});

export async function getProductSlugs(): Promise<string[]> {
  const rows = await db.select({ slug: products.slug }).from(products);
  return rows.map((row) => row.slug);
}

/** Same-category products first, then others, excluding the product itself. */
export async function getRelatedProducts(product: Product, limit = 6): Promise<Product[]> {
  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, product.category),
    columns: { id: true },
  });
  if (!category) return [];

  const same = await db.query.products.findMany({
    where: and(eq(products.categoryId, category.id), ne(products.slug, product.slug)),
    with: withRelations,
    orderBy: productOrder,
    limit,
  });
  const rest =
    same.length < limit
      ? await db.query.products.findMany({
          where: ne(products.categoryId, category.id),
          with: withRelations,
          orderBy: productOrder,
          limit: limit - same.length,
        })
      : [];

  return [...same, ...rest].flatMap((row) => toProduct(row) ?? []);
}
