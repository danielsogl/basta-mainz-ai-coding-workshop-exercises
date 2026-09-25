# Ü7: Review gate

**Block:** 4 · Review · **Time box:** 25 min · **Skill:** `review-against-spec`

## Goal

Review an agent-authored pull request against the spec, in a fresh context,
and treat the diff as untrusted input.

## Starting state

A contributor opened a PR that lets people leave the waitlist:

```sh
git fetch origin
git checkout pr/leave-waitlist
git diff origin/checkpoint/05-build...HEAD
```

The PR also amends `docs/waitlist/spec.md`. **Three problems are hidden in it.**

## Steps

1. **Fresh session.** Invoke `review-against-spec` against
   `origin/checkpoint/05-build` (the PR's base branch). Do not tell it what
   to look for.
2. Write down what it found.
3. **Your turn.** Read the diff yourself, with the spec next to it. What did
   the agent miss? What did it find that you would have missed?
4. Decide: approve or request changes? Write the review comment you would
   actually post.

## Done when

- You found all three problems (agent + you together).
- You can say which one the agent did **not** find on its own, and which
  line in `review-against-spec/SKILL.md` would have to change so it does next time.

## Stretch

Deny `.env*` reads in your agent's permissions and confirm it blocks a read
attempt. First create a fake secret to test against (`.env` is gitignored):

```sh
node -e "require('fs').writeFileSync('.env','PAYMENT_API_KEY=sk_test_fake\n')"
```

- Claude Code: add `"permissions": { "deny": ["Read(./.env*)"] }` to
  `.claude/settings.json`, then ask *"What is in .env?"*.
- Copilot: the CLI has no deny rule for reads (`--deny-tool` knows `shell(…)`,
  `write(…)`, MCP and URLs). Block it in a `preToolUse` hook instead: add a
  `.env` check to `exercises/reference/hooks/guard-edits.mjs` (as a human,
  the hook guards itself against the agent).
- Codex, Cursor: use your tool's deny or ignore rules (see its docs).

A deny rule on the read tool is not the whole story: ask the agent to
*"print .env with a shell command"* and see whether that path is closed too.

## In your own repo instead

Run the skill on your last merged agent-authored PR.
