# Ecommerce Application Boundaries

## Application Owner

`apps/ecommerce/api` owns Ecommerce persistence, services, routes, events, jobs, and public API contracts.

`apps/ecommerce/web` owns the Ecommerce desk, catalog workspaces, vendor operations, and marketplace administration UI.

Platform composes the public Ecommerce packages. Platform does not own Ecommerce business fields or workflows.

## Core Relationship

Core owns `core_products`, `core_product_categories`, and `core_brands`. These are the stable product, category, and brand identities.

Ecommerce Product Information owns storefront content. It references one Core Product with `core_product_id`.

Ecommerce must not copy Core product type, tax, HSN, unit, opening quantity, or opening rate fields.

The catalog tables are `ecommerce_product_information`, `ecommerce_product_variants`, and `ecommerce_product_images`. Foreign keys preserve Core Product, Core Brand, Product Details, and Variant relationships.

## Billing Relationship

Billing owns quotations, sales invoices, receipts, payments, credit notes, tax posting, and financial reports.

Ecommerce sends versioned commands through Billing public contracts. Ecommerce never writes Billing tables.

Billing returns document identity and posting state. Ecommerce stores only the reference needed for marketplace workflows.

## Catalog Owners

| Module              | Owned records                      | Required parent                                      |
| ------------------- | ---------------------------------- | ---------------------------------------------------- |
| Core Category       | Canonical category tree            | Core                                                 |
| Core Brand          | Canonical brand identity           | Core                                                 |
| Product Information | Storefront content and publication | Core Product and optional Core Brand                 |
| Collection          | Merchandising group                | None                                                 |
| Attribute           | Reusable product fact              | None                                                 |
| Attribute Value     | Allowed fact value                 | Attribute                                            |
| Product Attribute   | Assigned product fact              | Product Information                                  |
| Variant             | Purchasable combination            | Product Information                                  |
| Product Image       | Ordered image and alternative text | Product Information and optional Variant             |
| Sales Channel       | Publication target                 | None                                                 |
| Channel Listing     | Channel publication state          | Product Information and Sales Channel                |
| Vendor Offer        | Seller terms                       | Vendor Membership and Product Information or Variant |
| Inventory           | Seller availability                | Vendor Offer and Warehouse                           |

Each record has one backend leaf and one matching frontend leaf. Shared metadata CRUD engines are prohibited.

## Commerce Owners

Cart, checkout, marketplace order, seller order, shipment, return, refund, dispute, review, promotion, commission, and settlement are separate owners.

Each owner controls its schema, migration, repository, service, routes, events, workers, seeds, sync rules, and UI.

## Trusted Scope

Platform authentication resolves the tenant database. Ecommerce uses that resolved database.

Vendor Membership resolves vendor authority. A browser vendor ID is only input data and never authority.

The server resolves the active buyer, company, channel, currency, and vendor membership before a command runs.

## Event Rules

Use `ecommerce.<owner>.<event>` names. Use past-tense event names for completed facts.

Important events include:

- `ecommerce.product-information.published`
- `ecommerce.vendor-offer.activated`
- `ecommerce.inventory.reserved`
- `ecommerce.checkout.completed`
- `ecommerce.seller-order.created`
- `ecommerce.refund.completed`
- `ecommerce.settlement-posted`

The command transaction writes the state change and outbox event together.

## Migration Order

1. Run Core migrations.
2. Run Ecommerce catalog migrations.
3. Run vendor and offer migrations.
4. Run cart and order migrations.
5. Run fulfillment and after-sales migrations.
6. Run commission and settlement migrations.

Rollback runs in reverse order. A rollback must not remove data without an explicit recovery plan.
