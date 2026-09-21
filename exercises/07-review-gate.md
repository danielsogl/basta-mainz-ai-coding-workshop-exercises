# Ü7 — Review gate

**Block:** 4 · Review & Deploy · **Time box:** 25 min · **Skill:** `review-against-spec`

## Goal

Review an agent-authored pull request the way it needs to be reviewed:
against the spec, in a fresh context, treating the diff as untrusted input.

## Starting state

A contributor opened a PR that lets people leave the waitlist:

```sh
git fetch origin
git checkout pr/leave-waitlist
git diff checkpoint/05-build...pr/leave-waitlist
```

The PR also amends `docs/waitlist/spec.md`. **Three problems are hidden in it.**

## Steps

1. **Fresh session.** Invoke `review-against-spec` against
   `checkpoint/05-build`. Do not tell it what to look for.
2. Write down what it found.
3. **Your turn.** Read the diff yourself, with the spec next to it. What did
   the agent miss? What did it find that you would have missed?
4. Decide: approve or request changes? Write the review comment you would
   actually post.

## Done when

- You found all three problems (agent + you together).
- You can say which one the agent did **not** find on its own — and which
  line in `review-against-spec/SKILL.md` would have to change so it does next time.

## Stretch

Deny `.env*` reads in your agent's permissions (Claude Code:
`"deny": ["Read(./.env*)"]` in `.claude/settings.json`; check your tool's
docs) and confirm it blocks a read attempt.

## In your own repo instead

Run the skill on your last merged agent-authored PR.
