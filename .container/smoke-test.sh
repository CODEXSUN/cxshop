#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=.container/scripts/common.sh
. "$SCRIPT_DIR/scripts/common.sh"

prepare_deploy_env
validate_deploy_env
require_docker

http_ok() {
  url="$1"
  label="$2"
  if command -v curl >/dev/null 2>&1; then
    curl --fail --silent --show-error --max-time 15 "$url" >/dev/null
  else
    wget -q -T 15 -O /dev/null "$url"
  fi
  echo "ok $label: $url"
}

bind=$(env_value CXSHOP_BIND_ADDRESS)

http_ok "http://${bind}:$(env_value PLATFORM_API_PORT)/health" platform-api
http_ok "http://${bind}:$(env_value PLATFORM_WEB_PORT)/health" platform-web
http_ok "http://${bind}:$(env_value MEDIA_HOST_PORT)/" media

redis_container=$(redis_container_name)
mariadb_container=$(mariadb_container_name)

docker exec "$redis_container" sh -ec 'REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli ping' | grep -qx PONG
echo "ok Redis authenticated connection"

published_port=$(docker port "$mariadb_container" 3306/tcp)
case "$published_port" in
  *":$(env_value MARIADB_HOST_PORT)") ;;
  *) echo "MariaDB is not published on the configured host port: $published_port" >&2; exit 69 ;;
esac
echo "ok MariaDB host port: $published_port"

db_password=$(env_value DB_PASSWORD)
db_user=$(env_value DB_USER)
master_db=$(env_value DB_MASTER_NAME)
tenant_db=$(env_value DEFAULT_TENANT_DB_NAME)
tenant_code=$(env_value DEFAULT_TENANT_CORPORATE_ID)
case "$master_db" in
  *[!A-Za-z0-9_]*) echo "Unsafe DB_MASTER_NAME: $master_db" >&2; exit 78 ;;
esac
case "$tenant_db" in
  *[!A-Za-z0-9_]*) echo "Unsafe DEFAULT_TENANT_DB_NAME: $tenant_db" >&2; exit 78 ;;
esac
case "$tenant_code" in
  *[!A-Za-z0-9_-]*) echo "Unsafe DEFAULT_TENANT_CORPORATE_ID: $tenant_code" >&2; exit 78 ;;
esac
docker exec -e MYSQL_PWD="$db_password" "$mariadb_container" \
  mariadb --protocol=tcp -h 127.0.0.1 -P 3306 -u "$db_user" \
  --batch --skip-column-names \
  -e "SELECT COUNT(*) FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME IN ('$master_db', '$tenant_db');" \
  | grep -Eq '^[12]$'
echo "ok master/default tenant databases: $master_db, $tenant_db"

docker exec -e MYSQL_PWD="$db_password" "$mariadb_container" \
  mariadb --protocol=tcp -h 127.0.0.1 -P 3306 -u "$db_user" "$master_db" \
  --batch --skip-column-names \
  -e "SELECT COUNT(*) FROM tenants WHERE db_name = '$tenant_db' AND tenant_code = UPPER('$tenant_code');" \
  | grep -qx 1
echo "ok single-tenant database mapping"

docker exec -e MYSQL_PWD="$db_password" "$mariadb_container" \
  mariadb --protocol=tcp -h 127.0.0.1 -P 3306 -u "$db_user" "$tenant_db" \
  --batch --skip-column-names \
  -e "SELECT COUNT(*) FROM app_module_settings WHERE enabled = 1 AND module_key IN ('billing.sales', 'mail');" \
  | grep -qx 2
echo "ok Billing and Mail modules enabled"

echo "CODEXSUN container smoke test passed."
