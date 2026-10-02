# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Atelier Store: an eCommerce app on Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict), Tailwind CSS v4, Better Auth, Drizzle ORM, and Neon Postgres. The storefront home and product pages read products, categories and stock from Neon. Customers can create an account and sign in (email + password) and keep a shopping bag (guest or account); there is no checkout or orders yet.

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

Env vars (see `.env.example`, copy to `.env.local`): `DATABASE_URL` (Neon pooled connection string), `BETTER_AUTH_SECRET` (`npx auth secret`), `BETTER_AUTH_URL`, `RESEND_API_KEY`, `EMAIL_FROM` (sender on a domain verified in Resend; `onboarding@resend.dev` for testing, which only delivers to the Resend account owner). `next build` imports the auth route module, so these must be set for a build to succeed.

## Storefront

- Customer-facing pages are editorial and product-focused: large imagery, generous spacing, restrained controls.
- Avoid dashboard-style UI on storefront pages (dense tables, stat cards, sidebars, control-heavy layouts).
- No purple gradients.

## Database

- Use Drizzle for all database access, through `db` from `src/db`.
- Schema lives in `src/db/schema` (see the schema barrel note below).
- Never write raw SQL (including Drizzle's `sql` template or hand-edited migration files) unless explicitly asked.
- Schema changes: edit the schema, `db:generate`, review the SQL, `db:migrate`. Don't use `db:push` on the real database. `db:generate` doesn't connect, so a placeholder `DATABASE_URL` is enough for it.
- Catalog tables (`src/db/schema/catalog.ts`): `categories` 1─* `products` (`onDelete: restrict`), `products` 1─* `product_images` and 1─1 `product_stock` (both `onDelete: cascade`). Stock stays in its own table, not a column on `products`; a product with no stock row counts as 0.
- Product images live only in `product_images` (`url`, `alt`, `position`, unique per product+position); the lowest `position` is the main image. A product with no image rows is hidden from the storefront.
- Money is integer cents (`price_cents`), USD. Rows are addressed by unique `slug`; ids are uuids.
- `product_stock.quantity` has no `CHECK (>= 0)` because that needs `sql`. Keep it non-negative in app code.
- Cart tables (`src/db/schema/cart.ts`): `carts` (`user_id` unique, nullable for guests, `onDelete: cascade`) 1─* `cart_items` (one row per product, unique cart+product, cascade from both cart and product). Quantity is kept between 1 and `min(stock, MAX_LINE_QUANTITY)` in app code.
- Keep the catalog minimal until asked: no variants, orders, reviews or wishlists.
- Seed (`src/db/seed`) upserts row by row by slug with explicit `set` values (no `excluded.*`, which needs `sql`) inside one `db.transaction`, so it applies fully or not at all. Keep it idempotent; note that re-seeding resets stock to the seed quantities. It loads env first, then dynamically imports `@/db` (which reads `DATABASE_URL` when imported), and calls `pool.end()` at the end so the process exits.
- `next build` queries the catalog, so a fresh database needs `db:migrate` and `db:seed` before a build succeeds.

## Architecture

Request flow for auth: `authClient` (`src/lib/auth-client.ts`, same-origin) → `src/app/api/auth/[...all]/route.ts` (`toNextJsHandler(auth)`) → `auth` in `src/lib/auth.ts` → `drizzleAdapter(db, { provider: "pg", schema })` → `db` in `src/db/index.ts` → Neon.

Customer account: `/account` (redirects to `/account/sign-in` when signed out), `/account/sign-in`, `/account/sign-up`, `/account/forgot-password`, `/account/reset-password`. Forms post to Server Actions in `src/app/account/actions.ts`, which call `auth.api.*`; `nextCookies()` sets the session cookie. Read the session in Server Components with `getSession()` from `src/lib/session.ts`.

- **Email** goes through `sendEmail()` in `src/lib/email.ts` (Resend). It never throws; in development without `RESEND_API_KEY` it prints the email to the server log.
- **Password reset**: links expire after 30 minutes and are single-use; resetting signs the customer out everywhere. The forgot-password form always shows the same reply so it never reveals whether an account exists.
- **Email verification** is sent on sign-up but not required to sign in. Links land on `/account?verified=1` (Better Auth appends `&error=…` for bad links); `/account` shows a resend prompt while unverified.
- **Header session state** is client-side (`src/components/layout/account-links.tsx`, `authClient.useSession()`) so catalog pages stay prerendered. A Server Action sign-in doesn't update that client cache, so `/account` renders `<SessionRefresh />`; sign-out runs in the browser (`authClient.signOut()`) for the same reason.

Shopping bag: all reads and writes go through `src/lib/cart.ts` (server-only). Signed-in customers use their account cart; guests get a cart found through the httpOnly `cart_id` cookie (created on first add). `signIn` / `signUp` in `src/app/account/actions.ts` call `mergeGuestCart()` (quantities summed, capped at the line limit; never blocks sign-in). Bag changes run in `db.transaction` after locking the cart row, so double clicks don't lose updates.

- **Bag UI**: product pages post to `addToBag` (bound to the slug) in `src/app/bag/actions.ts`; `/bag` is dynamic and its steppers call `updateBagQuantity` (which calls `refresh()`). The header count (`src/components/bag/bag-count.tsx`) is client-side, fetched from `GET /api/bag` on mount and when the session user changes, and updated from the `count` every bag action returns (`setBagCount`).
- **Not yet enforced**: stock is only a cap on bag quantities; nothing is reserved until checkout (Phase 4/5).

- **Single schema barrel.** `src/db/schema/index.ts` re-exports every table file. It is consumed by three things: the runtime `db` client, the Better Auth Drizzle adapter, and drizzle-kit (`drizzle.config.ts` points at the `src/db/schema` folder). New tables go in their own file in that folder and must be re-exported from the barrel.
- **Better Auth tables are generated, not handwritten.** `npm run auth:generate` produces `src/db/schema/auth.ts` (`user`, `session`, `account`, `verification`) from the config in `src/lib/auth.ts`; never edit it by hand. Re-run it after adding Better Auth plugins or options that change tables, then `db:generate` + `db:migrate`. If the generated schema and the database drift apart, the build logs a "Drizzle schema mismatch" error.
- **Env access.** Server code reads env through `env` in `src/lib/env.ts`, whose lazy getters throw a named error when a variable is missing. It is server-only; never import it (or `src/lib/auth.ts`, `src/db`) from client components.
- **Env loading differs per tool.** Next.js loads `.env*` itself; drizzle-kit loads it via `@next/env`'s `loadEnvConfig` in `drizzle.config.ts`; the `auth` CLI loads `.env` / `.env.local` through its own config loader.
- **Neon WebSocket driver** (`drizzle-orm/neon-serverless` with a `Pool` from `@neondatabase/serverless`, using the runtime's global WebSocket, Node 22+). Supports interactive transactions: use `db.transaction` with `.for("update")` row locks for read-check-write changes such as stock (no raw `sql` needed). There is no `db.batch` on this driver. The pool is created once (cached on `globalThis` in dev for hot reloads), connects lazily, and logs idle-connection errors instead of crashing. Scripts that import `@/db` must `await pool.end()` to exit.
- **`nextCookies()`** must remain the last entry in Better Auth's `plugins` array so Server Actions can set auth cookies.

## Gotchas

- Don't add `import "server-only"` to `src/lib/auth.ts`, `src/lib/env.ts`, or `src/db/*`: the `auth` CLI loads `auth.ts` outside Next.js and that import throws there.
- The Better Auth CLI package is `auth` (matches `better-auth` versions), not the stale `@better-auth/cli`.
- Next.js 16 renamed middleware to `proxy.ts`; check `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` before adding route protection.
- Don't run `npm run build` while `npm run dev` is running from the same folder: the build overwrites `.next` and the dev server's workers crash (pages may still render while `/api/*` returns 500). Stop the dev server first and restart it afterwards.
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

- Products, categories and stock are in Postgres (see Database). Sample rows come from `src/db/seed/data.ts`.
- Read them only through `src/lib/catalog-queries.ts` (server-only), which maps rows to the `Product` / `Category` shapes in `src/lib/catalog.ts`. `catalog.ts` stays DB-free: types, `formatPrice`, `getStockState`, editorial content (hero, collections, story, services) and the curated home slug lists (`homeCategorySlugs`, `newArrivalSlugs`, `finishingTouchSlugs`; missing slugs are skipped).
- Sample images come from Unsplash's CDN through `next/image`. `images.remotePatterns` in `next.config.ts` pins the exact query string (`?w=2400&q=80&fm=jpg&fit=max`) that `unsplash()` in `catalog.ts` appends; a different query returns 400. `images.qualities` is `[75]` (Next 16 requires an allowlist).
- Stock state (in stock / only N left / out of stock) comes from `getStockState()`; the low-stock threshold is `LOW_STOCK_THRESHOLD`.
- `/` and `/products/[slug]` are prerendered from the DB at build time with `revalidate = 60` (ISR). Product slugs come from `generateStaticParams`; new products render on first visit and unknown slugs 404. The product gallery shows every image in `product.images`; with only one (as all sample products have for now) it shows the photo plus a scaled close-up crop of it.
- `/collections/new-arrivals` lists the latest products. `/collections/[category]` serves a database category by slug, else a `curatedCollections` entry from `catalog.ts` (editorial title, intro, hand-picked slugs: women, men, gifts, autumn-winter); unknown slugs 404. Both use `ProductListing`.
- Checkout on `/bag` is a disabled placeholder until orders and Stripe exist. Service, story and footer links (e.g. `/account/orders`) still point to routes that don't exist.
- The header's `overlay` variant sits on top of a full-bleed hero; other pages should render `<SiteHeader />` without it.
