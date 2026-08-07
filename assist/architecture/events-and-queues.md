# Events and Queues

## Transactional outbox

Write an important domain event to the outbox in the same transaction as the business change.

An event envelope contains:

- Event ID
- Event name
- Schema version
- Aggregate type and ID
- Actor type and ID
- Correlation and causation IDs
- Occurred time
- Required scope
- Validated payload

## Durable jobs

Use durable jobs for:

- Payment provider calls
- Payment and shipping webhooks
- Search indexing
- Email and messaging
- Settlement generation and payout
- CXApp and Frappe synchronization
- Imports and exports
- Media processing
- Scheduled reservation expiry
- Reconciliation
- OpenAI Business Assist generation

## Job contract

A job contains:

- Job name and version
- Idempotency key
- Correlation ID
- Actor and scope
- Attempt limit
- Backoff policy
- Safe payload
- Creation and availability times

Workers must record attempts, results, failures, and completion.

## Delivery rules

- Assume at-least-once delivery.
- Make every consumer idempotent.
- Store processed event IDs when repeated effects are unsafe.
- Move exhausted jobs to a visible failed state.
- Support an audited retry.
- Do not put secrets or large documents in a job payload.
- Store a reference to protected content instead.
