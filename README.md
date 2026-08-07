# CXShop

CXShop is a multi-vendor commerce platform for customer, vendor, and platform operations.

The product uses a modular monolith, domain-owned data, durable jobs, and explicit integration contracts.
It can connect to CXApp and Frappe without sharing databases or private module code.

## Start here

Read these files before you plan or change the repository:

1. [`AGENTS.md`](AGENTS.md)
2. [`assist/AGENT-GUIDE.md`](assist/AGENT-GUIDE.md)
3. [`assist/governance/rules.md`](assist/governance/rules.md)
4. [`assist/product/ecosystem.md`](assist/product/ecosystem.md)
5. The closest architecture document for the affected area

## Current state

This repository contains a statically verified Stage 0 application foundation with one web runtime and one API runtime. Live database and browser verification remain required.

## Local runtime

```text
npm run dev
```

- Web: `http://127.0.0.1:7520`
- API: `http://127.0.0.1:7510`
- Vendor: `http://127.0.0.1:7520/vendor`
- Admin: `http://127.0.0.1:7520/admin`
- Super Admin: `http://127.0.0.1:7520/sa`
- API docs: `http://127.0.0.1:7510/docs`

## Build and verification

```text
npm run build
npm run check
```

The unified Next.js runtime writes to root `.next/`. Backend TypeScript writes below root `dist/`. The build cleans stale output first, and `npm run check:artifacts` rejects workspace-local `.next/`, `dist/`, or `dist-types/` directories.

## Business Assist

OpenAI Business Assist is available to Admin and Super Admin at `/admin/assist` and `/sa/assist`. It is disabled by default.

To enable it, configure these ignored `.env` values and run the migrations and seeders before `npm run dev`:

```text
OPENAI_ENABLED=1
OPENAI_API_KEY=<private key>
OPENAI_URL=https://api.openai.com/v1
OPENAI_MODEL=<approved model>
OPENAI_REASONING=low
OPENAI_OUTPUT_MAX_TOKENS=1600
```

Business Assist persists requests and results in CXShop MariaDB and executes provider calls through the durable worker. Model output is advisory and cannot directly mutate marketplace state.

## Release commands

```text
npm run version:show
npm run check:versions
npm run version:bump -- --title "Title" --no-database-update
npm run github:now -- --dry-run
```

## Local base setup

The ignored `.env` contains independent CXShop development settings.
The tracked `.env.example` defines the full environment contract.

```text
npm run setup:base
npm run env:check
npm run env:example:check
npm run test:env
```

## Shared infrastructure

CXShop reuses approved CXApp infrastructure with separate data scopes.

```text
npm run infrastructure:check
npm run infrastructure:check:live
```

See [`assist/operations/shared-infrastructure.md`](assist/operations/shared-infrastructure.md).

Do not describe CXShop as a working marketplace until the required runtime and live checks pass.
