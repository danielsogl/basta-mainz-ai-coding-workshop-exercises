# Claude Code reference material

Copy what you need into your own `.claude/` directory. Nothing here is
wired up in the starter repo by default — Exercise Ü5 has you install
`settings.json` and the hooks yourself.

## `settings.json` + `hooks/`

`deny-test-edits.sh` requires `jq` (`brew install jq` / `apt install jq`
— not preinstalled on stock macOS) and fails closed with a clear message
if it's missing; `stop-verify.sh` doesn't use `jq` at all.

- `hooks/stop-verify.sh` — a `Stop` hook. Runs `npm run typecheck` and
  `npm run test:affected` before letting a turn end; exits `2` (blocking)
  on failure so Claude sees the failure and keeps working. It does not
  read the hook's JSON payload from stdin at all — it only needs
  `$CLAUDE_PROJECT_DIR` — so malformed or missing stdin has no effect
  either way. Uses `test:affected` rather than the full suite, and
  additionally skips any test named with a `BASELINE:` prefix (see the
  script's comment and `exercises/bonus-real-world-constraints.md`): this repo ships one known,
  pre-existing, accepted-as-broken test, and a hook that blocks every
  turn on an unrelated, already-known failure trains you to silence the
  hook instead of trusting it. Nothing else is excluded — a real
  regression anywhere, including the flaky test if it genuinely fails on
  that run, still blocks.
- `hooks/deny-test-edits.sh` — a `PreToolUse` hook matched on `Edit|Write`.
  Denies any edit to a `*.test.ts` file. This is the golden rule
  made mechanical: an agent that disagrees with a test should say so, not
  quietly change it. Reads the hook's JSON payload from stdin; if that
  payload isn't valid JSON, it denies and exits `2` with a clear message
  (fails closed) rather than crashing on a raw parser error.

`deny-test-edits.sh` speaks the current `PreToolUse` hook protocol
(`code.claude.com/docs/en/hooks`, checked 2026-09): exit code `2` always
blocks, and the hook returns
`{"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": "..."}}`
on stdout to explain the denial. Test a hook standalone before wiring it up:

```sh
echo '{"tool_name":"Edit","tool_input":{"file_path":"packages/pricing/src/pricing.test.ts"}}' \
  | ./hooks/deny-test-edits.sh; echo "exit: $?"
```

To install: copy `settings.json` and `hooks/` into `.claude/` at the repo
root (`cp -r exercises/reference/claude-code/hooks .claude/hooks && cp
exercises/reference/claude-code/settings.json .claude/settings.json`),
then `chmod +x .claude/hooks/*.sh`.

## `skills/legacy-summary/`

An example project skill (`.claude/skills/legacy-summary/SKILL.md`).
Demonstrates a repeated instruction ("go read this legacy module and tell
me what it really does, don't touch it") turned into a reusable, named
skill — compare Ü6.

## `agents/legacy-researcher.md`

An example project sub-agent (`.claude/agents/legacy-researcher.md`). Same
task as the skill above, but run as a sub-agent instead: it gets its own
context window, and only its final written summary comes back to the
calling session — none of the files it read or the throwaway script it ran
pollute the caller's context. This is the "context firewall" pattern from
the workshop's Build & Test block. Compare the two: a skill runs inline in your
context; a sub-agent runs in its own and firewalls everything except its
final report.
