# Ü6 — Write your own skill

**Block:** 3 · Build & Test · **Time box:** 15 min

## Goal

Turn knowledge you just had to explain to the agent into a skill the whole
team gets for free.

## Steps

1. Look at one of the four workshop skills in `.agents/skills/` — note the
   `description` in the frontmatter: it is the only part the agent sees
   until the skill is used.
2. Create `.agents/skills/add-api-endpoint/SKILL.md` describing **how an
   endpoint is added in `apps/api`**: route matching style, `sendJson`, error
   shape, validation at the boundary, where tests go, what "done" means.
   Keep it under 40 lines.
3. Claude Code only: link it — `ln -s ../../.agents/skills/add-api-endpoint .claude/skills/add-api-endpoint`.
4. Fresh session, **without naming the skill**: *"Add `GET /events` that
   lists all events with id and name."* Did the skill trigger? If not,
   sharpen the `description`, not the body.

## Done when

- The skill triggers from a plain request, and the endpoint follows the
  existing conventions.

## Stretch

Ask the agent to review your skill against the Agent Skills spec
(agentskills.io) and cut everything the agent would do anyway.

## In your own repo instead

Pick the instruction you type most often and turn it into a skill.
