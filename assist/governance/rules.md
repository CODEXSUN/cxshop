# Governance Rules

## Product boundary

- CXShop owns marketplace commerce.
- CXApp owns its SaaS, ERP, billing, accounting, CRM, and platform behavior.
- Frappe owns records stored in a connected Frappe site.
- An integration can map data. It must not transfer ownership silently.
- Never read or write an external product database directly.

## Module ownership

- One business entity has one owning bounded context.
- The owner contains its schema, migration, repository, service, API, events, jobs, tests, and UI.
- A composition root registers modules. It does not implement business workflows.
- Cross-module reads use a public query contract.
- Cross-module writes use an application service, command, or approved event.
- Do not create a generic CRUD engine for unrelated business entities.
- Do not import private files from another module.

## Marketplace integrity

- Separate a catalog product from a vendor offer.
- Store inventory by vendor, offer, location, and stock state.
- Reserve stock with atomic database behavior and an expiry time.
- Represent one checkout as a customer order with seller orders when multiple vendors participate.
- Record charges, refunds, commissions, fees, taxes, and settlements in an immutable ledger.
- Make payment, webhook, order, inventory, and settlement commands idempotent.
- Keep an auditable state transition history.

## Trusted scope

- Resolve the actor from a verified server session or signed service identity.
- Resolve vendor access from persisted membership.
- Never trust a browser-provided vendor ID as authorization.
- Never trust a browser-provided tenant, company, database, role, price, fee, or payable amount.
- Recalculate price, tax, discount, shipping, commission, and payable totals on the server.
- Apply authorization before repository access.

## Data and migrations

- MariaDB is the transactional source of truth.
- Use explicit migration keys and an ordered migration ledger.
- A migration changes structure. A seeder adds repeatable defaults.
- Make seeders safe to run more than once.
- Test fresh and existing database upgrades.
- Never renumber existing records to match a fresh seed.
- Use public UUIDs for URLs and external references.
- Use internal numeric keys for local relational joins unless a module documents another need.

## Events and jobs

- Write important events to an outbox in the business transaction.
- Include event ID, version, aggregate identity, actor, correlation ID, and timestamp.
- Include vendor and customer scope only when the consumer needs it.
- Do not include secrets or full payment data in events or logs.
- Make consumers idempotent.
- Use durable jobs for payments, webhooks, mail, search, settlement, imports, exports, and integrations.

## Integrations

- CXApp and Frappe integration uses versioned APIs, webhooks, or events.
- Store external IDs in explicit mapping records.
- Verify webhook signatures before processing.
- Store delivery attempts and masked responses.
- Define one owner for each synchronized field.
- Use reconciliation jobs to detect missed or conflicting updates.
- Fail closed when credentials or scope are invalid.

## Security

- Use HttpOnly, Secure, SameSite cookies for browser sessions.
- Store passwords with an approved password hash.
- Encrypt integration credentials at rest.
- Keep payment card data outside CXShop through payment-provider tokenization.
- Apply rate limits to authentication, checkout, webhook, and public search routes.
- Audit high-risk actions and permission changes.
- Do not log secrets, tokens, passwords, complete payment payloads, or private identity documents.

## Repository hygiene

- Preserve unrelated work.
- Do not commit secrets, generated logs, local storage, database dumps, or runtime uploads.
- Keep one root dependency tree and one root lockfile.
- Keep generated application output only in root `.next/` and root `dist/`. Nested workspace build directories are forbidden.
- Run commands from the repository root.
- Do not claim a check passed unless it ran successfully.
- Keep local runtime values in the ignored root `.env`.
- Keep shareable environment keys and safe placeholders in `.env.example`.
- Use short environment names grouped by purpose. Prefer `API_*`, `WEB_*`, `DB_*`, `LOGIN_*`, `DEV_LOGIN_*`, `REDIS_*`, and `OPENAI_*`.
- Reuse only the approved CXApp infrastructure listed in `assist/operations/shared-infrastructure.md`.
- Keep CXShop data in its own database, Redis index and prefix, and media subdirectory.
- Never create, replace, stop, remove, or prune CXApp-owned infrastructure from CXShop tooling.

## Mandatory code structure

- Use a modular monolith until measured operational evidence approves a service extraction.
- Organize business capabilities as bounded contexts, not technical CRUD folders.
- A complete context uses `domain`, `application`, `infrastructure`, `api`, and `portal` layers when each layer has real behavior.
- Do not create empty ceremonial layers or generic base repositories for unrelated entities.
- Domain code contains invariants and must not import HTTP, UI, database, queue, or framework adapters.
- Application services coordinate domain behavior through explicit ports.
- Infrastructure implements persistence, migrations, seeders, queues, and external adapters.
- API routes validate transport data, authorize the actor, call one application service, and map the response.
- Composition roots only configure and register modules. They must not contain business rules or database queries.
- Keep source files below 300 lines when practical. No source file may exceed 700 lines. Split by one clear responsibility before reaching the limit.
- Keep functions small and cohesive. A function with multiple business jobs must be split.
- Prefer explicit classes for services and repositories. Add an abstraction only after a real boundary or repeated implementation requires it.

## Mandatory module completeness

- A new persisted business entity must ship with its owner-controlled migration, repository, application service, API contract, authorization, audit behavior, tests, and relevant portal leaf in the same delivery slice.
- A migration changes schema. A seeder creates repeatable defaults. Never hide schema upgrades in application startup or seeders.
- Every migration has a permanent ordered key. Never renumber or rewrite an applied migration.
- Test migrations on a fresh database and on the supported previous schema.
- Seeders must be safe to repeat and must not overwrite user-owned values.
- Repositories accept trusted scope from application services. They must not derive authority from request payloads.
- Every state-changing external command defines an idempotency contract.
- Every important business transition records actor, reason, correlation ID, old state, new state, and time.

## Four-portal boundary

- CXShop has four module-owned portal compositions in one standalone web runtime: Storefront, Vendor, Admin, and Super Admin.
- Storefront owns public discovery and customer account experiences.
- Vendor owns seller catalog, offers, stock, fulfilment, returns, and settlement experiences for persisted memberships.
- Admin owns marketplace moderation, operations, support, disputes, and risk.
- Super Admin owns platform access, runtime governance, integrations, audit, queues, and delivery governance.
- `/login` is the customer login, `/vendor/login` is the gateway vendor login, `/admin/login` is the Admin login, and `/sa/login` is the Super Admin login.
- The one web runtime must preserve `/login`, `/vendor/login`, `/admin/login`, and `/sa/login` with portal-aware redirects.
- A session is issued for one exact portal. A session for one portal must never authorize another portal.
- Portals may share CXShop-owned design tokens and stateless controls. They must not share authorization decisions, page state, feature-private UI, or server repositories.
- Run CXShop locally on two application ports only: one web port and one API port. Portal URL paths must not require separate listeners.
- UI hiding is never authorization. Enforce the same permission at the API and repository boundary.

## Internal and external contracts

- Cross-context in-process access uses a small owner-exported command or query contract.
- Internal consumers must not import another context's private domain, repository, migration, or table types.
- External HTTP contracts are versioned under `/v1` or a later explicit version.
- Validate all request path, query, header, and body inputs and validate critical external responses.
- Use DTOs that expose only required values. Never serialize repository rows directly.
- Public identifiers are UUIDs. Internal numeric keys do not cross an API boundary.
- Storefront APIs, Vendor APIs, Admin APIs, and Super Admin APIs are distinct surfaces even when one runtime composes them.
- External integrations use signed APIs, webhooks, events, or files. Never query an external product database.

## DDD marketplace rules

- Catalog Product and Vendor Offer are separate aggregates with separate owners.
- Vendor is not a tenant. Vendor access comes only from an active persisted membership and active vendor state.
- Cart references offers. Order stores the accepted commercial snapshot and never reads mutable catalog values as historical truth.
- One checkout creates one Customer Order and one Seller Order per participating vendor.
- Inventory reservations use atomic conditional database updates, expiry, confirmation, and release commands.
- Financial effects use an append-only ledger. Do not update a calculated balance as the only financial record.
- Price, tax, discount, shipping, commission, fee, and payable totals are recalculated on the server.
- Explicit state machines govern vendor, offer, order, payment, fulfilment, return, refund, and settlement transitions.

## Queue and event rules

- Insert an important domain event into the transactional outbox in the same MariaDB transaction as its business change.
- Durable jobs are stored before acknowledging work that must survive a process or Redis outage.
- Every event includes event ID, name, schema version, aggregate identity, actor, correlation ID, and occurrence time.
- Every job includes name, version, idempotency key, correlation ID, bounded attempts, backoff policy, availability time, and safe payload.
- Consumers assume at-least-once delivery and must be idempotent.
- Workers use a recoverable lease or atomic claim. A crash must make abandoned work eligible again.
- Exhausted jobs enter a visible failed state and require an authorized, audited retry.
- Redis is an optional cache, lock, rate-limit, and delivery accelerator. It is never the source of truth.
- Never include secrets, complete payment payloads, or protected documents in events, jobs, or logs.

## Framework and reuse rules

- Use Next.js App Router conventions for portal route composition, server rendering, loading, error, metadata, and private route-local code.
- Use NestJS concepts of feature modules, controllers, providers, guards, and dependency injection without allowing framework decorators to own domain behavior.
- Use Vendure concepts only where they fit CXShop ownership: headless contracts, server/worker separation, explicit strategies, and typed commerce models.
- Do not accept a Vendure-style caller-selected channel or seller token as vendor authority.
- CXApp is a design and integration reference. Reuse only approved public contracts, patterns, tokens, or re-owned primitives.
- Do not import CXApp private source, copy CXApp business modules, or create a runtime dependency on the CXApp checkout.
- Follow `assist/governance/dependencies.md`. Prefer small owned code and reject convenience dependencies without an implemented owner feature.
- Use Kysely only in infrastructure repositories, migrations, seeders, and composition. Never expose ORM types through domain or public contracts.
- Development auto-login must be environment-gated, disabled in production, mapped to configured persisted identities, and limited to the exact portal being opened.
- Switching portals replaces the active browser session and rechecks persisted portal access. It must never grant vendor scope from the requested URL.

## Developer and user experience rules

- Root commands are the supported developer entry points. Keep install, dev, build, check, migrate, seed, test, and deployment commands documented and repeatable.
- Root `npm run build` must clean stale outputs and produce only root `.next/` and root `dist/`.
- Keep one root lockfile and one root dependency tree.
- Configuration uses validated, human-readable environment names with safe examples and no committed secrets.
- Errors use stable machine codes and safe user messages. Do not expose stack traces or database errors to browsers.
- Every portal must provide accessible labels, keyboard operation, visible focus, responsive layout, and clear loading, empty, error, and success states.
- Use one primary action per page and realistic product language. Do not ship lorem ipsum or decorative controls without behavior.
- Update the closest authoritative architecture document, project inventory, and roadmap when behavior or ownership changes.
