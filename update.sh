#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if [ "${1:-}" = "--check" ]; then
  git fetch --quiet
  git status --short --branch
  npm run check:versions
  exit 0
fi

git pull --rebase --autostash
npm ci
npm run release:check
bash setup.sh
