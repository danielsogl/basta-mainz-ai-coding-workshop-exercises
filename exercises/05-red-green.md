# Ü5: Waitlist red → green

**Block:** 3 · Build & Test · **Time box:** 40 min · **Skill:** `red-green` · **Checkpoint:** `checkpoint/05-build`

## Goal

Build the waitlist from the spec, test-first, with hooks that force
verification instead of trusting the agent's good will.

## Starting state

`docs/waitlist/spec.md` and `AGENTS.md` (or `git stash -u; git checkout checkpoint/04-context`).

## Steps

1. **RED.** Invoke the `red-green` skill on `docs/waitlist/spec.md`. It writes
   one test per acceptance criterion into `apps/api/src/waitlist.test.ts`,
   runs them and **stops**.
2. **Review the tests** against the spec. This is the real gate. Does every
   criterion have a test? Does each one fail for the right reason (missing
   behaviour, not a typo)? Commit the tests.
3. **Switch on the hooks.** They are Node scripts and run on every OS.
   - Claude Code: copy `exercises/reference/claude-code/settings.json` to `.claude/settings.json`
   - Copilot (VS Code agent mode or CLI): copy `exercises/reference/copilot/hooks.json`
     to `.github/hooks/hooks.json`. The Copilot CLI runs repo hooks only in a
     folder you trust: answer the trust prompt at startup with yes. In an
     untrusted folder the hooks are skipped without a warning.
   - Visual Studio or other tools: use the Copilot CLI in a terminal for this
     exercise, or run `npm run check` yourself after every agent turn.

   Copy commands for every shell: [`reference/hooks/README.md`](./reference/hooks/README.md).
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
hook send the agent back to fix it without you explaining anything.

## Behind?

`git stash -u; git checkout checkpoint/05-red` (tests written, RED, hooks on) or
`git stash -u; git checkout checkpoint/05-build` (done, hooks on).

Both checkpoints ship `.claude/settings.json` and `.github/hooks/hooks.json`,
because `git stash -u` also parks the hook files you copied yourself.
On `checkpoint/05-red`, AC5 (unknown event → 404) is already green: the
existing route answers 404 for unknown events. That is the one criterion
that needs no new code.

## In your own repo instead

One acceptance criterion from your spec, test first, same two hooks.
