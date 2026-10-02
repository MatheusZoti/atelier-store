# Atelier Store

eCommerce app built with Next.js (App Router), TypeScript, Tailwind CSS, Better Auth, Drizzle ORM, and Neon Postgres.

> Scaffold only: there are no store features, schemas, auth flows, or UI yet.

## Stack

| Concern  | Choice                                                  |
| -------- | ------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack), React 19           |
| Language | TypeScript (strict)                                     |
| Styling  | Tailwind CSS v4                                         |
| Auth     | Better Auth (Drizzle adapter, `nextCookies` plugin)     |
| ORM      | Drizzle ORM + drizzle-kit                               |
| Database | Neon Postgres via `@neondatabase/serverless` (HTTP driver) |

## Project structure

```
src/
  app/
    api/auth/[...all]/route.ts   Better Auth request handler
    layout.tsx
    page.tsx
  db/
    index.ts                     Drizzle client (Neon HTTP)
    schema/index.ts              Schema barrel; drizzle-kit reads this folder
  lib/
    auth.ts                      Better Auth server instance
    auth-client.ts               Better Auth React client
    env.ts                       Server env var access with clear errors
drizzle.config.ts                drizzle-kit config (loads .env via @next/env)
drizzle/                         Generated SQL migrations (created on first db:generate)
```

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your env file and fill it in:

   ```bash
   cp .env.example .env.local
   npx auth secret          # paste the output into BETTER_AUTH_SECRET
   ```

   Get `DATABASE_URL` from the Neon console (Connect → pooled connection string).

3. Generate the Better Auth tables, then uncomment `export * from "./auth"` in `src/db/schema/index.ts`:

   ```bash
   npm run auth:generate
   ```

4. Create and apply migrations:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. Start the dev server:

   ```bash
   npm run dev
   ```

## Scripts

| Script                  | What it does                                            |
| ----------------------- | ------------------------------------------------------- |
| `npm run dev`           | Start the dev server                                    |
| `npm run build`         | Production build                                        |
| `npm run lint`          | ESLint                                                  |
| `npm run typecheck`     | TypeScript check                                        |
| `npm run auth:generate` | Generate Better Auth Drizzle tables to `src/db/schema/auth.ts` |
| `npm run db:generate`   | Generate SQL migrations from the schema                 |
| `npm run db:migrate`    | Apply migrations to the database                        |
| `npm run db:push`       | Push schema directly (prototyping only)                 |
| `npm run db:studio`     | Open Drizzle Studio                                     |

## Notes

- No sign-in methods are enabled yet. Add `emailAndPassword` or `socialProviders` in `src/lib/auth.ts` when building auth.
- The Neon HTTP driver does not support interactive transactions. If you need them, switch `src/db/index.ts` to `drizzle-orm/neon-serverless` (WebSocket `Pool`).
