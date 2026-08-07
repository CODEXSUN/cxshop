# Dependency Policy

## Ownership rule

CXShop owns its domain model, application services, authorization policy, contracts, migrations, seeders, repositories, queue semantics, portal modules, UI composition, and developer tools.

Do not add a library for helpers, CRUD generation, business rules, state machines, repositories, validation wrappers, design systems, or abstractions that CXShop can express clearly in small owned code.

## Approval test

A production dependency is allowed only when it implements security-sensitive behavior, is a selected runtime/driver/protocol, or provides a complex standard that would be unsafe or wasteful to recreate. It must also have an implemented owner feature and pass license, maintenance, vulnerability, bundle, and replacement-boundary review.

Record the owner, purpose, surface, and removal path when adding a dependency. Remove unused direct dependencies immediately.

## Approved foundation dependencies

| Dependency | Purpose | Boundary |
| --- | --- | --- |
| Next.js, React | SSR web runtime | Route and rendering adapters only |
| Fastify and selected plugins | HTTP, cookies, CORS, headers, rate limits, OpenAPI | API transport |
| Kysely, mysql2 | Typed SQL and MariaDB driver | Infrastructure and migration runner |
| Zod | Contract and environment validation | Transport boundaries |
| Argon2, JOSE | Password hashing and signed sessions | Identity infrastructure |
| BullMQ, ioredis | Redis delivery and schedules | Non-authoritative queue adapter |
| GraphQL | Standards-compliant query execution | Read API adapter |
| Scalar | OpenAPI explorer | Development and operations UI |
| Lucide React | Accessible icons | Shared UI primitives |
| OpenAI JavaScript SDK | Responses API provider adapter | Business Assist infrastructure only |

TanStack, Playwright, UploadThing, TipTap, Framer Motion, and Recharts are not foundation dependencies. Add each only with its first implemented owner feature and focused tests.

## Kysely rule

- Kysely types stay in infrastructure and composition code.
- Domain entities and application contracts never expose Kysely builders, rows, transactions, or generated types.
- Repositories map database names to owned domain or DTO names.
- Migrations remain ordered and permanent and are verified on fresh and existing MariaDB schemas.
- Raw SQL is allowed in migrations and measured queries when Kysely cannot express MariaDB behavior clearly. Keep it local and tested.
