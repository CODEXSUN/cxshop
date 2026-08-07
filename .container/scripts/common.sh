#!/usr/bin/env sh
set -eu

CONTAINER_DIR=${CONTAINER_DIR:-$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)}
PROJECT_ROOT=$(CDPATH= cd -- "$CONTAINER_DIR/.." && pwd)
DEPLOY_ENV="$CONTAINER_DIR/deploy.env"

prepare_deploy_env() {
  [ -f "$DEPLOY_ENV" ] || {
    echo "Missing deployment environment: $DEPLOY_ENV" >&2
    echo "Run bash prepare-env.sh from the repository root." >&2
    exit 78
  }
}

env_value() {
  key="$1"
  grep -E "^${key}=" "$DEPLOY_ENV" 2>/dev/null | tail -n 1 | cut -d= -f2- | tr -d '\r'
}

require_env_value() {
  key="$1"
  value=$(env_value "$key" || true)
  [ -n "$value" ] || {
    echo "$key is required in $DEPLOY_ENV." >&2
    exit 78
  }
}

validate_deploy_env() {
  for key in NODE_ENV APP_VERSION DOCKER_NETWORK INFRASTRUCTURE_MODE SHARED_DOCKER_NETWORK SHARED_CREDENTIALS_READY API_PORT WEB_PORT DB_DRIVER DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD REDIS_URL REDIS_PREFIX FILEBROWSER_URL SHARED_MEDIA_VOLUME SHARED_MEDIA_ROOT RUNTIME_COMPOSE; do
    require_env_value "$key"
  done
  [ "$(env_value NODE_ENV)" = "production" ] || {
    echo "NODE_ENV must be production." >&2
    exit 78
  }
  [ "$(env_value DB_DRIVER)" = "mariadb" ] || {
    echo "DB_DRIVER must be mariadb." >&2
    exit 78
  }
  [ "$(env_value INFRASTRUCTURE_MODE)" = "cxapp-shared" ] || {
    echo "INFRASTRUCTURE_MODE must be cxapp-shared." >&2
    exit 78
  }
  [ "$(env_value SHARED_DOCKER_NETWORK)" = "cxapp-network" ] || {
    echo "SHARED_DOCKER_NETWORK must be cxapp-network." >&2
    exit 78
  }
  [ "$(env_value DB_NAME)" = "cxshop_db" ] || {
    echo "CXShop must not use a CXApp-owned database." >&2
    exit 78
  }
  [ "$(env_value SHARED_CREDENTIALS_READY)" = "1" ] || {
    echo "Shared CXApp infrastructure credentials are not configured." >&2
    exit 78
  }
}

require_docker() {
  docker info >/dev/null 2>&1 || {
    echo "Docker Engine is not reachable." >&2
    exit 69
  }
  docker compose version >/dev/null 2>&1 || {
    echo "Docker Compose v2 is required." >&2
    exit 69
  }
}

require_shared_resources() {
  docker network inspect "$(env_value SHARED_DOCKER_NETWORK)" >/dev/null 2>&1 || {
    echo "The external CXApp Docker network is unavailable." >&2
    exit 69
  }
  for container in cxapp-mariadb cxapp-redis cxapp-media; do
    docker container inspect "$container" >/dev/null 2>&1 || {
      echo "The external CXApp container is unavailable: $container" >&2
      exit 69
    }
  done
  docker volume inspect "$(env_value SHARED_MEDIA_VOLUME)" >/dev/null 2>&1 || {
    echo "The external CXApp media volume is unavailable." >&2
    exit 69
  }
}

runtime_compose_path() {
  value=$(env_value RUNTIME_COMPOSE)
  case "$value" in
    /*) printf '%s' "$value" ;;
    *) printf '%s/%s' "$PROJECT_ROOT" "$value" ;;
  esac
}

require_runtime_compose() {
  compose_file=$(runtime_compose_path)
  [ -f "$compose_file" ] || {
    echo "CXShop runtime deployment is not implemented." >&2
    echo "Missing Compose file: $compose_file" >&2
    exit 78
  }
}
