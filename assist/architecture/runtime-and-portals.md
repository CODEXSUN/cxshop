# Runtime and Portal Architecture

## Decision

CXShop is a modular monolith with one transactional MariaDB database, one Next.js web runtime, and one Fastify API runtime.

| Portal | Public routes | Actor scope |
| --- | --- | --- |
| Storefront | `/`, `/login`, `/account` | Guest or customer |
| Vendor | `/vendor`, `/vendor/login` | Persisted vendor member |
| Admin | `/admin`, `/admin/login` | Marketplace administrator |
| Super Admin | `/sa`, `/sa/login` | Super administrator |

Local development uses web port `7520` and API port `7510`. Production uses the same two-runtime boundary behind its public origin or reverse proxy.

API startup checks that its port is available before database work. It creates the owned CXShop database when missing, applies ordered migrations, and runs repeatable development seeds before listening. Production startup applies migrations but never creates development identities or sample catalog data.

Browser requests use the same-origin `/api/*` web path. Next.js proxies that path to the configured API origin so cookies and authentication do not depend on whether a developer opens `localhost` or `127.0.0.1`.

## Portal ownership

One web process does not mean one portal module. Each portal owns its route leaves, navigation, page state, authorization requirements, error boundaries, and feature UI under `apps/platform/web/src/modules/<portal>`.

Shared stateless controls belong in `@cxshop/ui`. Portal-specific page state must not move into the shared package. Next.js route files are thin composition adapters.

## Backend ownership

The Fastify process composes bounded contexts. Each context owns domain, application services, persistence, migrations, seeders, internal contracts, external routes, events, jobs, tests, and portal leaves where needed.

Store, Vendor, Admin, and Super Admin APIs remain distinct authorization surfaces even though one listener exposes them. Composition roots contain no business rules.

## Authentication

Identity owns accounts, credentials, portal access, and sessions. Login requires the exact portal code. A session for one portal cannot authorize another portal.

The Next.js proxy performs desk-aware redirects. It is an optimistic user-experience check only. The API verifies the signed session, portal, permission, and persisted vendor membership next to protected data access.

Development auto-login is controlled by `DEV_LOGIN_AUTO` and four configured identity emails. Opening another portal replaces the active cookie only after the backend finds that configured identity with matching persisted portal access. Production configuration rejects auto-login.

## Persistence and queues

MariaDB is authoritative. Important events enter the outbox in the business transaction. Retryable work enters durable jobs with a unique idempotency key. Redis and BullMQ accelerate delivery and scheduling but are not authoritative.

## Framework influences

- Next.js App Router owns SSR URLs and the single web composition.
- NestJS concepts guide feature modules, providers, controllers, and replaceable adapters.
- Vendure concepts guide headless server/worker separation and strategies, not caller-selected vendor authority.
- CXApp contributes approved conventions and re-owned public primitives, never private runtime dependencies.
