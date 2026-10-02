"use client";

import { useActionState } from "react";

import { resendVerificationEmail, type ResendVerificationState } from "@/app/account/actions";

/** Quiet prompt on the account page while the customer's email is unverified. */
export function VerifyEmailNotice({ email }: { email: string }) {
  const [state, action, pending] = useActionState<ResendVerificationState>(resendVerificationEmail, {});

  return (
    <div className="flex flex-col items-center gap-2 bg-surface px-4 py-4 text-center text-body-sm" role="status">
      <p>
        Please confirm your email address. We sent a link to <span className="font-medium break-all">{email}</span>.
      </p>
      {state.sent ? (
        <p className="text-success">A new link is on its way.</p>
      ) : (
        <form action={action}>
          <button type="submit" className="link cursor-pointer text-caption" disabled={pending}>
            {pending ? "Sending…" : "Send a new link"}
          </button>
        </form>
      )}
      {state.error && <p className="text-sale">{state.error}</p>}
    </div>
  );
}
