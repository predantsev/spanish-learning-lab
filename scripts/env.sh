# Source this file to put the project-contained Node 24.22.1 first on PATH (current shell only).
# In a git worktree without its own .runtime/, the main checkout's verified runtime is reused.
SLL_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
SLL_NODE_BIN="$SLL_ROOT/.runtime/node-v24.22.1-darwin-arm64/bin"
if [ ! -x "$SLL_NODE_BIN/node" ]; then
  SLL_COMMON="$(git -C "$SLL_ROOT" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)"
  if [ -n "$SLL_COMMON" ]; then SLL_NODE_BIN="$(dirname "$SLL_COMMON")/.runtime/node-v24.22.1-darwin-arm64/bin"; fi
fi
if [ ! -x "$SLL_NODE_BIN/node" ]; then echo "Run scripts/fetch-node.sh first" >&2; else export PATH="$SLL_NODE_BIN:$PATH"; fi
