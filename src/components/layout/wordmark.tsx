import Link from "next/link";

import { cx } from "@/lib/cx";

/** The store's own serif wordmark. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Atelier, home"
      className={cx("font-serif text-2xl leading-none tracking-[0.3em] uppercase sm:text-3xl", className)}
    >
      Atelier
    </Link>
  );
}
