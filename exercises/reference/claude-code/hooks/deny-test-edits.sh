#!/usr/bin/env bash
# PreToolUse hook (matcher: Edit|Write): blocks edits to test files.
#
# The golden rule: an agent must never modify the tests that verify
# its own work. If the agent believes a test is wrong, that's a message for
# a human, not a same-session edit.
#
# This is a deny-only hook, so every failure mode below fails CLOSED
# (denies, exit 2) rather than crashing open — a broken hook should never
# silently stop protecting test files.
set -uo pipefail

if ! command -v jq >/dev/null 2>&1; then
  echo "deny-test-edits.sh: jq is required but not installed (brew install jq / apt install jq) — denying to be safe." >&2
  exit 2
fi

input=$(cat)

if ! jq -e '.' >/dev/null 2>&1 <<<"$input"; then
  echo "deny-test-edits.sh: could not parse hook input as JSON — denying to be safe." >&2
  exit 2
fi

tool_name=$(jq -r '.tool_name // empty' <<<"$input")
file_path=$(jq -r '.tool_input.file_path // empty' <<<"$input")

if [[ "$tool_name" != "Edit" && "$tool_name" != "Write" ]]; then
  exit 0
fi

if [[ "$file_path" =~ \.test\.ts$ ]]; then
  jq -n --arg reason "Agents may not edit test files ($file_path). Ask a human to change the test, or change the implementation instead." '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $reason
    }
  }'
  exit 2
fi

exit 0
