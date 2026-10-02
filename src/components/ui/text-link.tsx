import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { cx } from "@/lib/cx";

const variants = {
  /** Underlined, inherits size. For running text, breadcrumbs, footers. */
  inline: "link",
  /** 16px underlined sentence-case call to action ("Explore options"). */
  cta: "link-cta",
  /** No underline until hover, for navigation. */
  quiet: "link-quiet",
} as const;

type TextLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: keyof typeof variants;
};

export function TextLink({ variant = "inline", className, ...props }: TextLinkProps) {
  return <Link className={cx(variants[variant], className)} {...props} />;
}
