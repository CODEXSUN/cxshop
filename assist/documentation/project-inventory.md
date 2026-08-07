# Project Inventory

Last reviewed: 2026-08-07.

## Repository

- Local checkout: `E:\Workspace\codexsun\cxshop`
- Product: standalone multi-vendor commerce ecosystem
- Runtime direction: modular monolith with MariaDB and durable database queues

## Implemented source

- One Next.js runtime with four module-owned portal compositions: storefront, vendor, admin, and super admin
- CXShop-owned contracts, framework, and UI packages
- CXApp-aligned, portal-specific Customer, Vendor, Admin, and Super Admin login UI with independent authentication scope
- Fastify runtime composition using NestJS-style modules, providers, thin routes, and services
- Identity repository and service with exact portal access and signed HttpOnly sessions
- Kysely-owned MariaDB repositories, ordered migration runner, and repeatable portal identity/vendor seeder
- Environment-gated development auto-login and portal switch links for all four persisted portal identities
- Shared loading, error, not-found, logout, robots, and sitemap startup routes
- Optional OpenAI Responses adapter and module-owned Business Assist request, durable worker, result API, and Admin/Super Admin UI
- Project-management query route for Admin and Super Admin
- Initial MariaDB schema for migration ledger, identities, portal access, vendor membership, audit, outbox, jobs, projects, and project items
- Repeatable development identity and foundation-project seeder
- Root development launcher and module-boundary check
- Root-owned build artifacts: `.next/` for the unified web runtime and `dist/platform/api/` for the API
- Root artifact cleanup and boundary check; workspace-local build output is rejected
- Human-readable environment contract grouped by `API_*`, `WEB_*`, `DB_*`, `LOGIN_*`, `DEV_LOGIN_*`, `REDIS_*`, and `OPENAI_*`

## Verification state

The source above is implemented but is not yet live-database or browser verified. Do not describe catalog, cart, checkout, orders, payments, fulfilment, returns, settlements, CXApp/Frappe connectors, or production deployment as implemented.

## Workspace

```text
apps/
  platform/api
  platform/web
packages/
  contracts
  framework
  ui
```

Ports are API `7510` and web `7520`. Web routes are `/`, `/vendor`, `/admin`, and `/sa`.
