"use client";

// Session-aware account links for the header. Client-side on purpose: SiteHeader renders on
// prerendered catalog pages, and reading the session on the server would make them dynamic.
import Link from "next/link";

import { UserIcon } from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { cx } from "@/lib/cx";

function useAccount() {
  const { data, isPending } = authClient.useSession();
  const signedIn = Boolean(data?.user);
  // Until the session loads, link to /account, which forwards signed-out visitors to sign-in.
  return {
    signedIn,
    href: isPending || signedIn ? "/account" : "/account/sign-in",
    name: data?.user.name,
  };
}

/** Header account icon; a small dot marks a signed-in customer. */
export function AccountIconLink({ className }: { className?: string }) {
  const { signedIn, href, name } = useAccount();

  return (
    <Link
      href={href}
      aria-label={signedIn ? `My account (signed in as ${name})` : "Sign in"}
      title={signedIn ? `Signed in as ${name}` : "Sign in"}
      className={cx("relative", className)}
    >
      <UserIcon />
      {signedIn && <span aria-hidden="true" className="absolute top-2 right-2 size-1.5 rounded-full bg-current" />}
    </Link>
  );
}

/** Account entry in the mobile menu. */
export function AccountMenuLink({ className }: { className?: string }) {
  const { signedIn, href } = useAccount();

  return (
    <Link href={href} className={className}>
      {signedIn ? "My account" : "Sign in"}
    </Link>
  );
}
