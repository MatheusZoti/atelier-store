import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/account/password-forms";
import { PageIntro } from "@/components/layout/page-intro";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ButtonLink, Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Choose a new password | Atelier Store",
  robots: { index: false },
};

/** Reached from the emailed link: Better Auth checks the token and redirects here with `?token=` or `?error=`. */
export default async function ResetPasswordPage({ searchParams }: PageProps<"/account/reset-password">) {
  const { token, error } = await searchParams;
  const validToken = typeof token === "string" && token && !error ? token : undefined;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Container size="prose" className="flex flex-col gap-12 pt-10 pb-section lg:pt-14">
          {validToken ? (
            <>
              <PageIntro title="Choose a new password" intro="You'll be signed out on all devices once it's changed." />
              <ResetPasswordForm token={validToken} />
            </>
          ) : (
            <>
              <PageIntro
                title="Link expired"
                intro="This link has expired or was already used. Reset links are valid for 30 minutes."
              />
              <ButtonLink href="/account/forgot-password" block>
                Send a new link
              </ButtonLink>
            </>
          )}
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
