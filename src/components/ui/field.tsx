import type { ComponentPropsWithoutRef } from "react";

import { cx } from "@/lib/cx";

/** Underline-only text input (newsletter, store locator, checkout). Pair with a <label>. */
export function Field({ className, ...props }: ComponentPropsWithoutRef<"input">) {
  return <input className={cx("field", className)} {...props} />;
}
