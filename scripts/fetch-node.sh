#!/bin/sh
# Download the pinned Node runtime into .runtime/ and verify it against the official SHASUMS256.txt.
set -eu
VERSION=24.22.1
DIST="node-v$VERSION-darwin-arm64"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/.runtime"
cd "$ROOT/.runtime"
if [ -x "$DIST/bin/node" ]; then
  echo "present: $ROOT/.runtime/$DIST"; exit 0
fi
curl -fsSLO "https://nodejs.org/dist/v$VERSION/SHASUMS256.txt"
curl -fsSLO "https://nodejs.org/dist/v$VERSION/$DIST.tar.gz"
grep " $DIST.tar.gz\$" SHASUMS256.txt > expected.sha
shasum -a 256 -c expected.sha
tar -xzf "$DIST.tar.gz"
"$DIST/bin/node" --version
