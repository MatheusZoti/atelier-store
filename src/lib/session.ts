// Current customer session for Server Components and Server Actions. Server-only.
import { headers } from "next/headers";
import { cache } from "react";

import { auth } from "@/lib/auth";

/** The signed-in session, or null. Deduplicated per request. */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));
