// Seeds categories, products and stock from ./data.ts. Upserts by slug, so it is safe to re-run.
// Usage: npm run db:seed
import { loadEnvConfig } from "@next/env";

import { categories, productImages, products, productStock } from "../schema";
import { categories as seedCategories, products as seedProducts } from "./data";

// Load .env / .env.local before `@/db` is imported: it creates the Neon client on import.
loadEnvConfig(process.cwd());

async function main() {
  const { db, pool } = await import("@/db");

  // One transaction: the whole seed applies or nothing does.
  const counts = await db.transaction(async (tx) => {
    const categoryIds = new Map<string, string>();
    for (const category of seedCategories) {
      const values = {
        slug: category.slug,
        name: category.name,
        imageUrl: category.image?.src ?? null,
        imageAlt: category.image?.alt ?? null,
      };
      const [row] = await tx
        .insert(categories)
        .values(values)
        .onConflictDoUpdate({ target: categories.slug, set: values })
        .returning({ id: categories.id });
      categoryIds.set(category.slug, row.id);
    }

    const productIds = new Map<string, string>();
    for (const product of seedProducts) {
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
      const [row] = await tx
        .insert(products)
        .values(values)
        .onConflictDoUpdate({ target: products.slug, set: values })
        .returning({ id: products.id });
      productIds.set(product.slug, row.id);

      for (const [position, image] of product.images.entries()) {
        await tx
          .insert(productImages)
          .values({ productId: row.id, position, url: image.src, alt: image.alt })
          .onConflictDoUpdate({
            target: [productImages.productId, productImages.position],
            set: { url: image.src, alt: image.alt },
          });
      }

      await tx
        .insert(productStock)
        .values({ productId: row.id, quantity: product.stock })
        .onConflictDoUpdate({ target: productStock.productId, set: { quantity: product.stock } });
    }

    return { categories: categoryIds.size, products: productIds.size };
  });

  console.log(`Seeded ${counts.categories} categories, ${counts.products} products with their images and stock.`);
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
