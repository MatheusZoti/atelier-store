import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/account/password-forms";
import { PageIntro } from "@/components/layout/page-intro";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Container, TextLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Forgot your password? | Atelier Store",
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Container size="prose" className="flex flex-col gap-12 pt-10 pb-section lg:pt-14">
          <PageIntro
            title="Forgot your password?"
            intro="Enter the email address for your account and we'll send you a link to choose a new password."
          />
          <ForgotPasswordForm />
          <p className="border-t pt-8 text-center text-body-sm">
            Remembered it? <TextLink href="/account/sign-in">Sign in</TextLink>
          </p>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
