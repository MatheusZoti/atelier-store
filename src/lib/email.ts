// Transactional email through Resend. Server-only: never import from client components.
import { Resend } from "resend";

import { env } from "@/lib/env";

type Email = { to: string; subject: string; text: string };

let resend: Resend | undefined;

/**
 * Sends an email and reports whether it was accepted. Never throws, so a mail outage can't
 * break sign-up or reveal anything through an error. In development without RESEND_API_KEY
 * the email is printed to the server log instead.
 */
export async function sendEmail({ to, subject, text }: Email): Promise<boolean> {
  if (process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY) {
    console.info(`[email] RESEND_API_KEY is not set; not sending.\nTo: ${to}\nSubject: ${subject}\n\n${text}`);
    return true;
  }

  try {
    resend ??= new Resend(env.RESEND_API_KEY);
    const { error } = await resend.emails.send({ from: env.EMAIL_FROM, to, subject, text });
    if (error) {
      console.error(`[email] Resend rejected "${subject}":`, error);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[email] Failed to send "${subject}":`, error);
    return false;
  }
}
