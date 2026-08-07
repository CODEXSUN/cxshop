#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$ROOT_DIR/prepare-env.sh" --check
bash "$ROOT_DIR/.container/deploy.sh" up
bash "$ROOT_DIR/.container/smoke-test.sh"
