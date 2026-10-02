import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cx } from "@/lib/cx";

const sizes = {
  page: "container-page",
  content: "container-content",
  prose: "container-prose",
} as const;

type ContainerProps = ComponentPropsWithoutRef<"div"> & {
  as?: ElementType;
  size?: keyof typeof sizes;
};

/** Centred, max-width wrapper with the fluid page gutter. */
export function Container({ as: Tag = "div", size = "page", className, ...props }: ContainerProps) {
  return <Tag className={cx(sizes[size], className)} {...props} />;
}

type SectionProps = ComponentPropsWithoutRef<"section"> & {
  /** Black full-bleed band; tokens invert for everything inside. */
  inverse?: boolean;
};

/** Vertical rhythm block. Pair with <Container> inside for width. */
export function Section({ inverse, className, ...props }: SectionProps) {
  return (
    <section className={cx("section", inverse && "theme-inverse bg-canvas", className)} {...props} />
  );
}
