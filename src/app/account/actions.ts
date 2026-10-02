"use server";

import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { getSession } from "@/lib/session";

export type AuthFormState = { error?: string; name?: string; email?: string };
export type ForgotPasswordState = { error?: string; email?: string; sent?: boolean };
export type ResetPasswordState = { error?: string };
export type ResendVerificationState = { sent?: boolean; error?: string };

/** Where verification links land; Better Auth appends `&error=…` when a link is bad. */
const VERIFIED_URL = "/account?verified=1";
const INVALID_LINK = "This link has expired or was already used. Please request a new one.";

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** Customer-facing message for a failed Better Auth call. */
function authErrorMessage(error: unknown, fallback: string) {
  if (!isAPIError(error)) {
    console.error(error);
    return "Something went wrong. Please try again.";
  }
  switch (error.body?.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "The email or password is incorrect.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "An account with this email already exists. Please sign in.";
    case "PASSWORD_TOO_SHORT":
      return "Your password must be at least 8 characters.";
    case "INVALID_EMAIL":
      return "Please enter a valid email address.";
    case "INVALID_TOKEN":
      return INVALID_LINK;
    default:
      return fallback;
  }
}

// nextCookies() in src/lib/auth.ts sets the session cookie from these actions.

export async function signIn(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = field(formData, "email");
  const password = formData.get("password");
  if (!email || typeof password !== "string" || !password) {
    return { email, error: "Please enter your email and password." };
  }

  try {
    await auth.api.signInEmail({ body: { email, password }, headers: await headers() });
  } catch (error) {
    return { email, error: authErrorMessage(error, "We couldn't sign you in. Please try again.") };
  }
  redirect("/account");
}

export async function signUp(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const name = field(formData, "name");
  const email = field(formData, "email");
  const password = formData.get("password");
  if (!name || !email || typeof password !== "string" || !password) {
    return { name, email, error: "Please fill in every field." };
  }

  try {
    await auth.api.signUpEmail({
      body: { name, email, password, callbackURL: VERIFIED_URL },
      headers: await headers(),
    });
  } catch (error) {
    return { name, email, error: authErrorMessage(error, "We couldn't create your account. Please try again.") };
  }
  redirect("/account");
}

/** Always reports success, so the form never reveals whether an account exists. */
export async function requestPasswordReset(
  _state: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = field(formData, "email");
  if (!email) return { error: "Please enter your email address." };

  try {
    await auth.api.requestPasswordReset({
      body: { email, redirectTo: `${env.BETTER_AUTH_URL}/account/reset-password` },
      headers: await headers(),
    });
  } catch (error) {
    console.error(error);
  }
  return { email, sent: true };
}

export async function resetPassword(_state: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> {
  const token = field(formData, "token");
  const newPassword = formData.get("password");
  if (!token) return { error: INVALID_LINK };
  if (typeof newPassword !== "string" || !newPassword) return { error: "Please enter a new password." };

  try {
    await auth.api.resetPassword({ body: { token, newPassword }, headers: await headers() });
  } catch (error) {
    return { error: authErrorMessage(error, "We couldn't reset your password. Please try again.") };
  }
  redirect("/account/sign-in?reset=1");
}

export async function resendVerificationEmail(): Promise<ResendVerificationState> {
  const session = await getSession();
  if (!session) redirect("/account/sign-in");
  if (session.user.emailVerified) return { sent: true };

  try {
    await auth.api.sendVerificationEmail({
      body: { email: session.user.email, callbackURL: VERIFIED_URL },
      headers: await headers(),
    });
  } catch (error) {
    console.error(error);
    return { error: "We couldn't send the email. Please try again later." };
  }
  return { sent: true };
}
