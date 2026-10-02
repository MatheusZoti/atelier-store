"use client";

import { useActionState } from "react";

import { signIn, signUp, type AuthFormState } from "@/app/account/actions";
import { Button, TextLink } from "@/components/ui";

import { FormError, LabeledField } from "./form-parts";

type AuthFormProps = { mode: "sign-in" | "sign-up" };

/** Email and password form for signing in or creating an account. */
export function AuthForm({ mode }: AuthFormProps) {
  const isSignUp = mode === "sign-up";
  const [state, action, pending] = useActionState<AuthFormState, FormData>(isSignUp ? signUp : signIn, {});

  return (
    <form action={action} className="flex flex-col gap-8">
      {isSignUp && (
        <LabeledField label="Full name" name="name" type="text" autoComplete="name" required defaultValue={state.name} />
      )}
      <LabeledField label="Email" name="email" type="email" autoComplete="email" required defaultValue={state.email} />
      <div className="flex flex-col gap-3">
        <LabeledField
          label="Password"
          name="password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          minLength={isSignUp ? 8 : undefined}
          required
          hint={isSignUp ? "At least 8 characters." : undefined}
        />
        {!isSignUp && (
          <TextLink href="/account/forgot-password" className="self-end text-caption">
            Forgot your password?
          </TextLink>
        )}
      </div>

      <FormError>{state.error}</FormError>

      <Button type="submit" block disabled={pending}>
        {pending ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
      </Button>
    </form>
  );
}
