// Shopping bag storage. Signed-in customers use their account cart; guests get a cart found
// through an httpOnly `cart_id` cookie, merged into the account cart when they sign in.
// Server-only: never import from client components. Functions that may create a cart or touch
// the cookie (`addToCart`, `mergeGuestCart`) must run in a Server Action.
import { and, asc, eq, isNull } from "drizzle-orm";
import { cookies } from "next/headers";

import { db } from "@/db";
import { cartItems, carts, productStock, products } from "@/db/schema";
import type { Product } from "@/lib/catalog";
import { toProduct, withRelations } from "@/lib/catalog-queries";
import { getSession } from "@/lib/session";
import { getLineIssue, lineLimit, type LineIssue } from "@/lib/stock";

const CART_COOKIE = "cart_id";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A customer-facing reason a bag change was refused. */
export class CartError extends Error {}

export type BagLine = {
  product: Product;
  quantity: number;
  /** Most this line can hold right now: stock, capped at MAX_LINE_QUANTITY. */
  limit: number;
  /** Set when stock has dropped below the line since it was added. */
  issue?: LineIssue;
};

export type Bag = {
  lines: BagLine[];
  count: number;
  subtotal: number;
  /** True when any line has an `issue`; checkout must wait until it is fixed. */
  hasIssues: boolean;
};

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function guestCartId() {
  const id = (await cookies()).get(CART_COOKIE)?.value;
  // Ignore tampered values: a non-uuid would make Postgres reject the query.
  return id && UUID.test(id) ? id : undefined;
}

/** The current visitor's cart id, without creating one. */
async function findCartId(): Promise<string | undefined> {
  const session = await getSession();
  if (session) {
    const row = await db.query.carts.findFirst({
      where: eq(carts.userId, session.user.id),
      columns: { id: true },
    });
    return row?.id;
  }

  const id = await guestCartId();
  if (!id) return undefined;
  const row = await db.query.carts.findFirst({
    where: and(eq(carts.id, id), isNull(carts.userId)),
    columns: { id: true },
  });
  return row?.id;
}

/** Returns the account cart, creating it if needed. Safe against concurrent creation. */
async function ensureUserCart(tx: Tx | typeof db, userId: string) {
  await tx.insert(carts).values({ userId }).onConflictDoNothing({ target: carts.userId });
  const [row] = await tx.select({ id: carts.id }).from(carts).where(eq(carts.userId, userId));
  return row.id;
}

async function getOrCreateCartId(): Promise<string> {
  const existing = await findCartId();
  if (existing) return existing;

  const session = await getSession();
  if (session) return ensureUserCart(db, session.user.id);

  const [row] = await db.insert(carts).values({}).returning({ id: carts.id });
  (await cookies()).set(CART_COOKIE, row.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return row.id;
}

/** Locks the cart row so concurrent changes to the same bag (e.g. double clicks) run one at a time. */
async function lockCart(tx: Tx, cartId: string) {
  await tx.select({ id: carts.id }).from(carts).where(eq(carts.id, cartId)).for("update");
  await tx.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId));
}

async function findPurchasable(slug: string) {
  const [row] = await db
    .select({ id: products.id, stock: productStock.quantity })
    .from(products)
    .leftJoin(productStock, eq(productStock.productId, products.id))
    .where(eq(products.slug, slug));
  if (!row) throw new CartError("This piece is no longer available.");
  return { id: row.id, limit: lineLimit(row.stock ?? 0) };
}

async function countItems(cartId: string) {
  const rows = await db
    .select({ quantity: cartItems.quantity })
    .from(cartItems)
    .where(eq(cartItems.cartId, cartId));
  return rows.reduce((sum, row) => sum + row.quantity, 0);
}

/** Total units in the visitor's bag (0 when there is no cart). */
export async function getBagCount(): Promise<number> {
  const cartId = await findCartId();
  return cartId ? countItems(cartId) : 0;
}

/** The visitor's bag with current product data, oldest line first. */
export async function getBag(): Promise<Bag> {
  const cartId = await findCartId();
  if (!cartId) return { lines: [], count: 0, subtotal: 0, hasIssues: false };

  const rows = await db.query.cartItems.findMany({
    where: eq(cartItems.cartId, cartId),
    with: { product: { with: withRelations } },
    orderBy: [asc(cartItems.createdAt), asc(cartItems.id)],
  });
  const lines = rows.flatMap((row) => {
    const product = toProduct(row.product);
    if (!product) return [];
    const issue = getLineIssue(row.quantity, product.stock);
    return [{ product, quantity: row.quantity, limit: lineLimit(product.stock), issue }];
  });
  return {
    lines,
    hasIssues: lines.some((line) => line.issue),
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
  };
}

/**
 * Adds units of a product, capped at its line limit. Returns how many were actually added
 * (0 when the line is already at the limit) and the bag's new count.
 */
export async function addToCart(slug: string, quantity = 1) {
  const product = await findPurchasable(slug);
  if (product.limit === 0) throw new CartError("This piece is out of stock.");

  const cartId = await getOrCreateCartId();
  const added = await db.transaction(async (tx) => {
    await lockCart(tx, cartId);
    const [line] = await tx
      .select({ id: cartItems.id, quantity: cartItems.quantity })
      .from(cartItems)
      .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, product.id)));
    const current = line?.quantity ?? 0;
    const next = Math.min(current + quantity, product.limit);
    if (next <= current) return 0;

    if (line) await tx.update(cartItems).set({ quantity: next }).where(eq(cartItems.id, line.id));
    else await tx.insert(cartItems).values({ cartId, productId: product.id, quantity: next });
    return next - current;
  });

  return { added, limit: product.limit, count: await countItems(cartId) };
}

/** Sets a line's quantity, capped at its line limit; 0 or less removes it. Returns the new count. */
export async function setCartQuantity(slug: string, quantity: number) {
  const cartId = await findCartId();
  if (!cartId) return 0;
  const product = await findPurchasable(slug);
  const next = Math.min(Math.floor(quantity), product.limit);

  await db.transaction(async (tx) => {
    await lockCart(tx, cartId);
    const where = and(eq(cartItems.cartId, cartId), eq(cartItems.productId, product.id));
    if (next > 0) await tx.update(cartItems).set({ quantity: next }).where(where);
    else await tx.delete(cartItems).where(where);
  });
  return countItems(cartId);
}

/**
 * Brings every line back within current stock: lowers quantities to what is available and
 * removes pieces that sold out. Returns the bag's new count.
 */
export async function fitCartToStock() {
  const cartId = await findCartId();
  if (!cartId) return 0;

  await db.transaction(async (tx) => {
    await lockCart(tx, cartId);
    const lines = await tx
      .select({ id: cartItems.id, quantity: cartItems.quantity, stock: productStock.quantity })
      .from(cartItems)
      .leftJoin(productStock, eq(productStock.productId, cartItems.productId))
      .where(eq(cartItems.cartId, cartId));

    for (const line of lines) {
      const limit = lineLimit(line.stock ?? 0);
      if (line.quantity <= limit) continue;
      if (limit > 0) await tx.update(cartItems).set({ quantity: limit }).where(eq(cartItems.id, line.id));
      else await tx.delete(cartItems).where(eq(cartItems.id, line.id));
    }
  });
  return countItems(cartId);
}

/**
 * Moves the guest bag (from the cookie) into the account's bag after sign-in or sign-up.
 * Quantities for the same piece are added together, capped at the line limit. Clears the cookie.
 */
export async function mergeGuestCart(userId: string) {
  const guestId = await guestCartId();
  if (!guestId) return;

  await db.transaction(async (tx) => {
    const guest = await tx.query.carts.findFirst({
      where: and(eq(carts.id, guestId), isNull(carts.userId)),
      with: { items: { with: { product: { columns: { id: true }, with: { stock: true } } } } },
    });
    if (!guest) return;

    if (guest.items.length > 0) {
      const cartId = await ensureUserCart(tx, userId);
      await lockCart(tx, cartId);
      const existing = await tx
        .select({ id: cartItems.id, productId: cartItems.productId, quantity: cartItems.quantity })
        .from(cartItems)
        .where(eq(cartItems.cartId, cartId));
      const byProduct = new Map(existing.map((line) => [line.productId, line]));

      for (const item of guest.items) {
        const line = byProduct.get(item.productId);
        const current = line?.quantity ?? 0;
        const next = Math.min(current + item.quantity, lineLimit(item.product.stock?.quantity ?? 0));
        if (next <= current) continue;
        if (line) await tx.update(cartItems).set({ quantity: next }).where(eq(cartItems.id, line.id));
        // Keep when it was first added, so the bag keeps its order (now() is the same for the whole transaction).
        else
          await tx
            .insert(cartItems)
            .values({ cartId, productId: item.productId, quantity: next, createdAt: item.createdAt });
      }
    }
    await tx.delete(carts).where(eq(carts.id, guest.id));
  });

  (await cookies()).delete(CART_COOKIE);
}
