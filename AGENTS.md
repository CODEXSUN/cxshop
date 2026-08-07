# CXShop Agent Instructions

These instructions apply to the complete repository.

## Required reading

Before any change, read:

1. `assist/AGENT-GUIDE.md`
2. `assist/governance/rules.md`
3. `assist/governance/dependencies.md`
4. `assist/product/ecosystem.md`
5. `assist/architecture/runtime-and-portals.md`
6. The closest architecture and product documents
7. `assist/skills/cxshop-module-owner/SKILL.md` for code, schema, API, queue, portal, or integration work

## Working rules

- Inspect the current tree and `git status` before edits.
- Preserve unrelated work.
- Use the current source as evidence. Do not treat plans as implemented behavior.
- Keep each business entity and workflow in one owning bounded context.
- Keep composition roots free of business rules.
- Use public contracts for cross-module and external integration.
- Never accept a caller-selected vendor, tenant, company, or database scope as authority.
- Keep customer, vendor, and platform portal authorization separate.
- Use durable jobs for retryable or external work.
- Use a transactional outbox for important business events.
- Make commands safe to run again.
- Report only checks that ran successfully.

## Documentation authority

When documents conflict, use this order:

1. The user request
2. `AGENTS.md`
3. `assist/AGENT-GUIDE.md`
4. `assist/governance/rules.md`
5. Current architecture documents
6. Current product documents
7. Roadmaps and plans

Update the closest authoritative document when an approved architecture decision changes.
