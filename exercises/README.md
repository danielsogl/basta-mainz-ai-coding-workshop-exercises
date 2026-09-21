# Exercises

Hands-on exercises for the one-day workshop **The AI-native SDLC — from
intent to merged PR** (BASTA! Mainz 2026), built around a small
conference-ticketing monorepo ("Tickets" — see the root `README.md`).

One feature runs through the whole day: a **waitlist for sold-out events**,
from a vague idea to a reviewed pull request. Every exercise works with any
coding agent (Claude Code, GitHub Copilot, Codex, Cursor, …).

## Exercises

| # | Block · stage | Time | Skill | Result | Checkpoint afterwards |
|---|---|---|---|---|---|
| [Ü1](./01-harness-check.md) | 1 · Plan | 10 min | – | setup works, harness mapped | – |
| [Ü2](./02-capture-intent.md) | 1 · Plan | 25 min | `capture-intent` | `docs/waitlist/intent.md` | `checkpoint/02-intent` |
| [Ü3](./03-write-spec.md) | 2 · Design | 25 min | `write-spec` | `docs/waitlist/spec.md` | `checkpoint/03-spec` |
| [Ü4](./04-context-file.md) | 2 · Design | 20 min | – | `AGENTS.md` (+ `CLAUDE.md`) | `checkpoint/04-context` |
| [Ü5](./05-red-green.md) | 3 · Build & Test | 40 min | `red-green` | waitlist, tests, hooks | `checkpoint/05-build` |
| [Ü6](./06-write-a-skill.md) | 3 · Build & Test | 15 min | your own | `add-api-endpoint` skill | – |
| [Ü7](./07-review-gate.md) | 4 · Review & Deploy | 25 min | `review-against-spec` | review of `pr/leave-waitlist` | – |
| [Ü8](./08-30-day-plan.md) | 4 · Maintain | 10 min | – | your 30-day plan | – |

Bonus, for fast pairs or afterwards:
[`bonus-real-world-constraints.md`](./bonus-real-world-constraints.md) (flaky
tests, broken baselines, coverage theatre) and
[`bonus-reverse-spec.md`](./bonus-reverse-spec.md) (reverse-engineer a spec
from legacy code).

## Fell behind?

Every exercise builds on the previous one. If you are stuck, do not debug for
20 minutes — check out the checkpoint of the previous exercise and carry on:

```sh
git stash            # keep your own work, if you want it back later
git checkout checkpoint/03-spec
```

## The workshop skills

Four skills in [`.agents/skills/`](../.agents/skills/) (linked into
`.claude/skills/` for Claude Code), one per SDLC stage. They follow the
open Agent Skills format (`SKILL.md`) and are deliberately short, so you can
read each one in two minutes:

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

If your tool does not load skills, paste the `SKILL.md` as your first message — it works the same.

> **Windows:** `.claude/skills/*` are symlinks. If they show up as plain text
> files, copy the folders from `.agents/skills/` into `.claude/skills/` instead.

## Reference material

- [`reference/claude-code/`](./reference/claude-code/) — `settings.json` with
  a `Stop` hook (typecheck + affected tests) and a `PreToolUse` hook that
  denies edits to test files, an example skill and sub-agent. Used in Ü5.
- [`reference/copilot/`](./reference/copilot/) — the Copilot equivalents
  (hooks for Copilot CLI and the cloud agent, instructions, custom agent).
- [`templates/`](./templates/) — `spec.md` and `30-day-plan.md`.

None of the hooks are switched on by default — you do that yourself in Ü5,
which is the point: you should know what you are turning on and why.
