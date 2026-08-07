---
name: cxshop-module-owner
description: Enforce CXShop marketplace ownership, vendor isolation, financial integrity, durable workflows, portal boundaries, and integration contracts.
---

# CXShop Module Owner

## Use this skill

Use this skill for module, schema, API, portal, queue, payment, order, inventory, vendor, settlement, or integration work.

## Load repository rules

1. Read `AGENTS.md`.
2. Read `assist/AGENT-GUIDE.md`.
3. Read `assist/governance/rules.md`.
4. Read `assist/product/ecosystem.md`.
5. Read the relevant architecture documents.
6. Inspect the owning source, exports, migrations, tests, and composition points.

## Establish ownership

- Name the bounded context that owns the behavior.
- Keep schema, persistence, service, API, events, jobs, tests, and UI inside that owner.
- Keep composition roots free of business rules.
- Use public contracts for cross-context access.
- Reject direct access to CXApp or Frappe databases.

## Protect marketplace invariants

- Separate products from vendor offers.
- Resolve vendor access from persisted membership.
- Reserve inventory atomically.
- Store customer orders and seller orders separately.
- Store accepted commercial snapshots on orders.
- Use an append-only financial ledger.
- Make external and retryable commands idempotent.
- Write important events to the transactional outbox.

## Implement safely

1. Define exact input, output, error, permission, and event contracts.
2. Add an upgrade-safe migration.
3. Add repeatable owner-controlled seed data only when required.
4. Implement repository behavior with trusted scope.
5. Implement domain transitions and invariants in the service.
6. Keep the API thin and schema validated.
7. Add outbox events and durable jobs for external effects.
8. Add the correct customer, vendor, or platform UI.
9. Add focused unit, integration, concurrency, and authorization tests.

## Integration workflow

For CXApp or Frappe integration:

1. Define the source of truth for each field.
2. Define a versioned contract.
3. Store explicit local-to-external mappings.
4. Sign and verify webhooks.
5. Use idempotency keys.
6. Record attempts with masked payload details.
7. Add retry and reconciliation behavior.
8. Prove an external outage cannot corrupt local state.

## Validate

Run the applicable checks:

1. Formatting
2. Lint
3. Type checks
4. Focused tests
5. Module-boundary checks
6. Fresh and upgrade migrations
7. Repeat seeds
8. Live MariaDB persistence
9. Vendor and customer isolation
10. Duplicate command and webhook handling
11. Inventory concurrency
12. API and browser workflows

Report each check separately. Do not replace live evidence with a static check.

## Finish

Report:

- The owning context
- Public contract changes
- Database upgrade behavior
- Access and isolation behavior
- Idempotency and queue behavior
- Integration ownership
- Passed checks
- Skipped checks and blockers

Do not create task-specific handoff files.
