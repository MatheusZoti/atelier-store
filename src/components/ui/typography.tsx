import type { ComponentPropsWithoutRef } from "react";

import { cx } from "@/lib/cx";

const headingSizes = {
  /** 16px semibold uppercase: standard section heading ("Services"). */
  section: "heading-section",
  /** ~24px regular uppercase: carousel / module titles ("You may also like"). */
  title: "heading-title",
  /** ~32px light, sentence case: brand or newsletter statements. */
  statement: "heading-statement",
  /** Large editorial headline. Use rarely; imagery should lead. */
  display: "heading-display",
} as const;

type HeadingProps = ComponentPropsWithoutRef<"h2"> & {
  as?: "h1" | "h2" | "h3" | "h4" | "p";
  size?: keyof typeof headingSizes;
  /** Editorial serif, sentence case. Use sparingly. */
  serif?: boolean;
};

export function Heading({ as: Tag = "h2", size = "section", serif, className, ...props }: HeadingProps) {
  return (
    <Tag
      className={cx(headingSizes[size], serif && "font-serif font-normal normal-case", className)}
      {...props}
    />
  );
}

/** Small semibold uppercase label (section kicker, footer column head). */
export function Eyebrow({ className, ...props }: ComponentPropsWithoutRef<"p">) {
  return <p className={cx("eyebrow", className)} {...props} />;
}
