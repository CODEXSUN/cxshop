# CXShop Applications

Applications are deployment and portal composition surfaces.

Planned application workspaces:

- `platform/api` composes the marketplace API.
- `platform/web` provides the marketplace operator portal.
- `customer/web` provides the customer storefront and account portal.
- `vendor/web` provides the vendor operations portal.

Applications do not own generic cross-domain business engines.
Each business context keeps its behavior in its owning module.
