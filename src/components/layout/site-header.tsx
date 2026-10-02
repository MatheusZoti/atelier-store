import Link from "next/link";

import { BagLink } from "@/components/bag/bag-count";
import { MenuIcon, PlusIcon, SearchIcon } from "@/components/ui";
import { cx } from "@/lib/cx";

import { AccountIconLink, AccountMenuLink } from "./account-links";
import { Wordmark } from "./wordmark";

const menuLinks = [
  { label: "New arrivals", href: "/collections/new-arrivals" },
  { label: "Women", href: "/collections/women" },
  { label: "Men", href: "/collections/men" },
  { label: "Handbags", href: "/collections/handbags" },
  { label: "Shoes", href: "/collections/shoes" },
  { label: "Jewelry", href: "/collections/jewelry" },
  { label: "Watches", href: "/collections/watches" },
  { label: "Gifts", href: "/collections/gifts" },
];

// Display is set per link (some hide on small screens), so it is not part of the shared class.
const iconLink = "size-10 items-center justify-center";

type SiteHeaderProps = {
  /** Transparent, white header laid over a full-bleed hero image. */
  overlay?: boolean;
};

export function SiteHeader({ overlay }: SiteHeaderProps) {
  return (
    <header
      className={cx(
        "z-20 w-full",
        overlay
          ? "absolute inset-x-0 top-0 bg-linear-to-b from-black/35 to-transparent text-white"
          : "relative border-b bg-canvas text-ink",
      )}
    >
      <div className="container-page grid h-18 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center">
        <div className="flex items-center">
          <Link href="/contact" className="link-quiet hidden items-center gap-2 text-label font-semibold md:inline-flex">
            <PlusIcon width={14} height={14} />
            Contact us
          </Link>
        </div>

        <Wordmark />

        <nav aria-label="Account and shopping" className="flex items-center justify-end">
          <Link href="/search" aria-label="Search" className={cx(iconLink, "hidden sm:inline-flex")}>
            <SearchIcon />
          </Link>
          <AccountIconLink className={cx(iconLink, "hidden sm:inline-flex")} />
          {/* min-width instead of a fixed size, so a two-digit count fits beside the icon */}
          <BagLink className="inline-flex h-10 min-w-10 items-center justify-center" />

          <details className="group">
            <summary className="flex h-10 cursor-pointer list-none items-center gap-2 pl-2 text-label font-semibold uppercase [&::-webkit-details-marker]:hidden">
              <MenuIcon />
              <span className="hidden sm:inline">Menu</span>
              <span className="sr-only sm:hidden">Menu</span>
            </summary>
            <div className="absolute inset-x-0 top-full border-t bg-canvas text-ink shadow-[0_24px_48px_-24px_rgb(0_0_0/0.25)]">
              <ul role="list" className="container-page grid gap-x-8 gap-y-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
                {menuLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="link-quiet text-lead">
                      {item.label}
                    </Link>
                  </li>
                ))}
                {/* The account icon is hidden below sm, so the menu carries the link there. */}
                <li className="border-t pt-5 sm:hidden">
                  <AccountMenuLink className="link-quiet text-lead" />
                </li>
              </ul>
            </div>
          </details>
        </nav>
      </div>
    </header>
  );
}
