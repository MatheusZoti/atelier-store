"use server";

import { refresh } from "next/cache";

import { addToCart, CartError, setCartQuantity } from "@/lib/cart";

export type AddToBagState = {
  status?: "added" | "at-limit";
  /** Customer-facing message for `at-limit` or a refusal. */
  message?: string;
  error?: string;
  /** Units in the bag after the change, for the header count. */
  count?: number;
};

export type BagChangeResult = { count?: number; error?: string };

function failure(error: unknown, fallback: string) {
  if (error instanceof CartError) return error.message;
  console.error(error);
  return fallback;
}

/** Product page "Add to bag"; the page binds `slug` (it is validated against the catalog here). */
export async function addToBag(slug: string): Promise<AddToBagState> {
  try {
    const { added, limit, count } = await addToCart(slug);
    if (added === 0) {
      return {
        status: "at-limit",
        count,
        message:
          limit === 1
            ? "The last piece is already in your bag."
            : `Your bag already holds the most we can offer (${limit}).`,
      };
    }
    return { status: "added", count };
  } catch (error) {
    return { error: failure(error, "We couldn't add this to your bag. Please try again.") };
  }
}

/** Bag page quantity change; 0 removes the line. */
export async function updateBagQuantity(slug: string, quantity: number): Promise<BagChangeResult> {
  if (!Number.isFinite(quantity)) return { error: "Please choose a valid quantity." };
  try {
    const count = await setCartQuantity(slug, quantity);
    refresh();
    return { count };
  } catch (error) {
    return { error: failure(error, "We couldn't update your bag. Please try again.") };
  }
}
