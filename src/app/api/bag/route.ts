import { getBagCount } from "@/lib/cart";

/** Bag count for the header, fetched client-side so catalog pages stay prerendered. */
export async function GET() {
  return Response.json({ count: await getBagCount() }, { headers: { "Cache-Control": "no-store" } });
}
