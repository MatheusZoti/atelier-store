import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { cx } from "@/lib/cx";

const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  /** Solid white, for use over dark imagery. */
  "on-image": "btn-on-image",
  /** White outline, for use over dark imagery. */
  "on-image-outline": "btn-on-image-outline",
} as const;

type ButtonStyleProps = {
  variant?: keyof typeof variants;
  size?: "sm" | "md";
  /** Stretch to the container width (e.g. "Add to bag"). */
  block?: boolean;
};

function buttonClass({ variant = "primary", size = "md", block }: ButtonStyleProps, className?: string) {
  return cx("btn", variants[variant], size === "sm" && "btn-sm", block && "btn-block", className);
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & ButtonStyleProps;

export function Button({ variant, size, block, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass({ variant, size, block }, className)} {...props} />;
}

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & ButtonStyleProps;

/** A navigation link styled as a button. */
export function ButtonLink({ variant, size, block, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass({ variant, size, block }, className)} {...props} />;
}

type IconButtonProps = ComponentPropsWithoutRef<"button"> & {
  /** Required: icon-only controls need an accessible name. */
  "aria-label": string;
};

/** Round icon-only control (carousel arrows, close). */
export function IconButton({ className, type = "button", ...props }: IconButtonProps) {
  return <button type={type} className={cx("btn-icon", className)} {...props} />;
}
