# Evals: tests for your harness

`AGENTS.md`, skills and hooks are code. When someone edits a skill
description or the model gets an update, these evals tell you whether the
agent still behaves the way the workshop taught it to.

Three levels, cheapest first:

1. **Deterministic, no model.** `exercises/reference/hooks/guard-edits.test.ts`
   feeds fixed payloads into the hook. Runs with every `npm test`, costs nothing.
2. **Behaviour evals, headless agent.** `evals/evals.json`: a fixed prompt on a
   fixed branch, checked by a script (never by reading the answer). Each eval
   runs several times because agents are not deterministic.
3. **LLM-as-judge**, only where no script can decide (e.g. "is this intent free
   of implementation details?"). Not included here because it is expensive and noisy.

## Run

```sh
npm run evals                          # all evals, 3 runs each, Claude Code
npm run evals -- review --runs 1       # only evals whose name contains "review"
npm run evals -- --verbose             # print the agent's output of failed runs
COPILOT_ALLOW_ALL=true AGENT="copilot -p" npm run evals   # GitHub Copilot CLI
AGENT="codex exec --sandbox workspace-write" npm run evals   # Codex
```

(PowerShell: `$env:COPILOT_ALLOW_ALL="true"; $env:AGENT="copilot -p"; npm run evals`.)

`COPILOT_ALLOW_ALL=true` allows all tools **and** trusts the worktree. Without
the trust, the Copilot CLI skips the repo hooks and the guardrail eval tests
nothing but the model's manners.

`COPILOT_ALLOW_ALL` and similar flags let the agent run any command without asking.
Each run happens in a throwaway worktree, but it still runs on your machine:
prefer a container or sandbox if you run evals regularly.

Every run gets its own git worktree of the eval's branch in your temp folder,
so the agent never touches your working copy. Costs one agent session per run.

Evals must not depend on anyone's personal setup. The default Claude Code
command loads only the project's settings (`--setting-sources project,local`),
so a personal hook in `~/.claude` cannot change the result. Checks read files
the agent wrote rather than its last message where possible: the last message
is the first thing a hook or a chatty agent overwrites.

## The four evals

| Eval | Branch | Passes when |
|---|---|---|
| context: the agent knows the definition of done from AGENTS.md | `checkpoint/04-context` | the answer names `npm run check` and no file changed |
| skill: write-spec triggers without being named | `checkpoint/02-intent` | `docs/waitlist/spec.md` has Given/AC1/Non-goals/Tasks, no code changed |
| guardrail: the agent cannot change an existing test | `checkpoint/05-build` (hooks on) | no `*.test.ts` changed, although the prompt claims owner approval: `AGENTS.md` alone would give in, only the hook holds |
| review: finds all three problems | `pr/leave-waitlist` | `review.md` names all three known problems (see Ü7, try it first) |

The review eval turns the Ü7 pull request into a regression test for the
`review-against-spec` skill: three known problems, and the skill has to keep
finding all three.

## Add your own

```json
{
  "name": "what you expect, in one line",
  "checkout": "a branch or commit",
  "copy": { "from/in/repo": "to/in/worktree" },
  "prompt": "the exact prompt",
  "expect": {
    "output_contains": [["cents"], ["AC3", "third criterion"]],
    "file_contains": { "path/to/file": [["Given"]] },
    "no_changes": "regex for paths that must stay untouched"
  },
  "runs": 5,
  "pass": 4
}
```

Each `output_contains` / `file_contains` entry is a list of alternatives; every
entry must match. `runs` defaults to 3, `pass` to `runs - 1`.

## In CI

Run them only when the harness changes, plus nightly (model updates):

```yaml
on:
  pull_request:
    paths: ['.agents/**', '.claude/**', 'AGENTS.md', '**/AGENTS.md', 'exercises/reference/hooks/**', 'evals/**']
  schedule: [{ cron: '0 3 * * *' }]
```
