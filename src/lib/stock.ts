// Stock rules in one place: how many units a bag line may hold, what to tell the customer when
// stock drops below their bag, and reserving / releasing units for checkout.
// Server-only: never import from client components.
import { asc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { productStock, products } from "@/db/schema";

/** Most units of one piece a bag line holds, even when more are in stock. */
export const MAX_LINE_QUANTITY = 10;

/** Most units a bag line may hold right now. */
export function lineLimit(stock: number) {
  return Math.max(0, Math.min(stock, MAX_LINE_QUANTITY));
}

/** Why a bag line can't be bought as it is. */
export type LineIssue = { kind: "out-of-stock" } | { kind: "over-stock"; available: number };

export function getLineIssue(quantity: number, stock: number): LineIssue | undefined {
  if (stock <= 0) return { kind: "out-of-stock" };
  if (quantity > stock) return { kind: "over-stock", available: stock };
  return undefined;
}

export type StockRequest = { productId: string; quantity: number };
export type Shortage = { productId: string; name: string; requested: number; available: number };

/** Thrown by `reserveStock` when any product is short; nothing is reserved. */
export class OutOfStockError extends Error {
  constructor(readonly shortages: Shortage[]) {
    super(`Not enough stock for ${shortages.map((shortage) => shortage.name).join(", ")}`);
    this.name = "OutOfStockError";
  }
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Sums duplicate products and rejects anything that isn't a positive whole number. */
function totalsByProduct(items: StockRequest[]) {
  const totals = new Map<string, number>();
  for (const { productId, quantity } of items) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new RangeError(`Invalid stock quantity ${quantity} for product ${productId}`);
    }
    totals.set(productId, (totals.get(productId) ?? 0) + quantity);
  }
  return totals;
}

/**
 * Locks the stock rows of these products until the transaction ends. Rows are locked in id
 * order, so two checkouts with overlapping bags wait for each other instead of deadlocking.
 */
async function lockStock(tx: Tx, productIds: string[]) {
  const rows = await tx
    .select({ productId: productStock.productId, quantity: productStock.quantity })
    .from(productStock)
    .where(inArray(productStock.productId, productIds))
    .orderBy(asc(productStock.productId))
    .for("update");
  return new Map(rows.map((row) => [row.productId, row.quantity]));
}

/** Runs `work` in the caller's transaction, or in a new one. */
function inTransaction<T>(tx: Tx | undefined, work: (tx: Tx) => Promise<T>) {
  return tx ? work(tx) : db.transaction(work);
}

/**
 * Takes units out of stock, all or nothing: if any product is short, throws `OutOfStockError`
 * naming every short product and changes nothing. Pass `tx` to make it part of a larger
 * transaction (e.g. creating an order); the caller's transaction then rolls back on the error.
 */
export function reserveStock(items: StockRequest[], tx?: Tx): Promise<void> {
  const totals = totalsByProduct(items);
  if (totals.size === 0) return Promise.resolve();

  return inTransaction(tx, async (tx) => {
    const ids = [...totals.keys()];
    const available = await lockStock(tx, ids);

    const short = ids.filter((id) => (available.get(id) ?? 0) < totals.get(id)!);
    if (short.length > 0) {
      const names = await tx
        .select({ id: products.id, name: products.name })
        .from(products)
        .where(inArray(products.id, short));
      const nameById = new Map(names.map((row) => [row.id, row.name]));
      throw new OutOfStockError(
        short.map((id) => ({
          productId: id,
          name: nameById.get(id) ?? "A piece in your bag",
          requested: totals.get(id)!,
          available: available.get(id) ?? 0,
        })),
      );
    }

    for (const id of ids) {
      await tx
        .update(productStock)
        .set({ quantity: available.get(id)! - totals.get(id)! })
        .where(eq(productStock.productId, id));
    }
  });
}

/** Puts reserved units back (e.g. an abandoned or cancelled checkout). */
export function releaseStock(items: StockRequest[], tx?: Tx): Promise<void> {
  const totals = totalsByProduct(items);
  if (totals.size === 0) return Promise.resolve();

  return inTransaction(tx, async (tx) => {
    const ids = [...totals.keys()];
    const current = await lockStock(tx, ids);
    for (const id of ids) {
      if (!current.has(id)) {
        // Reserving needs a stock row, so this only happens if the row was deleted since.
        console.warn(`[stock] no stock row for product ${id}; ${totals.get(id)} units not released`);
        continue;
      }
      await tx
        .update(productStock)
        .set({ quantity: current.get(id)! + totals.get(id)! })
        .where(eq(productStock.productId, id));
    }
  });
}
