#!/usr/bin/env bash
set -euo pipefail

# CXShop owns one database inside the shared CXApp MariaDB server.
apply_grants() {
  if declare -F docker_process_sql >/dev/null 2>&1; then
    docker_process_sql
  else
    mariadb --protocol=socket -uroot -p"${MARIADB_ROOT_PASSWORD}"
  fi
}

: "${CXSHOP_DB_USER:?CXSHOP_DB_USER is required}"
: "${CXSHOP_DB_PASSWORD:?CXSHOP_DB_PASSWORD is required}"
: "${CXSHOP_DB_NAME:?CXSHOP_DB_NAME is required}"
: "${MARIADB_ROOT_PASSWORD:?MARIADB_ROOT_PASSWORD is required}"
db_user=$CXSHOP_DB_USER
db_password=$CXSHOP_DB_PASSWORD
escaped_user=$(printf '%s' "$db_user" | sed "s/'/''/g")
escaped_password=$(printf '%s' "$db_password" | sed "s/'/''/g")
db_name=$CXSHOP_DB_NAME
case "$db_name" in
  ''|*[!A-Za-z0-9_]*) echo "Unsafe CXSHOP_DB_NAME: $db_name" >&2; exit 78 ;;
esac

apply_grants <<SQL
CREATE DATABASE IF NOT EXISTS \`${db_name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${escaped_user}'@'%' IDENTIFIED BY '${escaped_password}';
ALTER USER '${escaped_user}'@'%' IDENTIFIED BY '${escaped_password}';
GRANT ALL PRIVILEGES ON \`${db_name}\`.* TO '${escaped_user}'@'%';
FLUSH PRIVILEGES;
SQL
