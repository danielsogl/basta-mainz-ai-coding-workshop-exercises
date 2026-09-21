#!/usr/bin/env bash
# preToolUse hook for GitHub Copilot (CLI + cloud agent): denies edits to
# test files. Same golden-rule policy as the Claude Code
# deny-test-edits.sh next door, translated to Copilot's hook schema
# (docs.github.com/en/copilot/reference/hooks-reference, checked 2026-09).
#
# Copilot's preToolUse hooks support BOTH exit-code and stdout-JSON
# denial: "exit 2 is treated as a deny: any stdout JSON is merged with the
# deny decision", and "a non-zero exit (other than exit 2) denies the tool
# call with 'Denied by preToolUse hook (hook errored)'" (same doc). We use
# exit 2 for every deny path, including the fail-closed ones below, and
# still print the reason JSON where we can — Copilot merges it in. Only
# the happy-path allow needs stdout JSON at all (exit 0 with no output is
# not documented as an implicit allow).
set -uo pipefail

deny() {
  local reason="$1"
  if command -v jq >/dev/null 2>&1; then
    jq -n --arg reason "$reason" '{permissionDecision: "deny", permissionDecisionReason: $reason}'
  else
    echo "deny-test-edits.sh: $reason" >&2
  fi
  exit 2
}

allow() {
  echo '{"permissionDecision": "allow"}'
  exit 0
}

if ! command -v jq >/dev/null 2>&1; then
  deny "jq is required but not installed (brew install jq / apt install jq) — denying to be safe."
fi

input=$(cat)

if ! jq -e '.' >/dev/null 2>&1 <<<"$input"; then
  deny "could not parse hook input as JSON — denying to be safe."
fi

tool_name=$(jq -r '.toolName // empty' <<<"$input")
# File-operation tools per current docs: create, edit, view (read-only,
# not relevant here). toolArgs' shape isn't pinned down by that doc beyond
# "unknown" — try the field names actually used for the create/edit tools.
file_path=$(jq -r '.toolArgs.path // .toolArgs.file // .toolArgs.file_path // empty' <<<"$input")

case "$tool_name" in
  create | edit) ;;
  *) allow ;;
esac

if [[ "$file_path" =~ \.test\.ts$ ]]; then
  deny "Agents may not edit test files ($file_path). Ask a human to change the test, or change the implementation instead."
fi

allow
