#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTAINER_DIR="$ROOT_DIR/.container"
# shellcheck source=.container/scripts/common.sh
. "$CONTAINER_DIR/scripts/common.sh"

MODE=install
TARGET=billing
ASSUME_YES=false
CLEAN_BEFORE_INSTALL=false

usage() {
  cat <<'EOF'
Usage: bash setup.sh [--clean] [--reinstall] [--yes] [billing]

Interactive CODEXSUN container installation from the repository root.

The installer requires an already prepared .container/deploy.env, validates it,
verifies the shared CXApp MariaDB, Redis, Media, and Docker network, provisions
the isolated cxshop_db database, and deploys the CXShop application stack.

--reinstall cleanly replaces CODEXSUN containers and images, then runs safe
forward migrations. Named volumes, databases, credentials, and uploads remain.
No setup mode deletes a Docker volume or drops a database.

--yes applies the displayed deployment plan without confirmation.

--clean opens the scoped local cleanup menu before installation. Choose
application only, all runtime containers/images, or complete local data cleanup.
Build-cache pruning is offered separately.

Configuration:
  .env                         Local development only
  .container/deploy.env        Private deployment configuration
  .container/deploy.env.sample Shareable deployment defaults

Prepare deployment configuration separately before setup:
  bash prepare-env.sh

Cloud preparation:
  bash prepare-env.sh
EOF
}

for argument in "$@"; do
  case "$argument" in
    --reinstall) MODE=reinstall ;;
    --clean) CLEAN_BEFORE_INSTALL=true ;;
    -y|--yes) ASSUME_YES=true ;;
    billing) TARGET=$argument ;;
    -h|--help) usage; exit 0 ;;
    *) usage >&2; exit 64 ;;
  esac
done

bash "$ROOT_DIR/prepare-env.sh" --check

if [ "$CLEAN_BEFORE_INSTALL" = true ]; then
  bash "$CONTAINER_DIR/clean.sh" --interactive
fi

prepare_deploy_env
validate_deploy_env
require_docker
migrate_legacy_application_project
validate_container_ownership

echo
echo "CODEXSUN deployment plan"
echo "  Runtime and deployment configuration: $DEPLOY_ENV"
echo "  Shared infrastructure: cxapp-mariadb, cxapp-redis, cxapp-media, cxapp-network"
echo "  Application: Framework + UI + Platform + Core + Billing + Mail + Ecommerce + Blogs"
echo "  Persistent data: named volumes are preserved"
echo "  Container ownership: verified before Docker changes"
if [ "$ASSUME_YES" != true ]; then
  read -r -p "Build and apply this CODEXSUN installation? [Y/n] " confirmation
  case "${confirmation:-Y}" in
    y|Y|yes|Yes|YES) ;;
    *)
      echo "Setup cancelled before Docker changes."
      exit 0
      ;;
  esac
fi
ensure_network

require_shared_infrastructure
ensure_application_volume
MSYS_NO_PATHCONV=1 docker exec -i \
  -e "MARIADB_ROOT_PASSWORD=$(env_value MARIADB_ROOT_PASSWORD)" \
  -e "CXSHOP_DB_USER=$(env_value DB_USER)" \
  -e "CXSHOP_DB_PASSWORD=$(env_value DB_PASSWORD)" \
  -e "CXSHOP_DB_NAME=$(env_value DB_MASTER_NAME)" \
  cxapp-mariadb bash -s <"$CONTAINER_DIR/database/mariadb/10-cxshop-grants.sh"
echo "CXShop database and restricted application grants reconciled in shared MariaDB."
bash "$CONTAINER_DIR/update-runtime.sh"

deploy_target() {
  stack="$1"
  if [ "$MODE" = reinstall ]; then
    bash "$CONTAINER_DIR/deploy.sh" "$stack" --reinstall
  else
    bash "$CONTAINER_DIR/deploy.sh" "$stack" up
  fi
}

deploy_target "$TARGET"
bash "$CONTAINER_DIR/smoke-test.sh"

echo "CODEXSUN setup completed: mode=$MODE target=$TARGET"
