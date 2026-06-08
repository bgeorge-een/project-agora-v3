#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_DIR="$ROOT_DIR/.local-node-official"
NODE_BIN="$NODE_DIR/bin/node"

if [[ ! -x "$NODE_BIN" ]]; then
  echo "Local Node runtime not found at $NODE_BIN" >&2
  echo "Run the local Node setup again, or install Linux-native nodejs in WSL." >&2
  exit 1
fi

export XDG_CACHE_HOME="$ROOT_DIR/.cache"
export PATH="$NODE_DIR/bin:$PATH"
mkdir -p "$XDG_CACHE_HOME"

exec "$NODE_BIN" "$ROOT_DIR/node_modules/next/dist/bin/next" "$@"
