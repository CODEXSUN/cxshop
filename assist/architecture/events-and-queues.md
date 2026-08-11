# Events And Queues

## Runtime Decision

CXShop is one standalone modular monolith. MariaDB on port 3306 is the authoritative database. The configured product database is `cxshop_db`.

MariaDB owns:

- Business records.
- Module outboxes.
- Durable queue jobs.
- Attempts, schedules, results, errors, and recovery state.
- Consumer idempotency evidence.

Redis is optional. BullMQ may wake workers or accelerate delivery, and Redis may cache derived data. Neither may become the only copy of an accepted command, event, job, or business result.

## Module-Owned Event Flow

1. A module validates a command with its domain service.
2. Its repository opens one MariaDB transaction.
3. The repository writes business state and the module's outbox event.
4. The module-owned relay reads ready outbox rows.
5. The relay submits an idempotent job through the Queue Manager port.
6. The module-owned worker handles the job and writes the result.
7. The relay or worker records success, retry, or terminal failure in MariaDB.

The Queue Manager owns durable scheduling infrastructure. It does not own business event definitions or handler logic. Application composition registers each module's public worker handler.

## Required Event Data

Events and jobs use stable lowercase dotted names and include:

- Aggregate identity.
- Correlation identity.
- Idempotency key.
- Source module.
- Schema version when payload evolution is possible.
- Retry limit and next available time for queued work.

Payloads contain identifiers and necessary facts, not secrets or large binary data. Consumers must be replay safe.

## Matching Policy

Catalog matching executes in this order:

1. Exact normalized SKU.
2. Exact normalized barcode.
3. Exact normalized slug.
4. Exact normalized title and brand.
5. Semantic fallback after deterministic no-match.

The request stores the strategy, confidence, candidate identity, and correlation identity. Semantic fallback is written to the Ecommerce Catalog Matching outbox in the same transaction as the pending request. A semantic result cannot silently replace a deterministic result.

## Failure Rules

- Mark an outbox row published only after the durable queue accepts its idempotency key.
- Retry delivery with bounded exponential backoff.
- Keep failed records visible for operations and replay.
- Do not delete a durable MariaDB job because Redis lost state.
- Do not acknowledge external work before its result or next retry state is durable.
- Keep provider-specific adapters behind the owning module's port.

## Current Owners

- `platform.queue-manager` owns `queue_jobs`, `queue_runtime_settings`, leasing, retry, cancellation, retention, and optional BullMQ delivery.
- `ecommerce.catalog.matching` owns match requests, deterministic rules, `ecommerce_catalog_match_outbox`, relay, semantic worker contract, and its API.
- Billing keeps its financial outbox inside Billing ownership.
- Mail keeps message delivery behavior inside Mail ownership and uses the Queue Manager through its public enqueue port.
