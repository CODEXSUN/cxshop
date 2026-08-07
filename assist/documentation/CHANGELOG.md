# CXShop Changelog

## Version State

Current version: 1.1.1

Release tag: v-1.1.1

Changelog label: v 1.1.1

## v-1.1.1

### [v 1.1.1] 2026-08-07 10:17 am - Simplify database configuration

#### Database Changes

- Database update: No (manual).

#### App Codebase Changes

- Bumped the workspace version to 1.1.1.
- Removed `DB_CONNECTION_LIMIT` and `DB_SSL` from the environment contract.
- Set the MariaDB pool size to 10 in the owned database adapter.
- Disabled database URL SSL options in source until an approved deployment policy enables them.

## v-1.0.1

### [v 1.0.1] 2026-08-07 8:11 am - Marketplace foundation

#### Database Changes

- Database update: No.

#### App Codebase Changes

- Added guarded reuse of the CXApp MariaDB, Redis, Docker network, FileBrowser, and media volume.
- Added the independent environment contract, CI-safe validator, root configuration, and workspace ownership baseline.
- Added the CXShop ecosystem, governance, architecture, and agent instructions.
- Added the guarded deployment and release workflow foundation.
- Added CXApp and Frappe integration boundaries.
