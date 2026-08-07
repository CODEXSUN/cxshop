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
- Catalog-owned MariaDB schema, repeatable development data, public and Admin APIs, audit records, and transactional outbox events
- Database-backed storefront home, category, and product pages with metadata, structured product data, and dynamic sitemap entries
- Computer-store test catalog with laptops, desktops, monitors, components, storage, networking, accessories, spares, remote product images, and search
- Admin Catalog workspace with category and product creation, publishing status, and live record lists
- Responsive product enquiry UI for mobile, medium, and large screens with customer-approved WhatsApp hand-off
- Admin Walk-in Orders workspace for confirmation, order booking, bill recording, collection readiness, and collection completion
- Walk-in Sales-owned migration, state machine, persistence, audit history, transactional outbox events, public API, and protected Admin API

## Verification state

Catalog and walk-in sales migrations are verified against the development MariaDB, including repeated bootstrap. Online cart, checkout, payment, inventory reservation, shipping, returns, settlements, CXApp/Frappe connectors, and production deployment are not implemented.

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
