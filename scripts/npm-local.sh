#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_DIR="$ROOT_DIR/.local-node-official"

if [[ ! -x "$NODE_DIR/bin/npm" ]]; then
  echo "Local npm runtime not found at $NODE_DIR/bin/npm" >&2
  echo "Run the local Node setup again, or install Linux-native nodejs in WSL." >&2
  exit 1
fi

export PATH="$NODE_DIR/bin:$PATH"
exec "$NODE_DIR/bin/npm" "$@"
