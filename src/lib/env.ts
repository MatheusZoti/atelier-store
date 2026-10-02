function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

/** Server-only environment variables. Do not import from client components. */
export const env = {
  get DATABASE_URL() {
    return required("DATABASE_URL");
  },
  get BETTER_AUTH_SECRET() {
    return required("BETTER_AUTH_SECRET");
  },
  get BETTER_AUTH_URL() {
    return required("BETTER_AUTH_URL");
  },
  get RESEND_API_KEY() {
    return required("RESEND_API_KEY");
  },
  /** Sender, e.g. `Atelier <hello@example.com>`. Must be on a domain verified in Resend. */
  get EMAIL_FROM() {
    return required("EMAIL_FROM");
  },
};
