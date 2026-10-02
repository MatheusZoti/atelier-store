import type { Product } from "@/lib/catalog";
import { cx } from "@/lib/cx";

import { ProductCard } from "./product-card";

type ProductRailProps = {
  products: Product[];
  /** Accessible name for the scrollable region. */
  label: string;
  className?: string;
};

/** Full-bleed horizontally scrolling product row (native scroll + snap, no JS). */
export function ProductRail({ products, label, className }: ProductRailProps) {
  return (
    <ul
      role="list"
      tabIndex={0}
      aria-label={label}
      className={cx("scroll-rail gap-0.5 pb-6 focus-visible:-outline-offset-2", className)}
    >
      {products.map((product) => (
        <li key={product.slug} className="w-[72%] shrink-0 snap-start sm:w-[42%] lg:w-[28%] xl:w-[22%]">
          <ProductCard
            product={product}
            sizes="(min-width: 80rem) 22vw, (min-width: 64rem) 28vw, (min-width: 40rem) 42vw, 72vw"
          />
        </li>
      ))}
    </ul>
  );
}
