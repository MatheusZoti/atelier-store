import type { ComponentPropsWithoutRef } from "react";

import { Field } from "@/components/ui";

type LabeledFieldProps = ComponentPropsWithoutRef<"input"> & {
  label: string;
  /** Quiet helper text under the field. */
  hint?: string;
};

/** Caption label above an underline field, with optional hint. */
export function LabeledField({ label, hint, ...props }: LabeledFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-caption text-muted">{label}</span>
      <Field {...props} />
      {hint && <span className="mt-1 text-caption text-muted">{hint}</span>}
    </label>
  );
}

/** Live region for a form error; renders nothing visible when empty. */
export function FormError({ children }: { children?: string }) {
  return (
    <p role="alert" aria-live="polite" className="-my-4 min-h-5 text-body-sm text-sale empty:hidden">
      {children}
    </p>
  );
}

/** Quiet confirmation line (e.g. "Your password has been changed"). */
export function FormNotice({ children }: { children: string }) {
  return (
    <p role="status" className="bg-surface px-4 py-4 text-center text-body-sm text-success">
      {children}
    </p>
  );
}
