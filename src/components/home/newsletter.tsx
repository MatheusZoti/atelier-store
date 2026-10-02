import Link from "next/link";

import { Container, Eyebrow, Heading, PlusIcon } from "@/components/ui";

export function Newsletter() {
  return (
    <section aria-labelledby="newsletter-heading" className="section theme-inverse border-b bg-canvas">
      <Container className="flex flex-col items-center gap-8 text-center">
        <Eyebrow id="newsletter-heading">Sign up for Atelier updates</Eyebrow>
        <Heading as="p" size="statement" className="max-w-3xl">
          Be the first to hear about new collections, private appointments and stories from the workshop.
        </Heading>
        <Link href="/newsletter" className="link-quiet inline-flex items-center gap-2 text-label font-semibold">
          <PlusIcon width={14} height={14} />
          Subscribe
        </Link>
      </Container>
    </section>
  );
}
