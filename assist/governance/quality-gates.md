# Quality Gates

## Every change

- Formatting passes for changed files.
- Lint passes for affected workspaces.
- Type checks pass for affected workspaces.
- Focused tests pass.
- Dependency and module boundaries pass.
- The Git diff contains no accidental generated files or secrets.

## Persistence changes

- A fresh migration passes.
- An upgrade migration passes from the supported previous schema.
- A repeated seed makes no duplicate records.
- Repository behavior matches the public contract.
- Data survives a process restart.

## Marketplace workflow changes

- State transitions accept valid paths and reject invalid paths.
- Duplicate commands do not duplicate effects.
- Concurrent stock requests cannot oversell.
- Totals are calculated on the server.
- Audit history records the actor and reason.
- Failure and retry paths have tests.

## Access changes

- Customer, vendor, vendor staff, support, platform admin, and super admin scopes stay distinct.
- A vendor cannot read or change another vendor's records.
- A customer cannot read another customer's records.
- Disabled memberships lose access immediately.
- UI restrictions have matching API enforcement.

## Integration changes

- Contract validation covers requests and responses.
- Webhook signature tests pass.
- Duplicate webhook tests pass.
- Timeout and retry tests pass.
- Mapping and reconciliation tests pass.
- One unavailable external system does not corrupt a committed local transaction.

## Release claims

Static checks do not prove database behavior.
Database checks do not prove browser behavior.
Local checks do not prove deployed production behavior.
