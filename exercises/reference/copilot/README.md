# GitHub Copilot reference material

Copilot equivalents of the Claude Code reference material next door, and
where an equivalent does not (fully) exist yet. Checked 2026-09.

## `copilot-instructions.md` → context

Equivalent of a project `CLAUDE.md`. Copy to `.github/copilot-instructions.md`
at the repo root. For path-scoped rules, add
`.github/instructions/<name>.instructions.md` files with an `applyTo: <glob>`
frontmatter field — Copilot's closer analog to Claude Code's
`.claude/rules/*.md` `paths:` scoping.
(`docs.github.com/en/copilot/how-tos/configure-custom-instructions`)

## `agents/legacy-researcher.agent.md` → sub-agent

Equivalent of the Claude Code sub-agent. Copy to
`.github/agents/legacy-researcher.agent.md`. Frontmatter fields: `name`,
`description` (required), `tools`, `model`, `target`. Invoke with
`@legacy-researcher`. (Microsoft Learn / `docs.github.com/en/copilot/reference/custom-agents-configuration`)

## `skills/legacy-summary/SKILL.md` → skill

Same Agent Skills open standard (agentskills.io) format as the Claude Code
version. As of 2026-09, GitHub has GA'd Agent Skills support specifically
for **Copilot code review** (`.github/skills/<name>/SKILL.md`, GA
2026-07-29) — not confirmed as available to Copilot's interactive chat/agent
modes the same way. Copy it in for code-review use; verify current docs
before assuming it also fires in chat.

## `hooks.json` + `hooks/` → hooks

Updated 2026-09-13 against the primary docs (the March 2026 changelog we
previously cited was JetBrains-scoped preview; the reference docs below
have since expanded well past that — this section replaces our earlier,
now-stale claim that no deny schema was published). Hooks run on **two
surfaces**: the Copilot CLI (locally, same shell as the CLI) and the
Copilot cloud agent (in its ephemeral sandbox, reading only
`.github/hooks/*.json` from the cloned repo) — not confirmed for VS
Code/JetBrains as of this writing.
(`docs.github.com/en/copilot/reference/hooks-reference`,
`docs.github.com/en/copilot/concepts/agents/hooks`)

Config file: `.github/hooks/hooks.json` —
`{"version": 1, "hooks": {"<eventName>": [{"type": "command", "bash": "...", ...}]}}`.
Event names include `sessionStart`/`sessionEnd`, `userPromptSubmitted`,
`preToolUse`/`postToolUse`, `agentStop`/`subagentStop`, and
`errorOccurred`.

Both reference scripts require `jq` (`brew install jq` / `apt install jq`)
and fail closed (a `deny`/`block` decision) with a clear message if it's
missing, rather than crashing. Both are included here, working and tested
standalone, same as the Claude Code versions next door:

- `hooks/deny-test-edits.sh` (`preToolUse`) — denies `create`/`edit` tool
  calls targeting `*.test.ts`. `preToolUse` supports denial **both** ways,
  unlike what we previously claimed here: via stdout JSON
  (`{"permissionDecision": "allow|deny|ask", "permissionDecisionReason": "..."}`)
  **and** via exit code — the docs state "exit `2` is treated as a deny:
  any stdout JSON is merged with the deny decision" and "a non-zero exit
  (other than exit `2`) denies the tool call with 'Denied by preToolUse
  hook (hook errored)'". This script uses exit `2` for every deny path
  (matching Claude Code's own convention) and still prints the reason
  JSON, which Copilot merges in; the happy-path allow exits `0` with an
  explicit `{"permissionDecision": "allow"}` (exit 0 with empty stdout is
  not documented as an implicit allow, so we don't rely on that).
  (`ask` is treated as `deny` under cloud agent, since there's no user to
  ask.)
- `hooks/stop-verify.sh` (`agentStop`) — the real equivalent of Claude
  Code's `Stop` hook: runs typecheck + `test:affected`, blocking via
  `{"decision": "block", "reason": "..."}` (forces another turn using
  `reason` as the next prompt) when something fails. Unlike `preToolUse`,
  the docs don't describe any exit-code meaning for `agentStop` — only the
  `decision` field in stdout JSON matters — so this script always exits
  `0` and lets the JSON carry the decision. Same `BASELINE:` exclusion as
  the Claude Code version — see `exercises/bonus-real-world-constraints.md`.

Test either one standalone before wiring it up:

```sh
echo '{"toolName":"edit","toolArgs":{"path":"packages/pricing/src/pricing.test.ts"}}' \
  | ./hooks/deny-test-edits.sh; echo "exit: $?"   # deny JSON, exit: 2
```

To install: copy `hooks.json` to `.github/hooks/hooks.json` and both
scripts to `.github/hooks/` (flat — the `bash` paths in `hooks.json`
already assume that layout), then `chmod +x .github/hooks/*.sh`.

One caveat we could not fully close: the exact `toolArgs` field name for
a file path on the `create`/`edit` tools isn't pinned down by the schema
doc (which only says `toolArgs: unknown`) the way `tool_input.file_path`
is for Claude Code — `deny-test-edits.sh` tries `path`, `file`, and
`file_path` to cover the likely options, but verify against your actual
Copilot CLI version's payloads (or a `postToolUse` log) before trusting
it in a real session; we tested it only against hand-built payloads
matching the documented schema, not a live Copilot run.
