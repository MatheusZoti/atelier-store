import { createAuthClient } from "better-auth/react";

// Same-origin by default; pass `baseURL` if the auth server lives elsewhere.
export const authClient = createAuthClient();
