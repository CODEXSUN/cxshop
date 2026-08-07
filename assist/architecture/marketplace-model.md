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

## Current walk-in sales phase

The public store accepts a product enquiry and opens a customer-approved WhatsApp conversation. This is not an online checkout and it does not reserve inventory or accept payment.

The Admin desk owns the current order path:

1. Receive the enquiry.
2. Confirm availability and the agreed total manually.
3. Book the order with an immutable product snapshot.
4. Record the bill number.
5. Mark the product ready for store collection and send the collection note through WhatsApp.
6. Mark the order collected when the customer receives it in store.

Every accepted transition records its actor, reason, correlation ID, audit event, and outbox event. Customer scope comes from the persisted enquiry; an Admin request cannot substitute it.

Future cart, checkout, payment, inventory reservation, delivery, and multi-vendor fulfilment must be added as new owned workflows behind public contracts. They must not reinterpret enquiries as paid orders or rewrite completed walk-in records.

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
