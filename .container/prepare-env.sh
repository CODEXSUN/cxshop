#!/usr/bin/env sh
set -eu

CONTAINER_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SAMPLE="$CONTAINER_DIR/deploy.env.sample"
TARGET="$CONTAINER_DIR/deploy.env"

if [ "${1:-}" = "--check" ]; then
  [ -f "$TARGET" ] || {
    echo "Missing deployment environment: $TARGET" >&2
    exit 78
  }
  echo "Deployment environment exists: $TARGET"
  exit 0
fi

[ -f "$TARGET" ] || cp "$SAMPLE" "$TARGET"
chmod 600 "$TARGET" 2>/dev/null || true
echo "Review the private deployment environment: $TARGET"
