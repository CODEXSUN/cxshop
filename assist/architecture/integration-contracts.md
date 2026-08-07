# Integration Contracts

## Integration position

CXShop runs without CXApp or Frappe.
An integration adds connected operations. It does not become a hidden runtime dependency for checkout.

## CXApp compatibility

CXShop and CXApp can share these stable technical conventions:

- TypeScript and Zod contracts
- MariaDB operational knowledge
- Transactional outbox and durable queue patterns
- Object-storage adapters
- Audit and correlation identifiers
- Design tokens and approved UI primitives

CXShop must not import CXApp private modules or query a CXApp database.

Possible CXApp integrations include:

- Export confirmed seller orders for ERP processing
- Export marketplace invoices or settlement documents
- Synchronize approved products through an explicit ownership policy
- Synchronize customers and vendors through mapping records
- Receive fulfilment, invoice, or accounting status events

CXShop remains authoritative for marketplace order allocation, commission, and settlement.

## Frappe compatibility

Connect to Frappe through its authenticated HTTP APIs and signed webhooks.

Possible Frappe integrations include:

- Create or update Item records from approved catalog data
- Create Customer and Supplier records from approved identities
- Create Sales Orders or Purchase Orders from confirmed seller orders
- Receive stock, fulfilment, invoice, and payment status
- Attach generated documents through an approved file contract

Do not use direct Frappe database access.
Do not call Frappe document methods from CXShop code.

## Mapping records

Store mappings with:

- Connection ID
- Local entity type and UUID
- External entity type and ID
- Contract version
- Last synchronized version
- Last successful time
- Reconciliation status

Do not use names or email addresses as durable integration keys.

## Source-of-truth policy

Define field ownership before each integration starts.

Example policy:

| Data | Default owner |
| --- | --- |
| Marketplace catalog content | CXShop |
| Vendor offer and price | CXShop |
| Marketplace inventory reservation | CXShop |
| Marketplace order and seller split | CXShop |
| Commission and settlement | CXShop |
| ERP accounting entry | CXApp or Frappe |
| ERP tax invoice number | The connected ERP |
| Shipment tracking | The selected fulfilment owner |

## Delivery contract

- Use versioned APIs and events.
- Sign outbound webhooks.
- Verify inbound webhook signatures.
- Use idempotency keys for create and command requests.
- Store attempts and masked responses.
- Retry transient failures with backoff.
- Reconcile missed updates on a schedule.
- Send incompatible payloads to a visible failed state.

## OpenAI Business Assist

- CXShop runs normally when OpenAI is disabled or unavailable.
- `Business Assist` owns the application contract, request persistence, authorization, prompt policy, durable job, response persistence, API, and Admin/Super Admin UI.
- The OpenAI SDK exists only in the provider adapter. No domain or public contract exposes SDK types.
- Use the Responses API. The model, API URL, reasoning effort, output limit, enablement, and secret come from validated environment settings.
- Send only context explicitly submitted for the advice request. Do not automatically send database rows, credentials, source code, payment data, private documents, or cross-vendor information.
- Model output is advisory and untrusted. It cannot directly write business state, execute tools, approve vendors, change prices, issue refunds, or trigger settlements.
- Requests use durable MariaDB jobs with idempotency, bounded attempts, exponential backoff, visible failure state, and actor-scoped result reads.
- Any future model tool must be a narrow owner-exported read contract with authorization, input validation, output minimization, audit, and explicit approval before state-changing commands.
