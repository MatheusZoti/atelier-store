import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { FormNotice } from "@/components/account/form-parts";
import { SessionRefresh, SignOutButton } from "@/components/account/session-sync";
import { VerifyEmailNotice } from "@/components/account/verify-email-notice";
import { PageIntro } from "@/components/layout/page-intro";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ButtonLink, Container, Heading } from "@/components/ui";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "My account | Atelier Store",
  robots: { index: false },
};

const memberSince = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const session = await getSession();
  if (!session) redirect("/account/sign-in");
  const { user } = session;
  // Set by Better Auth when a verification link lands here (see VERIFIED_URL in ./actions).
  const { verified, error } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <SessionRefresh />
        <Container size="content" className="flex flex-col gap-14 pt-10 pb-section lg:pt-14">
          <div className="flex flex-col gap-8">
            <PageIntro title="My account" intro={`Welcome, ${user.name}.`} />
            {error && (
              <p role="alert" className="bg-surface px-4 py-4 text-center text-body-sm text-sale">
                That confirmation link has expired or is invalid.
              </p>
            )}
            {user.emailVerified
              ? verified === "1" && !error && <FormNotice>Thank you, your email address is confirmed.</FormNotice>
              : <VerifyEmailNotice email={user.email} />}
          </div>

          <div className="grid gap-x-16 gap-y-12 border-t pt-12 md:grid-cols-2">
            <section aria-labelledby="details-heading" className="flex flex-col gap-6">
              <Heading id="details-heading">Account details</Heading>
              <dl className="flex flex-col text-body-sm">
                <div className="flex flex-col gap-1 border-b py-4">
                  <dt className="text-caption text-muted">Name</dt>
                  <dd>{user.name}</dd>
                </div>
                <div className="flex flex-col gap-1 border-b py-4">
                  <dt className="text-caption text-muted">Email</dt>
                  <dd className="break-all">{user.email}</dd>
                </div>
                <div className="flex flex-col gap-1 border-b py-4">
                  <dt className="text-caption text-muted">Member since</dt>
                  <dd>{memberSince.format(user.createdAt)}</dd>
                </div>
              </dl>
              <div>
                <SignOutButton />
              </div>
            </section>

            <section aria-labelledby="orders-heading" className="flex flex-col gap-6">
              <Heading id="orders-heading">Orders</Heading>
              <p className="text-lead font-light">You haven&rsquo;t placed any orders yet.</p>
              <div>
                <ButtonLink href="/collections/new-arrivals">Shop new arrivals</ButtonLink>
              </div>
            </section>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
