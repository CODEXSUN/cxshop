# Ecommerce API Contract

## Route Groups

Internal tenant desk routes use `/ecommerce/*`. Public Storefront routes use `/store/*`.

Vendor routes use `/vendor/*`. Admin routes use `/admin/ecommerce/*`.

Every route uses `registerContractRoute()` and strict Zod schemas.

## Product Information Routes

| Method | Path                                                   | Purpose                          |
| ------ | ------------------------------------------------------ | -------------------------------- |
| GET    | `/ecommerce/catalog/product-information`               | List product information         |
| GET    | `/ecommerce/catalog/product-information/core-products` | List active Core Product options |
| GET    | `/ecommerce/catalog/product-information/core-brands`   | List active Core Brand options   |
| GET    | `/ecommerce/catalog/product-information/:id`           | Get one record                   |
| POST   | `/ecommerce/catalog/product-information`               | Create one record                |
| PUT    | `/ecommerce/catalog/product-information/:id`           | Update one record                |
| POST   | `/ecommerce/catalog/product-information/:id/archive`   | Archive one record               |

The create and update commands accept a Core Product ID. The service verifies the Core Product in the tenant database.

The service normalizes slugs. A Core Product and a slug can each have only one Product Information record.

## Variant Routes

`/ecommerce/catalog/variants` provides list, get, create, and update routes. The `/activate` and `/deactivate` commands control lifecycle state. `/products` returns valid Product Details parents.

Each SKU is unique in the tenant catalog. A variant supports three named option values, price, compare-at and cost adjustments, weight, and storefront order.

## Product Image Routes

`/ecommerce/catalog/images` provides list, get, create, and update routes. The `/activate` and `/deactivate` commands control lifecycle state. `/products` and `/variants` return valid parents.

An image belongs to Product Details and can optionally target one of that product's variants. Making an image primary clears the prior primary image for the same product and variant scope.

## External Contracts

Public catalog reads return only published data. They do not return internal IDs, audit fields, vendor costs, or moderation notes.

Checkout commands use idempotency keys. Payment and refund commands require a unique operation key.

Webhook deliveries use signatures, timestamps, retry limits, and delivery logs.

## Billing Commands

Ecommerce can request these Billing actions through public contracts:

- Create a quotation for an approved B2B cart.
- Create a sales invoice for a confirmed marketplace order.
- Record a payment reference after payment confirmation.
- Create a credit note for an approved return.
- Record a refund reference after refund confirmation.

Ecommerce sends source type, source ID, idempotency key, company, financial year, currency, customer, tax lines, and totals.

Billing recalculates and validates its owned financial fields. Billing returns the financial document UUID and status.

## Error Rules

- Return `400` for invalid input.
- Return `401` for an invalid session.
- Return `403` for a scope or permission failure.
- Return `404` for a missing owned record.
- Return `409` for a duplicate or invalid state transition.
- Return `422` for a valid request that breaks a business rule.

Do not expose database names, SQL text, credentials, internal stack traces, or private vendor data.
