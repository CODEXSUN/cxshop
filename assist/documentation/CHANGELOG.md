# CXShop Changelog

## Unreleased

- Converted the storefront hero into a 520px product slider with independently configurable copy, action, image, and badge animations.
- Replaced the static storefront category row with an accessible animated department mega-menu for desktop, tablet, and mobile.
- Added the mobile-first WhatsApp product enquiry and manual store-collection order workflow.
- Added Admin confirmation, order booking, billing, ready-for-collection messaging, and collection completion.
- Added Walk-in Sales persistence, explicit state transitions, audit history, outbox events, protected APIs, and responsive order management.
- Reserved online cart, payment, shipping, and inventory fulfilment for future module-owned workflows.
- Rebuilt the public storefront as a computer hardware store based on the Store 2 commerce layout rhythm.
- Replaced the lifestyle sample catalog with 8 computer categories and 14 seeded hardware products.
- Added remote product photography, product search, category merchandising, promotional sections, and dense product grids.
- Removed the public storefront Display control.
- Rebuilt Customer, Vendor, Admin, and Super Admin workspaces with a CXApp-aligned neutral back-office shell.
- Added portal-owned navigation, compact brand headers, responsive menus, user footers, and density controls.
- Added API startup port preflight, database installation, ordered migration, and development seed lifecycle.
- Made the root development launcher wait for API and database readiness before starting the worker and Turbopack.
- Added explicit Fastify CORS preflight support for all API methods.
- Added derived `localhost` and `127.0.0.1` development origins without duplicate environment values.
- Added a safe `DATABASE_UNAVAILABLE` response and a clear development login message.
- Made the Next.js development command start Turbopack explicitly.
- Added Catalog-owned MariaDB migrations and repeatable development data.
- Added public category and product APIs plus protected Admin catalog commands.
- Added database-backed storefront, category, product, metadata, and sitemap pages.
- Added the Admin Catalog workspace for category and product publishing.
- Removed duplicate web origin variables. `PUBLIC_URL` now controls CORS and public links.

## Version State

Current version: 1.1.1

Release tag: v-1.1.1

Changelog label: v 1.1.1

## v-1.1.1

### [v 1.1.1] 2026-08-07 10:17 am - Simplify database configuration

#### Database Changes

- Database update: No (manual).

#### App Codebase Changes

- Bumped the workspace version to 1.1.1.
- Removed `DB_CONNECTION_LIMIT` and `DB_SSL` from the environment contract.
- Set the MariaDB pool size to 10 in the owned database adapter.
- Disabled database URL SSL options in source until an approved deployment policy enables them.

## v-1.0.1

### [v 1.0.1] 2026-08-07 8:11 am - Marketplace foundation

#### Database Changes

- Database update: No.

#### App Codebase Changes

- Added guarded reuse of the CXApp MariaDB, Redis, Docker network, FileBrowser, and media volume.
- Added the independent environment contract, CI-safe validator, root configuration, and workspace ownership baseline.
- Added the CXShop ecosystem, governance, architecture, and agent instructions.
- Added the guarded deployment and release workflow foundation.
- Added CXApp and Frappe integration boundaries.
