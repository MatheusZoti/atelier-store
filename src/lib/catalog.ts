// Storefront types, helpers and editorial content. Products, categories and stock live in
// the database (see src/lib/catalog-queries.ts); this file stays free of DB imports.
// Images are Unsplash photos (free under the Unsplash License).

export type Img = { src: string; alt: string };

export type CategorySlug = string;

export type Product = {
  slug: string;
  name: string;
  /** Price in cents (USD). */
  price: number;
  category: CategorySlug;
  categoryName: string;
  colour: string;
  /** Units available. 0 = out of stock. */
  stock: number;
  /** Main image (the first of `images`). */
  image: Img;
  /** All images in display order. */
  images: Img[];
  description: string;
  details: string[];
  materials: string;
  badge?: string;
};

export type Category = { slug: CategorySlug; name: string; image: Img };

export type Collection = {
  slug: string;
  title: string;
  description: string;
  image: Img;
};

export type Service = { title: string; cta: string; href: string; image: Img };

/** Builds an Unsplash CDN URL. The query must match `images.remotePatterns` in next.config.ts. */
export function unsplash(id: string, alt: string): Img {
  return { src: `https://images.unsplash.com/photo-${id}?w=2400&q=80&fm=jpg&fit=max`, alt };
}

const priceFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatPrice(cents: number) {
  return priceFormat.format(cents / 100);
}

/** Units at or below this count show as "only N left". */
export const LOW_STOCK_THRESHOLD = 3;

export type StockState =
  | { status: "in-stock"; label: string }
  | { status: "low-stock"; label: string }
  | { status: "out-of-stock"; label: string };

export function getStockState(product: Product): StockState {
  if (product.stock <= 0) return { status: "out-of-stock", label: "Out of stock" };
  if (product.stock <= LOW_STOCK_THRESHOLD) {
    return { status: "low-stock", label: `Only ${product.stock} left` };
  }
  return { status: "in-stock", label: "In stock" };
}

// Curated home page selections, by slug. Slugs missing from the database are skipped.
export const homeCategorySlugs = ["handbags", "shoes", "eyewear", "jewelry"];

export const newArrivalSlugs = [
  "lune-woven-tote",
  "vela-croc-effect-bag",
  "riva-structured-satchel",
  "sorrento-leather-backpack",
  "marea-suede-derby",
  "atlas-bomber-jacket",
  "noir-leather-jacket",
  "porto-nylon-backpack",
];

export const finishingTouchSlugs = [
  "meridian-watch",
  "sol-sculpted-earrings",
  "fern-drop-earrings",
  "perla-pendant",
  "luna-layered-necklace",
];

export const hero = {
  eyebrow: "Autumn – Winter",
  title: "The Quiet Season",
  cta: { label: "Discover the collection", href: "/collections/autumn-winter" },
  image: unsplash(
    "1581044777550-4cfa60707c03",
    "Woman in a voluminous white ruffled blouse standing in a dry autumn field",
  ),
};

export const collections: Collection[] = [
  {
    slug: "women",
    title: "Women's Collection",
    description: "Tailored outerwear in soft, muted tones.",
    image: unsplash(
      "1485462537746-965f33f7f6a7",
      "Woman in a long pink coat walking through a stone arcade",
    ),
  },
  {
    slug: "men",
    title: "Men's Collection",
    description: "Considered suiting for every occasion.",
    image: unsplash("1594938298603-c8148c4dae35", "Man in a blue checked three-piece suit"),
  },
];

export const story = {
  eyebrow: "The Atelier",
  title: "Made slowly, made to last.",
  body: "Each piece begins in our workshop with natural fibres and leathers chosen for how they age. We cut in small runs, finish by hand and repair for life.",
  cta: { label: "Read the story", href: "/stories/the-atelier" },
  image: unsplash(
    "1558769132-cb1aea458c5e",
    "Rail of neutral-toned garments beside dried pampas grass",
  ),
};

export const services: Service[] = [
  {
    title: "Book an appointment",
    cta: "Choose your visit",
    href: "/services/appointments",
    image: unsplash("1441986300917-64674bd600d8", "Boutique interior with folded knitwear on wooden shelves"),
  },
  {
    title: "Personalization",
    cta: "Explore options",
    href: "/services/personalization",
    image: unsplash("1562157873-818bc0726f68", "Folded sweaters in red, black, white, navy and yellow"),
  },
  {
    title: "Collect in store",
    cta: "Discover how",
    href: "/services/collect-in-store",
    image: unsplash("1490481651871-ab68de25d43d", "Minimal clothing rail with pale garments on hangers"),
  },
];
