#!/bin/bash
# Direction A — Claude-authored packet reviewed by the opposite provider (OpenAI GPT-6.1 Sol through codex exec).
# Usage: tools/calibration/run-direction-a.sh <run-dir prepared by build-run.ts> [effort=xhigh] [model=gpt-6.1-sol]
# The reviewer's working directory is <run>/packet, which contains only packet.json; sandbox is read-only.
# --ignore-user-config drops the user's config.toml (plugins, hooks, features); memories are disabled explicitly;
# CODEX_NO_LANG_DIRECTIVE=1 stops the local wrapper from prepending text, so prompt.txt is exactly what is sent.
set -u
RUN="$(cd "$1" && pwd)" || exit 2
EFFORT="${2:-xhigh}"
MODEL="${3:-gpt-6.1-sol}"
cd "$RUN/packet" || exit 2
CMD=(codex exec --cd "$RUN/packet" --skip-git-repo-check --sandbox read-only --ignore-user-config --disable memories
  -m "$MODEL" -c "model_reasoning_effort=$EFFORT" --ephemeral --output-schema "$RUN/output-schema.json"
  -o "$RUN/last-message.json" -)
printf '%q ' CODEX_NO_LANG_DIRECTIVE=1 "${CMD[@]}" > "$RUN/command.txt"
printf '< %q\n' "$RUN/prompt.txt" >> "$RUN/command.txt"
codex --version > "$RUN/cli-version.txt" 2>&1
date -u +%Y-%m-%dT%H:%M:%SZ > "$RUN/started-at.txt"
CODEX_NO_LANG_DIRECTIVE=1 "${CMD[@]}" < "$RUN/prompt.txt" > "$RUN/stdout.txt" 2> "$RUN/stderr.txt"
echo $? > "$RUN/exit-code.txt"
date -u +%Y-%m-%dT%H:%M:%SZ > "$RUN/finished-at.txt"
echo "direction A finished: exit $(cat "$RUN/exit-code.txt")"
