# Deployment

## Current state

The repository has a guarded container deployment foundation.
The application runtime and Compose stack are not implemented.

Deployment must stop until `.container/runtime/docker-compose.yml` exists.

## Configuration

- Use `.env` for local development.
- Validate local settings with `npm run env:check`.
- Use `.container/deploy.env` for private deployment configuration.
- Use `.container/deploy.env.sample` for shareable defaults.
- Never commit `.container/deploy.env`.

## Commands

Prepare the deployment file:

```text
bash prepare-env.sh
```

Check update readiness:

```text
bash update.sh --check
```

Deploy after the runtime exists:

```text
bash setup.sh
```

## Runtime requirements

The future Compose stack must include:

- CXShop API with a health endpoint
- Customer, vendor, and platform web delivery
- Migration tooling that runs before API replacement
- Named resources with `cxshop` identifiers
- Explicit container ownership checks before replacement
- External attachment to `cxapp-network`
- External use of the approved MariaDB, Redis, FileBrowser, and media volume

CXShop does not own the shared infrastructure lifecycle.
Follow `assist/operations/shared-infrastructure.md`.
