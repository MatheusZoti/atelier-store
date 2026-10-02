"use client";

import { useActionState } from "react";

import {
  requestPasswordReset,
  resetPassword,
  type ForgotPasswordState,
  type ResetPasswordState,
} from "@/app/account/actions";
import { Button } from "@/components/ui";

import { FormError, FormNotice, LabeledField } from "./form-parts";

/** Asks for an email and sends a reset link. The reply is the same whether or not the account exists. */
export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<ForgotPasswordState, FormData>(requestPasswordReset, {});

  if (state.sent) {
    return (
      <FormNotice>
        {`If an account exists for ${state.email}, we've sent a link to reset your password. It expires in 30 minutes.`}
      </FormNotice>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-8">
      <LabeledField label="Email" name="email" type="email" autoComplete="email" required defaultValue={state.email} />
      <FormError>{state.error}</FormError>
      <Button type="submit" block disabled={pending}>
        {pending ? "Please wait…" : "Send reset link"}
      </Button>
    </form>
  );
}

/** Sets a new password using the token from the emailed link. */
export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ResetPasswordState, FormData>(resetPassword, {});

  return (
    <form action={action} className="flex flex-col gap-8">
      <input type="hidden" name="token" value={token} />
      <LabeledField
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        hint="At least 8 characters."
      />
      <FormError>{state.error}</FormError>
      <Button type="submit" block disabled={pending}>
        {pending ? "Please wait…" : "Change password"}
      </Button>
    </form>
  );
}
