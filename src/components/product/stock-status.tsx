import { getStockState, type Product } from "@/lib/catalog";
import { cx } from "@/lib/cx";

const dot = {
  "in-stock": "bg-success",
  "low-stock": "bg-sale",
  "out-of-stock": "bg-muted",
} as const;

const text = {
  "in-stock": "text-ink",
  "low-stock": "text-sale",
  "out-of-stock": "text-muted",
} as const;

export function StockStatus({ product, className }: { product: Product; className?: string }) {
  const state = getStockState(product);
  return (
    <p className={cx("inline-flex items-center gap-2 text-body-sm", text[state.status], className)}>
      <span aria-hidden="true" className={cx("size-1.5 rounded-full", dot[state.status])} />
      {state.label}
    </p>
  );
}
