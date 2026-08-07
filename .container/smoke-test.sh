#!/usr/bin/env sh
set -eu

CONTAINER_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$CONTAINER_DIR/scripts/common.sh"

prepare_deploy_env
validate_deploy_env
require_runtime_compose
require_docker

api_port=$(env_value API_PORT)
web_port=$(env_value WEB_PORT)
curl --fail --silent --show-error "http://127.0.0.1:${api_port}/health" >/dev/null
curl --fail --silent --show-error "http://127.0.0.1:${web_port}/health" >/dev/null
echo "CXShop container smoke checks passed."
