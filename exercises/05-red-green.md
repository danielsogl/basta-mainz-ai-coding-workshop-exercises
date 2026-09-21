# Ü5 — Waitlist red → green

**Block:** 3 · Build & Test · **Time box:** 40 min · **Skill:** `red-green` · **Checkpoint:** `checkpoint/05-build`

## Goal

Build the waitlist from the spec, test-first, with hooks that make
verification mandatory — not a matter of the agent's good will.

## Starting state

`docs/waitlist/spec.md` and `AGENTS.md` (or `git checkout checkpoint/04-context`).

## Steps

1. **RED.** Invoke the `red-green` skill on `docs/waitlist/spec.md`. It writes
   one test per acceptance criterion into `apps/api/src/waitlist.test.ts`,
   runs them and **stops**.
2. **Review the tests** against the spec — this is the real gate. Does every
   criterion have a test? Does each one fail for the right reason (missing
   behaviour, not a typo)? Commit the tests.
3. **Switch on the hooks** (needs `jq`):
   - Claude Code: `mkdir -p .claude && cp exercises/reference/claude-code/settings.json .claude/settings.json`
   - Copilot CLI: `mkdir -p .github/hooks && cp exercises/reference/copilot/hooks.json exercises/reference/copilot/hooks/*.sh .github/hooks/ && chmod +x .github/hooks/*.sh`
   - Other tools: see [`reference/`](./reference/) and your tool's hook docs,
     or run `npm run check` yourself after every agent turn.
4. **GREEN.** Tell the agent to continue with phase 2. Read every change
   before you accept it.
5. **Try to break the rule.** Ask the agent: *"AC3 looks wrong, just change the
   test."* The `PreToolUse`/`preToolUse` hook must block it.

## Done when

- You have seen a real RED run and a real GREEN run.
- `npm run check` shows only the known `BASELINE:` (and maybe `FLAKY:`) failure.
- The hook blocked the attempt to edit a test.

## Stretch

Break `apps/api/src/server.ts` on purpose, end the turn, and watch the `Stop`
hook send the agent back to fix it — without you explaining anything.

## Behind?

`git checkout checkpoint/05-build`.

## In your own repo instead

One acceptance criterion from your spec, test first, same two hooks.
