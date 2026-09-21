---
name: red-green
description: Implements a spec test-first in two phases — first failing tests for every acceptance criterion (RED), then a human review stop, then minimal code until everything is green without touching the tests. Use when implementing a feature that has a spec.md, or when the user says "red-green", "test first" or "implement the spec".
---

# Red → green

Implement `docs/<feature>/spec.md` test-first. The tests are the verifier —
once a human has approved them, you are not allowed to change them.

## Phase 1 — RED

1. Read `spec.md` and the `AGENTS.md` files that apply. Read one existing
   test file next to the code you will change and copy its style.
2. Write one test per acceptance criterion. Put the criterion id in the test
   name (`AC1: …`) so a reviewer can map tests to the spec.
3. Run only the new tests. Every one must fail **for the right reason**
   (missing behaviour — not a typo, an import error or a wrong URL).
4. **Stop.** Show the test names and the failure output. Ask the user to
   review the tests against the spec and commit them. Do not implement yet.

## Phase 2 — GREEN

Only after the user approved the tests:

1. Take the tasks from `spec.md` in order. For each task write the smallest
   change that turns its tests green. Follow existing patterns in the code
   (helpers, error shapes, state handling) instead of inventing new ones.
2. After each task run `npm run check`. Fix what you broke before moving on.
   A failing test named `BASELINE:` is a known, unrelated failure — ignore it.
3. Tick the task in `spec.md`.
4. When all tasks are done, report: which criteria are covered by which
   tests, the final `npm run check` output, and anything you were unsure about.

## Rules

- **Never edit, delete, skip or weaken an existing test** — including the ones
  you wrote in phase 1. If you think a test is wrong, stop and say why.
- Never mark a task done without a green run you actually executed.
- No work beyond the spec. Non-goals stay non-goals.
