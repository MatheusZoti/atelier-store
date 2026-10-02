"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

import { Button } from "@/components/ui";
import { authClient } from "@/lib/auth-client";

/**
 * Refreshes the client session (used by the header) on mount. Render it where a Server Action
 * may just have signed the customer in (the account page), since the client cache can't see that.
 */
export function SessionRefresh() {
  const { refetch } = authClient.useSession();
  useEffect(() => {
    void refetch();
  }, [refetch]);
  return null;
}

/** Signs out in the browser so the header's cached session clears immediately. */
export function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await authClient.signOut();
          router.replace("/");
          router.refresh();
        })
      }
    >
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
