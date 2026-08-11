# Single-Database Application Scope

## Goal

CXShop is one standalone application backed by one dedicated MariaDB database.

Platform, DevKit, Core, Billing, Mail, Ecommerce, and application access control share `cxshop_db`. Their module-owned table prefixes, migration scopes, repositories, services, and APIs remain separate.

## Fixed Database Context

The root environment selects the database. Browser headers, domains, sessions, and request payloads cannot select or override it.

Legacy tenant registry records can remain temporarily for authentication and data compatibility. Tenant provisioning, tenant database management, tenant domain management, and per-tenant database deletion are not composed into the active backend or Super Admin desk.

## Table Ownership

- Platform tables retain their Platform-owned names.
- Application runtime compatibility tables retain `app_` until a forward rename migration is introduced.
- Core tables use `core_`.
- Billing tables use `billing_`.
- Mail tables use `mail_`.
- Ecommerce tables use `ecommerce_`.

Do not add tenant IDs to business tables. Do not create a second database for an app or module. Cross-module access must still use public contracts and deterministic composition.

## Security

- Database credentials remain server-only.
- A request cannot provide database authority.
- Authentication and permissions remain enforced by their owner modules.
- Company and financial-year context remains explicit for business operations.
