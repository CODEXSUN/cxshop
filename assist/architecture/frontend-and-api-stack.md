# Frontend and API Stack

## Rendering and routing

- Next.js App Router is authoritative for public URLs, SSR, metadata, robots, sitemaps, loading boundaries, and error boundaries.
- Keep Next.js as the single web framework. Vite is an excellent lean SPA build tool, but adopting it here would require CXShop to own or add an SSR framework for the indexable storefront and would create a second frontend stack.
- The storefront renders indexable catalog and product pages on the server. Personalized prices, stock, carts, and accounts are never placed in a shared public cache.
- Turbopack is the standard compiler through current Next.js commands.
- TanStack Router is allowed inside complex client-only workspaces. It must not compete with Next.js for public URLs.
- TanStack Query owns client server-state synchronization. TanStack Table owns dense operational grids. Neither owns business state.

## Build output

- The single Next.js runtime writes only to root `.next/`.
- TypeScript backend builds write only below root `dist/`.
- Workspace-local `.next/`, `dist/`, and `dist-types/` directories are forbidden and checked by `npm run check:artifacts`.

## API surfaces

- Fastify is the HTTP adapter and composition root.
- REST is primary for commands, webhooks, uploads, and idempotency.
- GraphQL is read-oriented for storefront and operational projections. It uses the same owner services as REST.
- OpenAPI is generated from route schemas. Scalar at `/docs` is the API explorer.
- Rate limits apply globally and are stricter for login, checkout, search, upload, and webhook routes.

## Queue and cache

- MariaDB outbox and durable jobs are authoritative.
- BullMQ and Redis deliver wake-up signals, schedules, locks, rate limits, and ephemeral cache.
- BullMQ repeatable jobs call idempotent database dispatchers. They are not the only record of required work.
- Every scheduled job has one owner, version, idempotency rule, audit behavior, and recovery test.

## Product UI capabilities

- UploadThing is an optional transport. The owning module controls authorization, file policy, scanning, and media persistence.
- TipTap stores versioned validated documents and renders sanitized output.
- Framer Motion is limited to meaningful transitions and respects reduced motion.
- Recharts requires accessible labels and a tabular equivalent.
- Shared primitives belong in `@cxshop/ui`; feature components remain module-owned.

## Testing and delivery order

- Node tests cover domain and application behavior. Live MariaDB tests cover persistence, isolation, migrations, repeat seeds, and concurrency.
- Playwright covers all login routes, session isolation, storefront SEO, critical workflows, accessibility, and API contracts.
- API tests cover OpenAPI, GraphQL policy, rate limits, signatures, duplicate commands, and failed-job recovery.
- Integrate in this order: identity browser checks; documented route schemas; durable dispatcher and BullMQ schedules; catalog SSR; TanStack workspace primitives; feature-owned upload/editor/chart/motion adapters; GraphQL projections after owner REST contracts stabilize.
