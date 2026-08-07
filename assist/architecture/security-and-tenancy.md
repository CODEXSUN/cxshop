# Security and Tenancy

## Scope model

CXShop separates these scopes:

- Platform scope
- Vendor scope
- Customer scope
- Service integration scope

A deployment can also use tenant scope when CXShop hosts independent marketplace operators.

Do not treat a vendor as a tenant by default. Many vendors participate in one marketplace transaction boundary.

## Actor model

Supported actor types include:

- Customer
- Vendor owner
- Vendor staff
- Vendor finance user
- Vendor fulfilment user
- Support user
- Platform administrator
- Super administrator
- Integration service

Permissions use the form `scope.module.resource.action`.

## Vendor authorization

Resolve vendor access through an active persisted membership.
The session identifies the actor. The server resolves the permitted vendor.

Reject a request when:

- The membership does not exist.
- The membership is disabled.
- The vendor is suspended.
- The permission is missing.
- The requested record belongs to another vendor.

## Customer authorization

Resolve customer data from the authenticated customer identity.
Do not accept a customer ID from the browser as authority.

Allow guest checkout only through a documented verified contact and order-access policy.

## Service authorization

Use scoped credentials for external services.
Rotate credentials and record their use.
Do not give an integration broad platform permissions when a narrow scope works.

## Sensitive data

- Tokenize payment card data through the payment provider.
- Encrypt tax identity documents and integration secrets.
- Restrict identity verification documents by role and purpose.
- Apply retention rules to personal data and operational logs.
- Mask private values in support screens, events, and logs.
