# Shared CXApp Infrastructure

## Decision

CXShop reuses the existing CXApp MariaDB, Redis, Docker network, and FileBrowser service.

CXApp owns these infrastructure resources.
CXShop consumes them as external resources.

CXShop must never create, replace, stop, remove, or prune these resources.

## Resource contract

| Resource | CXApp owner | CXShop scope |
| --- | --- | --- |
| Docker network | `cxapp-network` | External network attachment |
| MariaDB container | `cxapp-mariadb` | Dedicated `cxshop_db` database and `cxshop` user |
| Redis container | `cxapp-redis` | Database index `2` and `cxshop:` key prefix |
| FileBrowser container | `cxapp-media` | `/srv/cxshop` media root |
| Media volume | `cxapp-media-data` | External volume mounted for the CXShop media root |

## Local host endpoints

- MariaDB: `127.0.0.1:3307`
- Redis: `127.0.0.1:6379`
- FileBrowser: `http://127.0.0.1:7090`

## Container endpoints

- MariaDB: `cxapp-mariadb:3306`
- Redis: `cxapp-redis:6379`
- FileBrowser: `http://cxapp-media`

CXShop application containers must join the external `cxapp-network` network.

## Data isolation

- Do not use `cxapp_master_db` or any CXApp tenant database.
- Do not reuse a CXApp application database user for normal CXShop runtime access.
- Give the CXShop user access only to `cxshop_db`.
- Do not use Redis database index `0`.
- Prefix every Redis key with `cxshop:`.
- Keep CXShop media under `/srv/cxshop`.
- Do not mount the FileBrowser database volume into CXShop application containers.

## Credentials

Copy the approved shared-resource credentials into the ignored CXShop `.env` and deployment environment.
Set `SHARED_CREDENTIALS_READY=1` only after the credentials are configured.

Do not commit credentials or read them from the CXApp repository at application runtime.

The CXApp MariaDB administrator must create `cxshop_db` and the limited CXShop user before the first migration.

## Checks

Validate the static contract:

```text
npm run infrastructure:check
```

Validate live endpoints and external Docker resources:

```text
npm run infrastructure:check:live
```

The live check is read-only.
It does not create or modify infrastructure.
