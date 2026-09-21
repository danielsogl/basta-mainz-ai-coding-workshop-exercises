---
name: legacy-summary
description: Summarize a legacy module's real (not documented) behavior — what it does, its surprising edge cases, and what's risky to change. Use before touching packages/legacy-invoice or any other undocumented, untyped code.
---

<!--
  Copilot equivalent of ../../claude-code/skills/legacy-summary/SKILL.md,
  using the shared Agent Skills open standard (agentskills.io) format.
  As of 2026-09, GitHub has GA'd Agent Skills support specifically for
  Copilot code review (github.blog/changelog/2026-07-29), reading skills
  from .github/skills/<name>/SKILL.md. It is not (yet, as of this writing)
  documented as available to Copilot's interactive chat/agent modes the
  way Claude Code skills are — verify against current docs before relying
  on this outside of code review.
-->

You are auditing an undocumented legacy module for someone about to change it.

Steps:

1. Read every exported function in the target file(s). Do not assume the
   name or a comment describes the real behavior — trace what the code
   actually does.
2. For every branch and edge case (empty input, negative numbers, missing
   fields, boundary values), work out what happens by hand.
3. Report:
   - What the module does, in plain language.
   - A list of "surprising" behaviors: anything a reasonable reader would
     not guess from the function names alone, each with the input that
     demonstrates it.
   - A one-line risk rating per exported function: safe to change / change
     with a characterization test first / do not change without a domain
     expert.

Do not suggest changing the target file directly — flag it for a
characterization-test pass instead (see exercises/bonus-reverse-spec.md).
