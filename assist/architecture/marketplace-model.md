# Marketplace Model

## Product and offer

A catalog product describes what the item is.
A vendor offer describes how one vendor sells a variant.

An offer owns:

- Vendor identity
- Catalog variant identity
- Seller SKU
- Publication and moderation state
- Price-list eligibility
- Fulfilment profile
- Warranty and return policy reference

Inventory belongs to the offer and stock location.

## Order model

One checkout creates one customer order.
The customer order contains one seller order for each participating vendor.

The order stores immutable commercial snapshots:

- Product and variant labels
- Seller identity
- Unit price
- Discount allocation
- Tax allocation
- Shipping allocation
- Commission basis
- Customer addresses

Later catalog or vendor changes must not rewrite an accepted order.

## Inventory model

Track these quantities separately:

- On hand
- Reserved
- Available
- Damaged
- Blocked
- In transit

Create reservations with atomic conditional updates.
Give each reservation an expiry time.
Confirm or release reservations through idempotent commands.

## Financial model

Use an append-only ledger for financial effects.

Record separate entries for:

- Customer charge
- Provider fee
- Tax
- Marketplace commission
- Vendor payable
- Refund
- Chargeback
- Adjustment
- Settlement

A payout is a settlement of ledger entries. It is not a calculated order field.

## State model

Use explicit state machines for:

- Vendor approval
- Offer moderation
- Customer order
- Seller order
- Payment
- Fulfilment
- Return
- Refund
- Settlement

Store each accepted transition with actor, reason, time, and correlation ID.

## Consistency model

Use one database transaction for local invariants.
Use an outbox event for work outside that transaction.
Use compensating commands for workflows that cross providers.
Do not use distributed database transactions.
