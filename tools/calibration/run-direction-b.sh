#!/bin/bash
# Direction B — packet reviewed by a FRESH Claude Opus context that never saw the labels (claude -p, no tools).
# Usage: tools/calibration/run-direction-b.sh <run-dir prepared by build-run.ts> [effort=medium] [model=opus]
# --tools "" disables every built-in tool; --safe-mode disables CLAUDE.md, skills, plugins, hooks and MCP servers;
# --no-session-persistence keeps nothing on disk; the working directory contains only packet.json.
set -u
RUN="$(cd "$1" && pwd)" || exit 2
EFFORT="${2:-medium}"
MODEL="${3:-opus}"
cd "$RUN/packet" || exit 2
SCHEMA="$(cat "$RUN/output-schema.json")"
CMD=(claude -p --model "$MODEL" --effort "$EFFORT" --tools "" --safe-mode --no-session-persistence
  --output-format json --json-schema "$SCHEMA")
printf '%q ' claude -p --model "$MODEL" --effort "$EFFORT" --tools '' --safe-mode --no-session-persistence \
  --output-format json --json-schema '<contents of output-schema.json>' > "$RUN/command.txt"
printf '< %q\n' "$RUN/prompt.txt" >> "$RUN/command.txt"
claude --version > "$RUN/cli-version.txt" 2>&1
date -u +%Y-%m-%dT%H:%M:%SZ > "$RUN/started-at.txt"
"${CMD[@]}" < "$RUN/prompt.txt" > "$RUN/stdout.json" 2> "$RUN/stderr.txt"
echo $? > "$RUN/exit-code.txt"
date -u +%Y-%m-%dT%H:%M:%SZ > "$RUN/finished-at.txt"
echo "direction B finished: exit $(cat "$RUN/exit-code.txt")"
