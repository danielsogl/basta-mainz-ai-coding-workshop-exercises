---
name: write-spec
description: Turns an intent.md into a reviewable spec.md with behaviour, Given-When-Then acceptance criteria, non-goals and commit-sized tasks, then stops for human review. Use after capture-intent, when the user says "write the spec", "spec this out" or asks to plan a feature that already has an intent.
---

# Write spec

Turn `docs/<feature>/intent.md` into `docs/<feature>/spec.md`. The spec is the
contract that tests are written from and the review is checked against. No
code in this step.

## Steps

1. Read `intent.md`. If it is missing, stop and suggest the `capture-intent` skill.
2. Read the code the feature touches, so the spec uses the real names
   (routes, types, packages) and follows existing conventions.
3. Write `spec.md` with the template below.
   - Every acceptance criterion must be testable as written — one
     observable result per criterion, concrete values, no "should work well".
   - Cover the happy path, every error path you can name, and at least one
     edge case.
   - Copy the non-goals from the intent and add any you discovered.
   - Tasks are commit-sized and ordered. Each task names the criteria it satisfies.
4. List every assumption you had to make under "Assumptions".
5. **Stop.** Show the spec and ask the user to review it. Do not start
   implementing, even if asked to "just continue" — suggest a fresh session
   with the `red-green` skill instead.

## Template

```markdown
# Spec: <feature>

Source: docs/<feature>/intent.md

## Behaviour
<plain-language description, normal case first, then edge cases>

## Acceptance criteria
- AC1 — Given <state>, when <action>, then <observable result>.
- AC2 — …

## Non-goals
- …

## Assumptions
- …

## Tasks
- [ ] T1 — <small step> (AC1, AC2)
- [ ] T2 — …
```

## Rules

- Never invent requirements the intent does not support. If something is
  needed but not in the intent, add it under "Assumptions" and ask.
- Prefer fewer, sharper criteria over many vague ones.
