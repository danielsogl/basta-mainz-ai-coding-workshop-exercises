#!/usr/bin/env bash
# agentStop hook for GitHub Copilot (CLI + cloud agent): the closest
# equivalent to Claude Code's Stop hook. Runs typecheck + test:affected
# before letting the agent's turn end, same policy as the Claude Code
# stop-verify.sh next door (docs.github.com/en/copilot/reference/hooks-reference,
# checked 2026-09).
#
# Decision is conveyed via stdout JSON, not exit code: `{"decision":
# "block", "reason": "..."}` forces another agent turn, using `reason` as
# the next prompt. This script always exits 0.
#
# Skips tests tagged BASELINE: (see e.g. apps/api/src/server.test.ts) —
# known, pre-existing, accepted-as-broken failures recorded once at the
# test name (see exercises/bonus-real-world-constraints.md) — everything
# else, including the flaky test if it genuinely fails, still blocks.
#
# This script does not read the hook's JSON payload at all (it only needs
# $GITHUB_WORKSPACE / the repo root); malformed or missing stdin has no
# effect either way.
set -uo pipefail

if ! command -v jq >/dev/null 2>&1; then
  echo "stop-verify.sh: jq is required but not installed (brew install jq / apt install jq)." >&2
  echo '{"decision": "block", "reason": "jq is not installed in this environment — install it before this hook can verify anything."}'
  exit 0
fi

block() {
  jq -n --arg reason "$1" '{decision: "block", reason: $reason}'
  exit 0
}

repo_root="${GITHUB_WORKSPACE:-$(pwd)}"
cd "$repo_root" || block "could not cd to $repo_root."

if ! npm run --silent typecheck; then
  block "typecheck failed — fix the errors above before finishing this turn."
fi

if ! npm run --silent test:affected -- -t '^(?!.*BASELINE:).*$'; then
  block "affected tests failed — fix the failures above before finishing this turn."
fi

echo '{"decision": "allow"}'
exit 0
