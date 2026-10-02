"use client";

// Bag count shared by the header and the bag controls. Client-side for the same reason as the
// account links: the header renders on prerendered catalog pages.
import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";

import { BagIcon } from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { cx } from "@/lib/cx";

let bagCount: number | undefined;
const listeners = new Set<() => void>();

/** Updates every bag count on the page (call with the count a bag action returns). */
export function setBagCount(count: number | undefined) {
  if (count === undefined || count === bagCount) return;
  bagCount = count;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Current bag count; fetched on mount and whenever the signed-in account changes. */
function useBagCount() {
  const count = useSyncExternalStore(
    subscribe,
    () => bagCount,
    () => undefined,
  );
  const { data, isPending } = authClient.useSession();
  const userId = data?.user.id;

  useEffect(() => {
    if (isPending) return;
    const controller = new AbortController();
    fetch("/api/bag", { cache: "no-store", signal: controller.signal })
      .then((response) => (response.ok ? response.json() : undefined))
      .then((body: { count: number } | undefined) => setBagCount(body?.count))
      .catch(() => {});
    return () => controller.abort();
  }, [userId, isPending]);

  return count;
}

/** Header bag link with the number of pieces in the bag. */
export function BagLink({ className }: { className?: string }) {
  const count = useBagCount();

  return (
    <Link
      href="/bag"
      aria-label={count ? `Shopping bag, ${count} ${count === 1 ? "item" : "items"}` : "Shopping bag"}
      className={cx("gap-1", className)}
    >
      <BagIcon />
      {count ? <span className="text-label font-semibold tabular-nums">{count}</span> : null}
    </Link>
  );
}
