import Link from "next/link";
import type { ReactNode } from "react";

import { Heading } from "@/components/ui";

type PageIntroProps = {
  /** Page heading (h1); also the last breadcrumb. */
  title: string;
  /** Optional short lead under the heading. */
  intro?: ReactNode;
  /** Extra content under the lead (e.g. a muted count). */
  children?: ReactNode;
};

/** Centred breadcrumb, title and lead at the top of listing and account pages. */
export function PageIntro({ title, intro, children }: PageIntroProps) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <nav aria-label="Breadcrumb" className="text-caption">
        <ol className="flex flex-wrap items-center justify-center gap-1.5">
          <li>
            <Link href="/" className="link">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-muted">
            {title}
          </li>
        </ol>
      </nav>
      <Heading as="h1" size="title" className="mt-4">
        {title}
      </Heading>
      {intro && <p className="max-w-prose text-lead font-light">{intro}</p>}
      {children}
    </div>
  );
}
