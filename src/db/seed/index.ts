// Seeds categories, products and stock from ./data.ts. Upserts by slug, so it is safe to re-run.
// Usage: npm run db:seed
import { loadEnvConfig } from "@next/env";

import { categories, productImages, products, productStock } from "../schema";
import { categories as seedCategories, products as seedProducts } from "./data";

// Load .env / .env.local before `@/db` is imported: it creates the Neon client on import.
loadEnvConfig(process.cwd());

function nonEmpty<T>(items: T[]): [T, ...T[]] {
  if (items.length === 0) throw new Error("Seed data is empty");
  return items as [T, ...T[]];
}

async function main() {
  const { db } = await import("@/db");

  const categoryRows = await db.batch(
    nonEmpty(
      seedCategories.map((category) => {
        const values = {
          slug: category.slug,
          name: category.name,
          imageUrl: category.image?.src ?? null,
          imageAlt: category.image?.alt ?? null,
        };
        return db
          .insert(categories)
          .values(values)
          .onConflictDoUpdate({ target: categories.slug, set: values })
          .returning({ id: categories.id, slug: categories.slug });
      }),
    ),
  );
  const categoryIds = new Map(categoryRows.flat().map((row) => [row.slug, row.id]));

  const productRows = await db.batch(
    nonEmpty(
      seedProducts.map((product) => {
        const categoryId = categoryIds.get(product.category);
        if (!categoryId) throw new Error(`Unknown category "${product.category}" for ${product.slug}`);
        const values = {
          slug: product.slug,
          name: product.name,
          description: product.description,
          details: product.details,
          materials: product.materials,
          priceCents: product.price,
          colour: product.colour,
          badge: product.badge ?? null,
          categoryId,
        };
        return db
          .insert(products)
          .values(values)
          .onConflictDoUpdate({ target: products.slug, set: values })
          .returning({ id: products.id, slug: products.slug });
      }),
    ),
  );
  const productIds = new Map(productRows.flat().map((row) => [row.slug, row.id]));

  await db.batch(
    nonEmpty(
      seedProducts.flatMap((product) =>
        product.images.map((image, position) => {
          const values = {
            productId: productIds.get(product.slug)!,
            position,
            url: image.src,
            alt: image.alt,
          };
          return db
            .insert(productImages)
            .values(values)
            .onConflictDoUpdate({
              target: [productImages.productId, productImages.position],
              set: { url: values.url, alt: values.alt },
            });
        }),
      ),
    ),
  );

  await db.batch(
    nonEmpty(
      seedProducts.map((product) => {
        const values = { productId: productIds.get(product.slug)!, quantity: product.stock };
        return db
          .insert(productStock)
          .values(values)
          .onConflictDoUpdate({ target: productStock.productId, set: { quantity: values.quantity } });
      }),
    ),
  );

  console.log(
    `Seeded ${categoryIds.size} categories, ${productIds.size} products with their images and stock.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
