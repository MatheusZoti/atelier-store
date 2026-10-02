import type { Metadata } from "next";
import { EB_Garamond, Outfit } from "next/font/google";
import "./globals.css";

// Geometric sans for all UI and body text. Exposed as --font-sans in globals.css.
const sans = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

// Our own wordmark and rare editorial accents only. Exposed as --font-serif.
const serif = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atelier Store",
  description: "Atelier Store",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
