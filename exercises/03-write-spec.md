# Ü3 — Intent → Spec → Plan

**Block:** 2 · Design · **Time box:** 25 min · **Skill:** `write-spec` · **Checkpoint:** `checkpoint/03-spec`

## Goal

Turn the intent into a spec an agent cannot misread, and review the agent's
plan before a single line of code is written.

## Starting state

`docs/waitlist/intent.md` from Ü2 (or `git checkout checkpoint/02-intent`).

## Steps

1. Invoke the `write-spec` skill on `docs/waitlist/intent.md`.
2. Review `docs/waitlist/spec.md`:
   - Could every acceptance criterion be turned into a test **as written**?
   - Happy path, error paths **and** at least one edge case covered?
   - Are the non-goals from the intent still there?
   - Are the tasks commit-sized?
3. Start a **fresh session in plan mode** (Claude Code: Shift+Tab to plan
   mode; Copilot: plan / ask mode; Codex: `/plan` or read-only; Cursor: plan
   mode). Ask it to restate the spec in its own words and propose an
   implementation plan. **No code.**
4. Anything it got wrong is a spec problem: fix the spec, not the prompt.
   Repeat step 3 once.
5. Commit the spec.

## Done when

- `docs/waitlist/spec.md` has ≥ 4 Given-When-Then criteria, non-goals and tasks.
- A fresh session restates it without you explaining anything.
- You rejected or changed at least one thing in the plan — or can say why it needed no change.

## Stretch

Write one criterion as a property ("for any sequence of joins, positions are
1…n without gaps") instead of an example.

## Behind?

`git checkout checkpoint/03-spec`.

## In your own repo instead

Take the intent from your own feature and run the same steps.
