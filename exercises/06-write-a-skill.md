# Ü6: Write your own skill

**Block:** 3 · Build & Test · **Time box:** 15 min

> Ü5 took longer? Take this one home. It needs nothing from the room.

## Goal

Turn knowledge you just had to explain to the agent into a skill the whole
team gets for free.

## Steps

1. Look at one of the four workshop skills in `.agents/skills/`. Note the
   `description` in the frontmatter: it is the only part the agent sees
   until the skill is used.
2. Create `.agents/skills/add-api-endpoint/SKILL.md` describing **how an
   endpoint is added in `apps/api`**: route matching style, `sendJson`, error
   shape, validation at the boundary, where tests go, what "done" means.
   Keep it under 40 lines.
3. Run `npm run skills:sync`. It copies `.agents/skills/` to `.claude/skills/`, where Claude Code looks for skills.
4. Fresh session, **without naming the skill**: *"Add `GET /events/:id` that
   returns one event with its availability."* Did the skill trigger? If not,
   sharpen the `description` and leave the body.

## Done when

- The skill triggers from a plain request, and the endpoint follows the
  existing conventions, with a new test file for it (creating new test files is allowed; the hook only protects existing ones).

This is your first eval: a fixed prompt, and a check whether the agent
behaved as intended. [`evals/`](../evals/) automates that.

## UI instead of API

Prefer the frontend? Write `.agents/skills/add-web-component/SKILL.md` for
`web/` instead: where components live, signals and `httpResource`, Angular
Material, where the `*.spec.ts` goes, and that `npm run check --workspace web`
must pass. The official `angular-developer` skill is already installed; yours
only adds what is specific to this repo. Test prompt: *"Show the free seats
as a number next to the progress bar."*

## Stretch

Ask the agent to review your skill against the Agent Skills spec
(agentskills.io) and cut everything the agent would do anyway.

## In your own repo instead

Pick the instruction you type most often and turn it into a skill.
