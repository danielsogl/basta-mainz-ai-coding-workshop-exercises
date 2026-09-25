# Ü2: Intent interview

**Block:** 1 · Plan · **Time box:** 25 min · **Skill:** `capture-intent` · **Checkpoint:** `checkpoint/02-intent`

## Goal

Turn a one-line idea into a reviewed `docs/waitlist/intent.md`. Let the agent
interview you instead of prompting it to build.

## Starting state

`GET /events/:id/availability` in `apps/api` reports `soldOut: true` for
`evt-1`, and then nothing happens. The idea from the product owner:

> "When an event is sold out, people should be able to get on a waitlist."

## Steps

1. Start a fresh agent session in the repo root and invoke the skill
   (Claude Code: `/capture-intent`; Copilot, Codex, Cursor: ask for it by name,
   e.g. *"Use the capture-intent skill for a waitlist for sold-out events"*).
   No skill support in your tool? Paste `.agents/skills/capture-intent/SKILL.md` as your first message.
2. Answer the agent's questions. One of you answers as the product owner,
   the other watches: does the agent ask about **why** and **non-goals**, or
   only about the solution?
3. Read the resulting `docs/waitlist/intent.md` like a pull request: is there
   any implementation detail in it (routes, classes, tables)? Remove it.
4. Commit it: `git add docs`, then `git commit -m "docs(waitlist): capture intent"`.

## Done when

- `docs/waitlist/intent.md` has What, Why, Constraints and Non-goals.
- It contains no implementation details.
- Your partner could explain the feature from the file alone.

## Stretch

Run the interview a second time with a different partner answering. Diff the
two intents. Each difference is an assumption someone would have made silently.

## Behind?

`git stash -u; git checkout checkpoint/02-intent` has a finished intent.

## In your own repo instead

Pick a small feature from your backlog and run the same interview.
