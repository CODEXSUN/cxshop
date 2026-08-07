# CXShop Ecosystem

## Product purpose

CXShop is a multi-vendor commerce ecosystem for customers, vendors, and marketplace operators.

The first target supports Indian B2C and B2B commerce. The design must also support specialized industry packs.

## Product principles

- Marketplace workflows are product-owned.
- Vendor isolation is mandatory.
- Financial records are auditable.
- Commerce actions tolerate retries.
- External systems connect through stable contracts.
- A modular monolith is the first deployment model.
- Mobile, desktop, and service clients use the same public commerce contracts.

## Portal ecosystem

### Customer portal

The customer portal includes:

- Registration and account security
- Addresses and business tax identity
- Product discovery and search
- Product, variant, and seller offer comparison
- Cart and saved items
- Checkout and payment
- Customer orders and seller shipment visibility
- Cancellation, return, refund, and dispute requests
- Reviews, notifications, and support

### Vendor portal

The vendor portal includes:

- Vendor application, verification, and approval
- Vendor staff and permissions
- Product contribution and offer management
- Price lists and B2B quantity rules
- Inventory and stock locations
- Seller orders and fulfilment
- Returns and dispute responses
- Commission, ledger, settlement, and tax documents
- Performance and operational reports

### Platform portal

The platform portal includes:

- Vendor review and moderation
- Catalog governance
- Commission and fee policies
- Order and payment operations
- Settlement approval and reconciliation
- Returns, disputes, and risk review
- Promotion governance
- Integration and webhook operations
- Audit, queue, support, and compliance tools

## Core capabilities

CXShop will own these capabilities:

- Identity and marketplace access
- Vendor
- Catalog
- Vendor offer
- Pricing
- Inventory
- Customer
- Cart
- Checkout
- Order
- Payment
- Commission
- Settlement
- Fulfilment
- Return and refund
- Promotion
- Review
- Notification
- Search projection
- Audit and support
- Integration registry

## Advanced capabilities

Later releases can add:

- B2B requests for quotation
- Contract pricing and credit limits
- Vendor subscription plans
- Dropship and marketplace-owned fulfilment
- Multi-warehouse allocation
- Delivery serviceability and promise dates
- Fraud and risk scoring
- Recommendation and ranking services
- Cross-border tax and currency support
- Mobile applications
- Offline vendor operations where a proven need exists

## External ecosystem

CXApp can provide ERP, billing, accounting, CRM, and business operations through public integration contracts.

Frappe can provide connected operational workflows when a deployment already uses a Frappe application.

Payment, shipping, tax, messaging, search, and identity providers connect through adapters.

CXShop remains the source of truth for carts, marketplace orders, seller orders, commissions, and settlements.
