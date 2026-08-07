#!/usr/bin/env sh
set -eu

CONTAINER_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$CONTAINER_DIR/scripts/common.sh"

prepare_deploy_env
validate_deploy_env
require_runtime_compose
require_docker
require_shared_resources

compose_file=$(runtime_compose_path)
action=${1:-up}
case "$action" in
  up) docker compose --env-file "$DEPLOY_ENV" -f "$compose_file" up -d --build --wait ;;
  down) docker compose --env-file "$DEPLOY_ENV" -f "$compose_file" down --remove-orphans ;;
  *) echo "Usage: bash .container/deploy.sh [up|down]" >&2; exit 64 ;;
esac
