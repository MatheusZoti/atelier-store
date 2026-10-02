import Link from "next/link";

import { Container, Eyebrow } from "@/components/ui";

const columns = [
  {
    title: "May we help you?",
    links: [
      { label: "Contact us", href: "/contact" },
      { label: "My order", href: "/account/orders" },
      { label: "FAQs", href: "/help" },
      { label: "Shipping & returns", href: "/help/shipping" },
    ],
  },
  {
    title: "The company",
    links: [
      { label: "About Atelier", href: "/about" },
      { label: "Craftsmanship", href: "/stories/the-atelier" },
      { label: "Careers", href: "/careers" },
      { label: "Privacy policy", href: "/legal/privacy" },
      { label: "Terms of use", href: "/legal/terms" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Book an appointment", href: "/services/appointments" },
      { label: "Personalization", href: "/services/personalization" },
      { label: "Collect in store", href: "/services/collect-in-store" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="theme-inverse bg-canvas pt-section">
      <Container>
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col gap-5">
              <Eyebrow className="text-muted">{column.title}</Eyebrow>
              <ul role="list" className="flex flex-col gap-4">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="link text-body-sm font-medium">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div className="flex flex-col gap-5">
            <Eyebrow className="text-muted">Country / region</Eyebrow>
            <Link href="/locale" className="link text-body-sm font-medium">
              United States (USD $)
            </Link>
          </div>
        </div>

        <p className="mt-20 text-caption text-muted">
          © {new Date().getFullYear()} Atelier. All rights reserved.
        </p>

        <p
          aria-hidden="true"
          className="mt-10 overflow-hidden pb-4 text-center font-serif text-[14vw] leading-[0.8] tracking-[0.12em] uppercase select-none"
        >
          Atelier
        </p>
      </Container>
    </footer>
  );
}
