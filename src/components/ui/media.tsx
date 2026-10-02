import type { ComponentPropsWithoutRef } from "react";

import { cx } from "@/lib/cx";

const ratios = {
  product: "aspect-product",
  square: "aspect-square",
  hero: "aspect-hero",
  wide: "aspect-wide",
} as const;

type MediaFrameProps = ComponentPropsWithoutRef<"div"> & {
  ratio?: keyof typeof ratios;
};

/**
 * Fixed-ratio frame on the light surface colour. Put a `next/image` with
 * `fill` inside: `object-contain` for product cut-outs, `object-cover` for
 * lifestyle imagery.
 */
export function MediaFrame({ ratio = "product", className, ...props }: MediaFrameProps) {
  return <div className={cx("media-frame", ratios[ratio], className)} {...props} />;
}

/**
 * Responsive product grid: 2 → 3 → 4 columns with hairline column gaps.
 * Render it full-bleed (outside <Container>); pad the text under each tile instead.
 */
export function ProductGrid({ className, ...props }: ComponentPropsWithoutRef<"ul">) {
  return <ul role="list" className={cx("product-grid", className)} {...props} />;
}
