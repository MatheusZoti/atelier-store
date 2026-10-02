import { ProductRail } from "@/components/product/product-rail";
import { Container, Heading, TextLink } from "@/components/ui";
import { finishingTouchSlugs } from "@/lib/catalog";
import { getProductsBySlugs } from "@/lib/catalog-queries";

export async function FinishingTouches() {
  const finishingTouches = await getProductsBySlugs(finishingTouchSlugs);

  return (
    <section aria-labelledby="finishing-heading" className="section">
      <Container className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <Heading id="finishing-heading" size="title">
          The finishing touch
        </Heading>
        <TextLink href="/collections/jewelry" variant="cta">
          Shop jewelry &amp; watches
        </TextLink>
      </Container>

      <ProductRail products={finishingTouches} label="Jewelry and watches" />
    </section>
  );
}
