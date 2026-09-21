# Ü4 — A context file that pays

**Block:** 2 · Design · **Time box:** 20 min · **Checkpoint:** `checkpoint/04-context`

## Goal

Write the smallest `AGENTS.md` that measurably changes what your agent does —
and prove it with a before/after test.

## Starting state

This repo ships **no** `AGENTS.md`, `CLAUDE.md` or `copilot-instructions.md`.

## Steps

1. **Before.** In a fresh session, ask these three questions and note the answers:
   1. *"How do I verify that a change in this repo is done?"*
   2. *"In `packages/pricing`, are amounts floats in euros or integers in cents?"*
   3. *"A test fails and you think the test is wrong. What do you do?"*
2. Write a root `AGENTS.md` (max. ~25 lines): commands, definition of done,
   known failures, rules that are **not** enforced by the linter.
3. Write `packages/pricing/AGENTS.md` with one thing that is only true there.
4. Tool bridge, if needed:
   - Claude Code: `CLAUDE.md` in the root containing `@AGENTS.md`.
   - Copilot, Codex, Cursor read `AGENTS.md` directly.
5. **After.** Fresh session, same three questions. Compare.

## Done when

- Both files exist, are true, and fit on one screen together.
- At least one of the three answers changed for the better.

## Stretch

Ask the agent to find one rule in your `AGENTS.md` that the linter or the
type checker already enforces — and delete it.

## Behind?

`git checkout checkpoint/04-context`.

## In your own repo instead

Same before/after test with three questions your team gets wrong most often.
