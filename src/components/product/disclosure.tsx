import type { ReactNode } from "react";

/** Expandable row with hairline divider (native <details>, no JS). */
export function Disclosure({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group border-b">
      <summary className="flex cursor-pointer list-none items-center justify-between py-6 text-lead font-medium [&::-webkit-details-marker]:hidden">
        {title}
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
          className="transition-transform group-open:rotate-180"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="pb-8 text-body font-light">{children}</div>
    </details>
  );
}
