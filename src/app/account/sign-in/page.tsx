import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageIntro } from "@/components/layout/page-intro";
import { AuthForm } from "@/components/account/auth-form";
import { FormNotice } from "@/components/account/form-parts";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Container, TextLink } from "@/components/ui";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sign in | Atelier Store",
  robots: { index: false },
};

export default async function SignInPage({ searchParams }: PageProps<"/account/sign-in">) {
  if (await getSession()) redirect("/account");
  const { reset } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Container size="prose" className="flex flex-col gap-12 pt-10 pb-section lg:pt-14">
          <PageIntro title="Sign in" intro="Sign in to view your details and orders." />
          {reset === "1" && <FormNotice>Your password has been changed. Please sign in with your new password.</FormNotice>}
          <AuthForm mode="sign-in" />
          <p className="border-t pt-8 text-center text-body-sm">
            New to Atelier? <TextLink href="/account/sign-up">Create an account</TextLink>
          </p>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
