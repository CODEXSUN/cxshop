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

docker exec cxapp-redis sh -ec 'REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli ping' | grep -qx PONG
echo "ok Redis authenticated connection"

published_port=$(docker port cxapp-mariadb 3306/tcp)
case "$published_port" in
  *":$(env_value MARIADB_HOST_PORT)") ;;
  *) echo "MariaDB is not published on the configured host port: $published_port" >&2; exit 69 ;;
esac
echo "ok MariaDB host port: $published_port"

db_password=$(env_value DB_PASSWORD)
db_user=$(env_value DB_USER)
master_db=$(env_value DB_MASTER_NAME)
case "$master_db" in
  *[!A-Za-z0-9_]*) echo "Unsafe DB_MASTER_NAME: $master_db" >&2; exit 78 ;;
esac
docker exec -e MYSQL_PWD="$db_password" cxapp-mariadb \
  mariadb --protocol=tcp -h 127.0.0.1 -P 3306 -u "$db_user" \
  --batch --skip-column-names \
  -e "SELECT COUNT(*) FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '$master_db';" \
  | grep -qx 1
echo "ok standalone CXShop database: $master_db"

echo "CODEXSUN container smoke test passed."
