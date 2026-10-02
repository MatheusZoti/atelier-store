import { CategoryRow } from "@/components/home/category-row";
import { CollectionSplit } from "@/components/home/collection-split";
import { EditorialStory } from "@/components/home/editorial-story";
import { FinishingTouches } from "@/components/home/finishing-touches";
import { Hero } from "@/components/home/hero";
import { NewArrivals } from "@/components/home/new-arrivals";
import { Newsletter } from "@/components/home/newsletter";
import { Services } from "@/components/home/services";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

// Catalog and stock come from the database; regenerate at most once a minute.
export const revalidate = 60;

export default function Home() {
  return (
    <>
      <SiteHeader overlay />
      <main className="flex-1">
        <Hero />
        <CategoryRow />
        <CollectionSplit />
        <NewArrivals />
        <EditorialStory />
        <FinishingTouches />
        <Services />
        <Newsletter />
      </main>
      <SiteFooter />
    </>
  );
}
