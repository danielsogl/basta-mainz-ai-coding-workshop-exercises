---
name: capture-intent
description: Turns a vague feature idea into a short, version-controlled intent.md by interviewing the user one question at a time. Use at the very start of a feature, before any spec, plan or code exists, or when the user says "capture intent", "interview me" or "what do we actually want here".
---

# Capture intent

Your job is to find out what the user actually wants and why — not to design
or build anything. No code, no file layout, no API shapes.

## Steps

1. Read the code only as far as you need to ask good questions (for example:
   what exists today next to the feature). Do not propose changes.
2. Interview the user. Ask **one question per message** and wait for the
   answer. Offer your best-guess answer with each question so the user can
   just say "yes". Cover, in this order:
   - **What** — the outcome, from the user's point of view
   - **Why** — who has the problem, and what happens today without it
   - **Constraints** — things that must stay true (existing behaviour,
     data, performance, security, deadlines)
   - **Non-goals** — what we are explicitly not building now
3. Stop asking once you could explain the feature to a new colleague without
   guessing. Usually 4–8 questions. Never more than 10.
4. Write `docs/<feature>/intent.md` using the template below. Keep it under
   40 lines. Plain language, no implementation details.
5. Show the file and ask: "Anything wrong or missing?" Apply corrections.

## Template

```markdown
# Intent: <feature>

## What
<2–4 sentences: the outcome, as the user would describe it>

## Why
<who has the problem, what it costs today>

## Constraints
- <must stay true>

## Non-goals
- <explicitly out of scope for now>

## Open questions
- <anything the user could not answer yet>
```

## Rules

- Do not write a spec, tasks, tests or code. That is the `write-spec` skill's job.
- If the user answers with a solution ("add an endpoint"), ask what problem it solves.
- Record disagreements and unknowns under "Open questions" instead of deciding them yourself.
