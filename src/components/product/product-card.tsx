import Image from "next/image";
import Link from "next/link";

import { MediaFrame } from "@/components/ui";
import { formatPrice, type Product } from "@/lib/catalog";

type ProductCardProps = {
  product: Product;
  /** `sizes` for the image; match the column count of the parent layout. */
  sizes: string;
};

export function ProductCard({ product, sizes }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <MediaFrame>
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-standard group-hover:scale-[1.03]"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-canvas px-2 py-1 text-caption text-ink">{product.badge}</span>
        )}
      </MediaFrame>
      <div className="flex flex-col px-3 pt-4 pb-2 text-body-sm">
        <span className="group-hover:underline group-hover:underline-offset-[0.3em]">{product.name}</span>
        <span className="mt-3 flex items-baseline gap-3">
          {formatPrice(product.price)}
          {product.stock <= 0 && <span className="text-caption text-muted">Out of stock</span>}
        </span>
      </div>
    </Link>
  );
}
