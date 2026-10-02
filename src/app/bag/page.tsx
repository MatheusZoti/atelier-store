import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { BagLineControls } from "@/components/bag/bag-line-controls";
import { FitBagNotice } from "@/components/bag/fit-bag-notice";
import { PageIntro } from "@/components/layout/page-intro";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button, ButtonLink, Container, Heading, MediaFrame, TextLink } from "@/components/ui";
import { formatPrice } from "@/lib/catalog";
import { type BagLine, getBag } from "@/lib/cart";
import { MAX_LINE_QUANTITY } from "@/lib/stock";

export const metadata: Metadata = {
  title: "Shopping bag | Atelier Store",
  robots: { index: false },
};

/** A stock problem with the line, or why it can't grow when stock (not the per-line cap) stops it. */
function availabilityNote({ quantity, limit, issue }: BagLine) {
  if (issue?.kind === "out-of-stock") return { text: "This piece is now out of stock. Please remove it.", alert: true };
  if (issue?.kind === "over-stock") {
    return { text: `Only ${issue.available} available. Please lower the quantity.`, alert: true };
  }
  if (quantity === limit && limit < MAX_LINE_QUANTITY) {
    return { text: limit === 1 ? "Last piece available" : `Only ${limit} available`, alert: false };
  }
  return undefined;
}

function BagItem({ line }: { line: BagLine }) {
  const { product, quantity } = line;
  const href = `/products/${product.slug}`;
  const note = availabilityNote(line);

  return (
    <li className="flex gap-4 border-b py-6 sm:gap-6">
      <Link href={href} className="w-24 shrink-0 sm:w-32" tabIndex={-1} aria-hidden="true">
        <MediaFrame>
          <Image src={product.image.src} alt="" fill sizes="8rem" className="object-cover" />
        </MediaFrame>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-1 text-body-sm sm:flex-row sm:justify-between sm:gap-6">
          <div className="flex flex-col gap-1">
            <Link href={href} className="link-quiet text-body">
              {product.name}
            </Link>
            <p className="text-muted">{product.colour}</p>
            {quantity > 1 && <p className="text-muted">{formatPrice(product.price)} each</p>}
          </div>
          <p className="font-medium sm:text-right">{formatPrice(product.price * quantity)}</p>
        </div>

        <BagLineControls slug={product.slug} name={product.name} quantity={quantity} limit={line.limit} />
        {note && <p className={note.alert ? "text-body-sm text-sale" : "text-caption text-muted"}>{note.text}</p>}
      </div>
    </li>
  );
}

export default async function BagPage() {
  const bag = await getBag();
  const empty = bag.lines.length === 0;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Container className="pt-10 pb-section lg:pt-14">
          <PageIntro title="Shopping bag">
            {!empty && (
              <p className="text-body-sm text-muted">
                {bag.count} {bag.count === 1 ? "piece" : "pieces"}
              </p>
            )}
          </PageIntro>

          {empty ? (
            <div className="mt-12 flex flex-col items-center gap-6 border-t pt-section text-center">
              <p className="text-lead font-light">Your bag is empty.</p>
              <ButtonLink href="/collections/new-arrivals" variant="secondary">
                Shop new arrivals
              </ButtonLink>
            </div>
          ) : (
            <div className="mt-12 grid gap-x-12 gap-y-12 lg:grid-cols-12">
              <section aria-label="Items in your bag" className="flex flex-col gap-6 lg:col-span-7 xl:col-span-8">
                {bag.hasIssues && <FitBagNotice />}
                <ul role="list" className="border-t">
                  {bag.lines.map((line) => (
                    <BagItem key={line.product.slug} line={line} />
                  ))}
                </ul>
              </section>

              <aside
                aria-labelledby="summary-heading"
                className="flex flex-col gap-6 lg:sticky lg:top-8 lg:col-span-5 lg:self-start xl:col-span-4"
              >
                <Heading id="summary-heading">Summary</Heading>
                <dl className="flex flex-col text-body-sm">
                  <div className="flex justify-between gap-4 border-t py-4">
                    <dt>Subtotal</dt>
                    <dd>{formatPrice(bag.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t py-4">
                    <dt>Shipping</dt>
                    <dd>Complimentary</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-y py-4 text-lead font-medium">
                    <dt>Total</dt>
                    <dd>{formatPrice(bag.subtotal)}</dd>
                  </div>
                </dl>
                {/* Checkout arrives with orders and payments (Stripe). */}
                <div className="flex flex-col gap-3">
                  <Button block disabled>
                    Checkout
                  </Button>
                  <p className="text-center text-caption text-muted">
                    {bag.hasIssues
                      ? "Please update your bag before checking out."
                      : "Online checkout opens soon."}
                  </p>
                </div>
                <ul role="list" className="flex flex-col gap-3 border-t pt-6 text-body-sm">
                  <li>Complimentary shipping, exchanges and returns.</li>
                  <li>
                    <TextLink href="/collections/new-arrivals">Continue shopping</TextLink>
                  </li>
                </ul>
              </aside>
            </div>
          )}
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
