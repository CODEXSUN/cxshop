# Delivery Roadmap

## Stage 0: Runnable foundation

- [x] Define four module-owned portals in one web runtime with exact login scopes.
- [x] Add shared contracts, framework primitives, and CXShop-owned UI.
- [x] Add MariaDB migration ledger, Identity tables, audit, outbox, durable jobs, and project-management tables.
- [x] Add portal-scoped login, session, logout, health, and project query routes.
- [ ] Verify migration and repeated seed against live MariaDB.
- [ ] Verify all four browser login and session-isolation flows.
- [x] Compose `/vendor`, `/admin`, and `/sa` routes in the single Next.js runtime.
- [x] Add environment-gated auto-login, persisted portal switching, and desk-aware expiry redirects.
- [x] Adopt Kysely for typed repositories, ordered migrations, and repeatable foundation seeds.
- [x] Add disabled-by-default OpenAI Business Assist with durable requests, worker retries, result polling, and provider isolation.
- [x] Add the Catalog schema, repeatable sample catalog, public reads, Admin writes, audit records, outbox events, and SSR storefront routes.
- [x] Add the interim WhatsApp enquiry, manual confirmation, billing, ready-for-collection, and collected workflow.

Exit when all four portals authenticate against live persistence with correct isolated scopes.

## Stage 1: Single-vendor transaction

- [x] Ship a responsive enquiry-to-store-collection flow without online checkout, payment, shipping, or inventory claims.
- Vendor onboarding, verification, membership, and permission workflows
- Catalog products and variants, vendor offers, pricing, and atomic inventory
- Store discovery, cart, checkout, customer order, and seller order
- Manual payment and shipping strategies followed by one production adapter each
- Durable confirmation, notification, expiry, and reconciliation jobs

Exit when one vendor completes an order without manual database changes.

## Stage 2: Multi-vendor marketplace

- Mixed-vendor allocation and seller-order state machines
- Server-calculated tax, discount, shipping, fee, and commission snapshots
- Append-only vendor ledger, settlement, reconciliation, and payout approvals
- Partial cancellation, return, refund, dispute, and chargeback workflows
- Vendor and platform operational reporting

Exit when concurrent stock, mixed checkout, duplicate payment, and partial refund tests pass with live persistence.

## Stage 3: Connected operations

- Versioned CXApp and optional Frappe adapters
- Signed payment, shipping, and ERP webhooks
- Search projection, imports, exports, media processing, and reconciliation
- Failure dashboards, audited retry, dead-letter handling, and OpenTelemetry

Exit when duplicate callbacks and external outages cannot corrupt committed CXShop state.

## Stage 4: Scale and industry packs

- Measured cache, query, queue, and read-model improvements
- B2B quantity pricing, RFQ, contract pricing, and credit policy
- Industry-owned extensions through public module contracts
- Mobile clients and evidence-backed offline workflows
- Service extraction only after measured operational pressure

Exit with measured load, recovery, security, accessibility, and production acceptance evidence.
