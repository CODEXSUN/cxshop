# CXShop Agent Guide

## Purpose

This guide is the main work entry point for humans and agents.

CXShop is a new product. Do not copy CXApp business modules into this repository.
Use CXApp only as an architecture and integration reference through approved public contracts.

## Required reading

Read these files for every change:

1. `AGENTS.md`
2. `assist/governance/rules.md`
3. `assist/governance/dependencies.md`
4. `assist/product/ecosystem.md`
5. `assist/documentation/project-inventory.md`
6. `assist/architecture/runtime-and-portals.md`
7. `assist/architecture/frontend-and-api-stack.md`
8. The closest source, tests, and composition points

Read these files when relevant:

- Domain or module work: `assist/architecture/bounded-contexts.md`
- Catalog, cart, order, payment, or vendor work: `assist/architecture/marketplace-model.md`
- CXApp or Frappe work: `assist/architecture/integration-contracts.md`
- Events, webhooks, workers, or scheduled work: `assist/architecture/events-and-queues.md`
- Identity, permissions, vendor access, or data scope: `assist/architecture/security-and-tenancy.md`
- Planning or milestone work: `assist/product/delivery-roadmap.md`
- Deployment work: `assist/operations/deployment.md`
- Shared MariaDB, Redis, network, or media work: `assist/operations/shared-infrastructure.md`
- Version, release, or GitHub work: `assist/operations/versioning.md`
- Implementation work: `assist/skills/cxshop-module-owner/SKILL.md`

## Repository identity

- The repository name is CXShop.
- The package scope will be `@cxshop/*`.
- Environment names use short, grouped terms such as `API_*`, `DB_*`, `LOGIN_*`, and `DEV_LOGIN_*`.
- Public CODEXSUN branding may remain in product names, domains, and organization references.
- Use npm workspaces from the repository root unless an approved decision changes this rule.

## Architecture direction

- Start with a modular monolith.
- Keep the commerce runtime independent from CXApp and Frappe.
- Use MariaDB as the source of truth for transactional data.
- Use Redis only for cache, locks, rate limits, and queue delivery.
- Use object storage for product media and documents.
- Use an indexed search adapter after database search no longer meets measured needs.
- Split a module into a service only after measured operational pressure.

## Portal direction

CXShop has three separate portal compositions:

- The customer portal owns discovery, cart, checkout, orders, returns, and account workflows.
- The vendor portal owns vendor catalog, offers, inventory, seller orders, fulfilment, and settlements.
- The platform portal owns governance, moderation, commissions, disputes, risk, and operations.

The portals can share design-system controls. They must not share authorization decisions or business page state.

## Working procedure

Before a change:

1. Inspect `git status`.
2. Read the owning module and its public exports.
3. Identify the affected database, actor, portal, event, and integration scope.
4. Identify fresh and existing database behavior.
5. State assumptions that affect business meaning.

During a change:

1. Edit the owning module.
2. Keep API, schema, persistence, events, jobs, and UI aligned.
3. Add audit data for business-critical changes.
4. Add idempotency for retries and external callbacks.
5. Remove replaced code and stale exports.

Before completion:

1. Run focused formatting, lint, type checks, and tests.
2. Run boundary and dependency checks when available.
3. Run migration and repeat-seed checks for persistence changes.
4. Run live database, API, and browser checks when the claim needs them.
5. Report skipped checks and blockers.

## Completion language

Use precise status terms:

- `documented` means an active document defines the behavior.
- `implemented` means source code exists.
- `statically verified` means static checks passed.
- `database verified` means a live database check passed.
- `browser verified` means a browser flow passed.
- `production verified` means the deployed system passed the defined production checks.
