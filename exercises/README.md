# Exercises

Hands-on exercises for the one-day workshop **The AI-native SDLC: from
intent to reviewed PR** (BASTA! Mainz 2026). They use "Tickets", a small
conference-ticketing monorepo (see the root `README.md`).

You build one feature all day: a **waitlist for sold-out events**, from a
vague idea to a reviewed pull request. The exercises work with any coding
agent (GitHub Copilot, Claude Code, Codex, Cursor, …). Ü stands for
*Übung* (exercise).

## Exercises

| # | Block · stage | Time | Skill | Result | Checkpoint afterwards |
|---|---|---|---|---|---|
| [Ü1](./01-harness-check.md) | 1 · Plan | 10 min | – | setup works, harness mapped | – |
| [Ü2](./02-capture-intent.md) | 1 · Plan | 25 min | `capture-intent` | `docs/waitlist/intent.md` | `checkpoint/02-intent` |
| [Ü3](./03-write-spec.md) | 2 · Design | 25 min | `write-spec` | `docs/waitlist/spec.md` | `checkpoint/03-spec` |
| [Ü4](./04-context-file.md) | 2 · Design | 20 min | – | `AGENTS.md`, `packages/pricing/AGENTS.md` | `checkpoint/04-context` |
| [Ü5](./05-red-green.md) | 3 · Build & Test | 40 min | `red-green` | waitlist, tests, hooks | `checkpoint/05-red`, `checkpoint/05-build` |
| [Ü6](./06-write-a-skill.md) | 3 · Build & Test | 15 min | your own | `add-api-endpoint` skill | – |
| [Ü7](./07-review-gate.md) | 4 · Review | 25 min | `review-against-spec` | review of `pr/leave-waitlist` | – |
| [Ü8](./08-30-day-plan.md) | 4 · Maintain | 10 min | – | your 30-day plan | – |

Bonus, for fast pairs or afterwards:
[`bonus-real-world-constraints.md`](./bonus-real-world-constraints.md) (flaky
tests, broken baselines, coverage theatre) and
[`bonus-reverse-spec.md`](./bonus-reverse-spec.md) (reverse-engineer a spec
from legacy code).

## Fell behind?

Each exercise builds on the previous one. Stuck? Don't debug for 20 minutes.
Check out the previous exercise's checkpoint and carry on:

```sh
git stash -u         # parks your own work, including new files
git checkout checkpoint/03-spec
```

## The workshop skills

Four skills in [`.agents/skills/`](../.agents/skills/) (copied to
`.claude/skills/` for Claude Code), one per SDLC stage. They use the open
Agent Skills format (`SKILL.md`), and each one takes two minutes to read:

| Skill | Stage | What it does |
|---|---|---|
| `capture-intent` | Plan | Interviews you one question at a time, writes `intent.md`. No code. |
| `write-spec` | Design | `intent.md` → `spec.md` with Given-When-Then criteria, non-goals, tasks. Stops for review. |
| `red-green` | Build & Test | Failing tests first, stop for review, then code until green. Never edits tests. |
| `review-against-spec` | Review | Fresh-context review of a diff against the spec and a security checklist. Findings only. |

Take them to your own repo:

```sh
npx skills add danielsogl/basta-mainz-ai-coding-workshop-exercises
```

If your tool does not load skills, paste the `SKILL.md` as your first message.

`.claude/skills/` is a copy of `.agents/skills/` (Claude Code only looks in
`.claude/`). After changing or adding a skill, run `npm run skills:sync`.

## Reference material

- [`reference/hooks/`](./reference/hooks/): two Node hook scripts that run
  on every OS. One blocks changes to existing tests, the other verifies before
  the agent stops. Used in Ü5.
- [`reference/claude-code/`](./reference/claude-code/): hook config for
  Claude Code, an example skill and sub-agent.
- [`reference/copilot/`](./reference/copilot/): hook config for Copilot
  (VS Code agent mode, CLI, cloud agent), instructions, custom agent.
- [`templates/`](./templates/): `spec.md` and `30-day-plan.md`.
- [`../evals/`](../evals/): evals for the harness. Fixed prompts, checked by a
  script, several runs each. `npm run evals`. Take-home, not an exercise.

No hook is on by default. You switch them on yourself in Ü5, so you know what
you are turning on and why.
