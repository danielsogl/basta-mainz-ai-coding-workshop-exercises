# Ü4: A context file that changes behaviour

**Block:** 2 · Design · **Time box:** 20 min · **Checkpoint:** `checkpoint/04-context`

## Goal

Write the smallest `AGENTS.md` that measurably changes what your agent does.
Prove it with a before/after test.

## Starting state

This repo ships **no** `AGENTS.md` or `copilot-instructions.md`. It does ship
two one-line `CLAUDE.md` files (root and `packages/pricing/`) that contain only
`@AGENTS.md`: the bridge for Claude Code. Until you write the `AGENTS.md` next
to them, they import nothing.

## Steps

1. **Before.** In a fresh session, ask these three questions and note the answers:
   1. *"How do I verify that a change in this repo is done?"*
   2. *"In `packages/pricing`, are amounts floats in euros or integers in cents?"*
   3. *"A test fails and you think the test is wrong. What do you do?"*
2. Write a root `AGENTS.md` (max. ~25 lines): commands, definition of done,
   known failures, rules the linter does **not** enforce.
3. Write `packages/pricing/AGENTS.md` with one thing that is only true there.
4. Nothing else to set up: Copilot, Codex and Cursor read `AGENTS.md`
   directly, Claude Code reads it through the `CLAUDE.md` bridge in the same
   folder. Why the bridge: [`reference/claude-code/README.md`](./reference/claude-code/README.md).
5. **After.** Fresh session, same three questions. Compare.

## Done when

- Both files exist, are true, and fit on one screen together.
- At least one of the three answers changed for the better.

## Stretch

Ask the agent to find one rule in your `AGENTS.md` that the linter or the
type checker already enforces, then delete it.

## Behind?

`git stash -u; git checkout checkpoint/04-context`.

## In your own repo instead

Same before/after test with three questions your team gets wrong most often.
