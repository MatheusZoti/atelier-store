import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  // Emails are sent without awaiting so response timing doesn't reveal whether an account exists.
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    resetPasswordTokenExpiresIn: 60 * 30,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Reset your Atelier password",
        text: `Hello ${user.name},\n\nUse this link to choose a new password. It expires in 30 minutes.\n\n${url}\n\nIf you didn't ask for this, you can ignore this email; your password won't change.\n\nAtelier`,
      });
    },
  },
  // Verification is encouraged, not required: unverified customers can still sign in.
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Confirm your email address",
        text: `Hello ${user.name},\n\nPlease confirm your email address for your Atelier account:\n\n${url}\n\nAtelier`,
      });
    },
  },
  // nextCookies must stay last so Server Actions can set auth cookies.
  plugins: [nextCookies()],
});
