import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageIntro } from "@/components/layout/page-intro";
import { AuthForm } from "@/components/account/auth-form";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Container, TextLink } from "@/components/ui";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Create an account | Atelier Store",
  robots: { index: false },
};

export default async function SignUpPage() {
  if (await getSession()) redirect("/account");

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Container size="prose" className="flex flex-col gap-12 pt-10 pb-section lg:pt-14">
          <PageIntro
            title="Create an account"
            intro="Save your details for a faster checkout and keep track of your orders."
          />
          <AuthForm mode="sign-up" />
          <p className="border-t pt-8 text-center text-body-sm">
            Already have an account? <TextLink href="/account/sign-in">Sign in</TextLink>
          </p>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
