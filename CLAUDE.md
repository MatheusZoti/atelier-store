# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Atelier Store: an eCommerce app on Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict), Tailwind CSS v4, Better Auth, Drizzle ORM, and Neon Postgres. The storefront home and product pages read products, categories and stock from Neon; there is no cart, checkout, orders or sign-in UI yet.

## Commands

```bash
npm run dev            # dev server (Turbopack)
npm run build          # production build
npm run lint           # ESLint (flat config, eslint-config-next)
npm run typecheck      # tsc --noEmit
npm run auth:generate  # Better Auth CLI → writes Drizzle tables to src/db/schema/auth.ts
npm run db:generate    # drizzle-kit: schema diff → SQL migrations in drizzle/
npm run db:migrate     # apply migrations to Neon
npm run db:push        # push schema directly (prototyping only)
npm run db:studio      # Drizzle Studio
npm run db:seed        # upsert sample categories/products/stock (src/db/seed), safe to re-run
```

There is no test runner configured yet.

Env vars (see `.env.example`, copy to `.env.local`): `DATABASE_URL` (Neon pooled connection string), `BETTER_AUTH_SECRET` (`npx auth secret`), `BETTER_AUTH_URL`. `next build` imports the auth route module, so these must be set for a build to succeed.

## Storefront

- Customer-facing pages are editorial and product-focused: large imagery, generous spacing, restrained controls.
- Avoid dashboard-style UI on storefront pages (dense tables, stat cards, sidebars, control-heavy layouts).
- No purple gradients.

## Database

- Use Drizzle for all database access, through `db` from `src/db`.
- Schema lives in `src/db/schema` (see the schema barrel note below).
- Never write raw SQL (including Drizzle's `sql` template or hand-edited migration files) unless explicitly asked.

## Architecture

Request flow for auth: `authClient` (`src/lib/auth-client.ts`, same-origin) → `src/app/api/auth/[...all]/route.ts` (`toNextJsHandler(auth)`) → `auth` in `src/lib/auth.ts` → `drizzleAdapter(db, { provider: "pg", schema })` → `db` in `src/db/index.ts` → Neon.

- **Single schema barrel.** `src/db/schema/index.ts` re-exports every table file. It is consumed by three things: the runtime `db` client, the Better Auth Drizzle adapter, and drizzle-kit (`drizzle.config.ts` points at the `src/db/schema` folder). New tables go in their own file in that folder and must be re-exported from the barrel.
- **Better Auth tables are generated, not handwritten.** `npm run auth:generate` produces `src/db/schema/auth.ts` from the config in `src/lib/auth.ts`; the barrel's `export * from "./auth"` is commented out until it exists. Re-run it after adding Better Auth plugins or options that change tables, then `db:generate` + `db:migrate`. Until the auth tables exist, the build logs a "Drizzle schema mismatch" error and auth requests fail.
- **Env access.** Server code reads env through `env` in `src/lib/env.ts`, whose lazy getters throw a named error when a variable is missing. It is server-only; never import it (or `src/lib/auth.ts`, `src/db`) from client components.
- **Env loading differs per tool.** Next.js loads `.env*` itself; drizzle-kit loads it via `@next/env`'s `loadEnvConfig` in `drizzle.config.ts`; the `auth` CLI loads `.env` / `.env.local` through its own config loader.
- **Neon HTTP driver** (`drizzle-orm/neon-http`): stateless, no interactive transactions. Better Auth's Postgres path does not need them (adapter `transaction` defaults to false). Anything that needs `db.transaction` (e.g. checkout/order writes) requires switching `src/db/index.ts` to `drizzle-orm/neon-serverless` with a WebSocket `Pool`.
- **`nextCookies()`** must remain the last entry in Better Auth's `plugins` array so Server Actions can set auth cookies.

## Gotchas

- Don't add `import "server-only"` to `src/lib/auth.ts`, `src/lib/env.ts`, or `src/db/*`: the `auth` CLI loads `auth.ts` outside Next.js and that import throws there.
- The Better Auth CLI package is `auth` (matches `better-auth` versions), not the stale `@better-auth/cli`.
- Next.js 16 renamed middleware to `proxy.ts`; check `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` before adding route protection.
- Tailwind v4 is configured in CSS (`src/app/globals.css`); there is no `tailwind.config` file.

## Design system

- Tokens live in `@theme` in `src/app/globals.css`. The default Tailwind colour palette is removed (`--color-*: initial`): only `canvas`, `ink`, `ink-soft`, `muted`, `surface`, `surface-strong`, `line`, `sale`, `success`, `white`, `black` exist, so classes like `text-red-500` silently produce nothing.
- Use the token utilities (`text-caption`/`label`/`body-sm`/`body`/`lead`/`title`/`statement`/`display`, `px-gutter`, `py-section`, `max-w-page`, `aspect-product`…) instead of arbitrary values.
- Reusable primitives are in `src/components/ui` (`Container`, `Section`, `Button`, `ButtonLink`, `IconButton`, `TextLink`, `Heading`, `Eyebrow`, `Field`, `MediaFrame`, `ProductGrid`). They apply classes from `@layer components` in `globals.css`, so a `className` utility always overrides them.
- Fonts: Outfit (`font-sans`, all UI and body) and EB Garamond (`font-serif`, our wordmark and rare editorial accents only), loaded via `next/font` in `layout.tsx`.
- Type is small and quiet: most headings are 16px semibold uppercase (`Heading size="section"`); `display` is rare. Imagery leads.
- Square corners everywhere except round icon controls (`IconButton`). 1px `line` hairlines; underline-only form fields; underlined text links.
- Product grids are full-bleed (outside `Container`) with hairline gaps and 3:4 tiles on `surface`; product text is padded inside the card.
- For black bands (footer, newsletter) use `<Section inverse>` or `.theme-inverse bg-canvas`; it re-maps tokens instead of adding dark variants. Over photography use the `on-image` button variants. There is no dark mode.

## Storefront data and images

- Products, categories and stock are in Postgres: tables `categories`, `products` (FK `category_id`, price in cents, `details` text[]) and `product_stock` (1:1, `quantity`) in `src/db/schema/catalog.ts`. Sample rows come from `src/db/seed/data.ts` via `npm run db:seed`.
- Read them only through `src/lib/catalog-queries.ts` (server-only), which maps rows to the `Product` / `Category` shapes in `src/lib/catalog.ts`. `catalog.ts` stays DB-free: types, `formatPrice`, `getStockState`, editorial content (hero, collections, story, services) and the curated home slug lists (`homeCategorySlugs`, `newArrivalSlugs`, `finishingTouchSlugs`; missing slugs are skipped).
- Sample images come from Unsplash's CDN through `next/image`. `images.remotePatterns` in `next.config.ts` pins the exact query string (`?w=2400&q=80&fm=jpg&fit=max`) that `unsplash()` in `catalog.ts` appends; a different query returns 400. `images.qualities` is `[75]` (Next 16 requires an allowlist).
- Stock state (in stock / only N left / out of stock) comes from `getStockState()`; the low-stock threshold is `LOW_STOCK_THRESHOLD`.
- `/` and `/products/[slug]` are prerendered from the DB at build time with `revalidate = 60` (ISR). Product slugs come from `generateStaticParams`; new products render on first visit and unknown slugs 404. The product gallery shows the photo plus a scaled close-up crop of the same image, since sample products have one photo each.
- "Add to bag" is not wired to anything yet (no cart). Collection, bag, account and service links still point to routes that don't exist.
- The header's `overlay` variant sits on top of a full-bleed hero; other pages should render `<SiteHeader />` without it.
