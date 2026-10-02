import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductListing } from "@/components/product/product-listing";
import { getLatestProducts } from "@/lib/catalog-queries";

// Catalog and stock come from the database; regenerate at most once a minute.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "New arrivals | Atelier Store",
  description: "The latest pieces from Atelier: new bags, shoes, ready-to-wear and jewelry, added each season.",
};

export default async function NewArrivalsPage() {
  const products = await getLatestProducts();

  return (
    <>
      <SiteHeader />
      <main className="flex-1 pb-section">
        <ProductListing
          title="New arrivals"
          intro="The latest pieces from the atelier, from structured leather to finishing touches."
          products={products}
        />
      </main>
      <SiteFooter />
    </>
  );
}
