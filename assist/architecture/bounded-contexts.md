# Bounded Contexts

## Ownership map

| Context | Owns | Does not own |
| --- | --- | --- |
| Identity | Accounts, sessions, credentials, actor status | Vendor membership and commerce permissions |
| Vendor | Vendor profile, verification, membership, vendor status | Products, orders, and settlements |
| Catalog | Canonical products, variants, categories, attributes, media | Vendor price and stock |
| Offer | Vendor listing, price reference, publication state | Canonical product definition |
| Pricing | Price lists, quantity tiers, calculated price rules | Payment capture |
| Inventory | Locations, stock, reservations, movements | Product content |
| Cart | Selected offers, quantities, cart pricing snapshot | Final order records |
| Checkout | Validation and orchestration of order creation | Long-term order ownership |
| Order | Customer order, seller orders, transitions, allocation | Provider payment internals |
| Payment | Payment intents, captures, refunds, provider callbacks | Vendor settlement policy |
| Commission | Fee rules and commission calculation | Payment-provider execution |
| Settlement | Vendor ledger, holds, payouts, reconciliation | Customer checkout |
| Fulfilment | Packages, shipments, tracking, delivery state | Inventory valuation |
| Return | Return requests, inspections, outcomes | Provider refund execution |
| Promotion | Campaigns, coupons, eligibility, allocation | Base price ownership |
| Review | Ratings, moderation, verified-purchase links | Vendor risk decisions |
| Notification | Templates, preferences, delivery requests | Mail provider internals |
| Integration | Connections, mappings, deliveries, reconciliation | External system business data |

## Dependency rules

- Identity authenticates an actor.
- Vendor resolves the actor's persisted vendor membership.
- Catalog supplies canonical product data.
- Offer connects a vendor to a catalog variant.
- Inventory tracks stock for an offer and location.
- Cart references active offers.
- Checkout asks owners to validate their data.
- Order stores the accepted commercial snapshot.
- Payment and fulfilment progress through explicit order commands.
- Commission and settlement consume confirmed financial events.

## Public contract rules

- Each context exports a small public API.
- The public API uses exact schemas and versioned events.
- A context does not expose repository objects.
- A consumer does not import private types.
- A context can publish a projection for approved combined reads.
- A report must not become a hidden cross-context write path.
