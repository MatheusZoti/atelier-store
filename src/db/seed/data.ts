// Sample catalog loaded by `npm run db:seed`. Images are Unsplash photos (free under the
// Unsplash License); `unsplash()` builds URLs that match `images.remotePatterns`.
import { type Img, unsplash } from "@/lib/catalog";

export type SeedCategory = { slug: string; name: string; image?: Img };

export type SeedProduct = {
  slug: string;
  name: string;
  /** Price in cents (USD). */
  price: number;
  /** Category slug. */
  category: string;
  colour: string;
  /** Units available. 0 = out of stock. */
  stock: number;
  /** In display order; the first is the main image. */
  images: Img[];
  description: string;
  details: string[];
  materials: string;
  badge?: string;
};

export const categories: SeedCategory[] = [
  {
    slug: "handbags",
    name: "Handbags",
    image: unsplash("1566150905458-1bf1fc113f0d", "Pale pink leather shoulder bag on a white plinth"),
  },
  { slug: "backpacks", name: "Backpacks" },
  {
    slug: "shoes",
    name: "Shoes",
    image: unsplash("1543163521-1bf539c55dd2", "Pair of floral print stiletto pumps against a pale blue wall"),
  },
  { slug: "ready-to-wear", name: "Ready-to-wear" },
  {
    slug: "jewelry",
    name: "Jewelry",
    image: unsplash("1515562141207-7a88fb7ce338", "Pearl necklace resting in an open burgundy box"),
  },
  { slug: "watches", name: "Watches" },
  {
    slug: "eyewear",
    name: "Eyewear",
    image: unsplash("1511499767150-a48a237f0083", "Round gold-frame sunglasses on a white surface"),
  },
];

export const products: SeedProduct[] = [
  {
    slug: "lune-woven-tote",
    name: "Lune woven leather tote",
    price: 285000,
    category: "handbags",
    colour: "Cognac",
    stock: 12,
    badge: "New",
    images: [unsplash("1598532163257-ae3c6b2524b6", "Cognac woven leather tote with a gold chain strap")],
    description:
      "A soft, generous tote hand-woven from wide strips of vegetable-tanned leather. A detachable chain strap lets it move from shoulder to hand.",
    details: [
      "Hand-woven leather body",
      "Detachable gold-tone chain strap",
      "Unlined interior with zip pocket",
      "W 42 × H 30 × D 14 cm",
    ],
    materials:
      "Vegetable-tanned calf leather, brass hardware. Keep away from prolonged sunlight and moisture; store stuffed in its dust bag.",
  },
  {
    slug: "vela-croc-effect-bag",
    name: "Vela croc-effect shoulder bag",
    price: 245000,
    category: "handbags",
    colour: "Burgundy",
    stock: 7,
    images: [unsplash("1575032617751-6ddec2089882", "Burgundy croc-effect leather bag held by its strap")],
    description:
      "A compact, sculpted shoulder bag in embossed croc-effect leather, closed with a polished sculptural clasp.",
    details: [
      "Croc-effect embossed leather",
      "Polished gold-tone clasp",
      "Adjustable shoulder strap",
      "W 20 × H 24 × D 8 cm",
    ],
    materials:
      "Embossed calf leather, suede lining, gold-tone hardware. Wipe with a soft dry cloth; avoid contact with oils and perfume.",
  },
  {
    slug: "riva-structured-satchel",
    name: "Riva structured satchel",
    price: 189000,
    category: "handbags",
    colour: "Khaki",
    stock: 1,
    images: [unsplash("1612902456551-333ac5afa26e", "Khaki leather satchel with a push-lock clasp in raking sunlight")],
    description:
      "A neatly structured satchel with a push-lock front flap, sized for a day of essentials and finished with a fine leather shoulder strap.",
    details: [
      "Grained leather with structured base",
      "Push-lock flap closure",
      "Two interior compartments",
      "W 30 × H 22 × D 10 cm",
    ],
    materials:
      "Grained calf leather, cotton lining, palladium hardware. Protect from rain; condition the leather twice a year.",
  },
  {
    slug: "sorrento-leather-backpack",
    name: "Sorrento leather backpack",
    price: 210000,
    category: "backpacks",
    colour: "Rosewood",
    stock: 9,
    images: [unsplash("1622560480605-d83c853bc5c3", "Cognac leather backpack with front zip pocket")],
    description:
      "A rounded backpack in waxed full-grain leather that softens and darkens with use. Padded straps and a laptop sleeve make it an everyday piece.",
    details: [
      "Waxed full-grain leather",
      "Padded sleeve fits a 14″ laptop",
      "Front zip pocket and two side pockets",
      "W 30 × H 40 × D 14 cm",
    ],
    materials:
      "Waxed full-grain leather, canvas lining, antique brass zips. Scratches can be buffed out with a warm cloth.",
  },
  {
    slug: "marea-suede-derby",
    name: "Marea suede derby",
    price: 112000,
    category: "shoes",
    colour: "Teal",
    stock: 14,
    badge: "New",
    images: [unsplash("1560343090-f0409e92791a", "Teal suede derby shoe on a pastel pink set")],
    description:
      "A brogued derby in saturated teal suede, built on a stacked leather heel and a lightly padded footbed for all-day wear.",
    details: [
      "Brogue detailing",
      "Stacked leather heel, 3 cm",
      "Blake-stitched leather sole",
      "Made in Italy",
    ],
    materials:
      "Calf suede upper, leather lining and sole. Brush regularly with a suede brush and treat with a protective spray.",
  },
  {
    slug: "atlas-bomber-jacket",
    name: "Atlas technical bomber",
    price: 265000,
    category: "ready-to-wear",
    colour: "Rust",
    stock: 6,
    images: [unsplash("1591047139829-d91aecb6caea", "Rust bomber jacket on a hanger")],
    description:
      "A lightweight bomber in a water-repellent technical twill, cut with a relaxed body, ribbed trims and a utility sleeve pocket.",
    details: [
      "Relaxed fit; true to size",
      "Water-repellent finish",
      "Two-way front zip, sleeve pocket",
      "Ribbed collar, cuffs and hem",
    ],
    materials:
      "100% polyamide shell, cupro lining. Dry clean only.",
  },
  {
    slug: "noir-leather-jacket",
    name: "Noir leather biker jacket",
    price: 495000,
    category: "ready-to-wear",
    colour: "Black",
    stock: 0,
    images: [unsplash("1520975954732-35dd22299614", "Man in a black leather biker jacket crouching on a rooftop ledge")],
    description:
      "Our signature biker jacket in supple lambskin, with an asymmetric zip, notched lapels and a belted hem. Cut close to the body.",
    details: [
      "Slim fit; consider sizing up for layering",
      "Asymmetric front zip",
      "Zipped cuffs and chest pocket",
      "Belted hem",
    ],
    materials:
      "Lambskin leather, viscose lining, silver-tone hardware. Specialist leather clean only.",
  },
  {
    slug: "porto-nylon-backpack",
    name: "Porto nylon backpack",
    price: 98000,
    category: "backpacks",
    colour: "Navy",
    stock: 22,
    images: [unsplash("1553062407-98eeb64c6a62", "Navy nylon backpack standing on a pale floor")],
    description:
      "A clean, minimal backpack in recycled technical nylon with leather trims — light enough for travel, structured enough for the office.",
    details: [
      "Recycled technical nylon",
      "Padded laptop sleeve",
      "Hidden back pocket",
      "W 28 × H 42 × D 12 cm",
    ],
    materials:
      "Recycled polyamide, leather trims. Sponge clean with mild soap.",
  },
  {
    slug: "meridian-watch",
    name: "Meridian rose-gold watch",
    price: 420000,
    category: "watches",
    colour: "Rose gold",
    stock: 4,
    images: [unsplash("1522312346375-d1a52e2b99b3", "Rose-gold watch with a leather strap against teal velvet")],
    description:
      "A slim dress watch with a sunray dial and a rose-gold case, worn on a soft leather strap with a pin buckle.",
    details: [
      "38 mm rose-gold PVD case",
      "Automatic movement, 42-hour reserve",
      "Sapphire crystal",
      "Water resistant to 50 m",
    ],
    materials:
      "Stainless steel with rose-gold PVD, calf leather strap. Service every five years.",
  },
  {
    slug: "sol-sculpted-earrings",
    name: "Sol sculpted earrings",
    price: 76000,
    category: "jewelry",
    colour: "Gold",
    stock: 18,
    images: [unsplash("1617038220319-276d3cfab638", "Gold sculpted earrings in soft light and shadow")],
    description:
      "Twisted, organic hoops cast in gold vermeil — substantial in look, light to wear.",
    details: ["Gold vermeil", "Hinged hoop closure", "Diameter 2.2 cm", "Sold as a pair"],
    materials:
      "18k gold vermeil on sterling silver. Remove before swimming; polish with a soft cloth.",
  },
  {
    slug: "fern-drop-earrings",
    name: "Fern drop earrings",
    price: 132000,
    category: "jewelry",
    colour: "Sapphire",
    stock: 2,
    badge: "Limited",
    images: [unsplash("1535632066927-ab7c9ab60908", "Crystal drop earrings resting on a monstera leaf")],
    description:
      "Statement drop earrings set with clear crystal baguettes around a deep blue pear-cut centre stone. Made in a limited run.",
    details: ["Hand-set crystal", "Pear-cut centre stone", "Length 4.5 cm", "Post back"],
    materials:
      "Rhodium-plated brass, glass crystal. Store separately to avoid scratches.",
  },
  {
    slug: "perla-pendant",
    name: "Perla pendant necklace",
    price: 58000,
    category: "jewelry",
    colour: "Gold",
    stock: 11,
    images: [unsplash("1611085583191-a3b181a88401", "Fine gold chain with a single pearl worn at the collarbone")],
    description:
      "A single freshwater pearl suspended from a fine gold chain — an everyday piece that layers easily.",
    details: ["Freshwater pearl", "Adjustable 40–45 cm chain", "Lobster clasp"],
    materials:
      "14k gold-filled chain, freshwater pearl. Keep pearls away from perfume and lotions.",
  },
  {
    slug: "luna-layered-necklace",
    name: "Luna layered necklace",
    price: 94000,
    category: "jewelry",
    colour: "Gold",
    stock: 8,
    images: [unsplash("1599643478518-a784e5dc4c8f", "Layered gold chains with a crescent and a blue stone pendant")],
    description:
      "Two fine chains worn together: one with a crescent charm, one with a faceted blue stone.",
    details: ["Two-strand design", "Crescent and stone charms", "Lengths 42 and 48 cm"],
    materials:
      "18k gold vermeil, glass stone. Polish with a soft cloth.",
  },
];
