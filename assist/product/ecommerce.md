# Ecommerce Product Scope

## Purpose

Ecommerce is the CXShop multi-vendor commerce application. It serves B2C and B2B buyers.

The application supports one catalog with many vendor offers. It separates product identity from seller terms.

## Portals

### Storefront

The Storefront serves buyers and guests. It owns discovery, search, product pages, cart, checkout, orders, returns, and reviews.

### Vendor

The Vendor portal serves active vendor members. It owns onboarding, offers, inventory, seller orders, fulfillment, returns, and settlements.

### Admin

The Admin portal operates one marketplace tenant. It owns catalog review, vendor review, promotions, disputes, commissions, and operations.

### Super Admin

The Super Admin portal operates the CXShop platform. It owns plans, tenant activation, global policy, and platform health.

## Feature Groups

### Catalog

- Product Information extends one active Core Product.
- Core Product Categories provide the canonical category tree used by Ecommerce navigation.
- Core Brands provide canonical product brand identity.
- Collections group products for campaigns and merchandising.
- Attributes define reusable product facts.
- Attribute Values define allowed values.
- Product Attributes assign facts to a catalog product.
- Variants define purchasable combinations.
- Media stores ordered images, videos, and documents.
- Channels control storefront, marketplace, social, and wholesale publication.
- Publication controls draft, scheduled, published, and archived states.
- SEO owns slugs, titles, descriptions, canonical URLs, and structured data.

### Multi-vendor

- Vendors own legal and operational profiles.
- Vendor Membership grants server-side marketplace authority.
- Vendor Offers connect one vendor to one catalog product or variant.
- Offers own seller SKU, price, minimum order, lead time, condition, and status.
- Inventory owns available, reserved, damaged, and incoming quantities.
- Service Areas own delivery coverage and restrictions.
- Vendor Documents own verification evidence and expiry state.

### Pricing and promotion

- Price Lists support retail, wholesale, contract, and channel prices.
- Promotions support coupons, automatic discounts, bundles, and shipping discounts.
- Commission Rules calculate marketplace fees by vendor, category, channel, or plan.
- Tax display uses Core tax identity and Billing tax calculation contracts.

### Cart and checkout

- A cart can contain offers from many vendors.
- The server recalculates every price, tax, discount, fee, and shipping amount.
- Inventory reservations expire through durable jobs.
- Checkout is idempotent and creates one marketplace order.
- The order service splits the order into seller orders by vendor.
- Payment authorization never trusts a browser total.

### Orders and fulfillment

- Marketplace Orders own the buyer contract and total.
- Seller Orders own vendor fulfillment.
- Shipments own packages, labels, tracking, and delivery state.
- Cancellations apply policy before fulfillment.
- Returns own item inspection and disposition.
- Refunds use idempotent payment commands.
- Disputes preserve evidence, messages, decisions, and audit history.

### Finance

- Ecommerce requests invoices, receipts, credit notes, and payments through Billing public contracts.
- Billing owns financial documents, tax calculations, numbering, posting, and reports.
- Ecommerce owns commissions, vendor settlement lines, payout schedules, and marketplace reconciliation.
- Settlement ledgers are immutable. Corrections use adjustment entries.

### Trust and engagement

- Reviews require an eligible fulfilled order.
- Questions and answers support product discovery.
- Wishlists save buyer intent.
- Notifications use Mail public contracts.
- Fraud signals can hold checkout, payout, refund, or vendor activation.

### Operations

- Important state changes write transactional outbox events.
- Durable jobs use idempotency keys, retry limits, and visible failed states.
- Search projections consume catalog and offer events.
- Imports validate every row and produce a result report.
- Audit records store actor, request, and correlation identity.

### Catalog matching

- Matching is owned by Ecommerce Catalog Matching and never by a generic shared service.
- Exact SKU, barcode, slug, and normalized title plus brand rules run before any semantic matcher.
- A deterministic result stores its strategy, confidence, product information ID, and variant ID.
- A deterministic no-match may create a semantic request and outbox event in one MariaDB transaction.
- Semantic matching is optional, asynchronous, idempotent, and cannot overwrite a deterministic result.
- `GET /ecommerce/catalog/matches` lists recent decisions. `POST /ecommerce/catalog/matches` creates an idempotent request by source reference.

## Catalog Delivery

The first delivery contains the catalog desk only:

- Categories reuse the Core Product Category workspace and API.
- Brands reuse the Core Brand workspace and API.
- Products reuse the Core Product workspace and API.
- Product Details extend `core_products` with storefront, merchandising, shipping, dimension, order-limit, publication, and SEO fields.
- Product Variants own purchasable SKUs, option combinations, price adjustments, weight, order, and lifecycle state.
- Product Images own ordered product-level and variant-level image URLs, alternative text, captions, primary-image selection, and lifecycle state.

Collections, attributes, channels, vendor offers, inventory, carts, checkout, and all later feature groups remain separate Ecommerce owners. They are not part of this catalog delivery.

## Success Rules

- A browser cannot select vendor authority.
- A vendor can update only offers owned by an active membership.
- A buyer cannot submit trusted totals or inventory values.
- One payment command cannot create two charges.
- One refund command cannot create two refunds.
- One seller order belongs to one vendor.
- One settlement line records one immutable financial effect.
- All Ecommerce modules operate in the standalone `cxshop_db` runtime and preserve ownership with `ecommerce_` tables and public contracts.
