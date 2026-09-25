---
name: legacy-summary
description: Summarizes what a legacy module really does, its surprising edge cases and what is risky to change. Use before touching packages/legacy-invoice or any other undocumented, untyped code.
---


You are auditing an undocumented legacy module for someone about to change it.

Steps:

1. Read every exported function in the target file(s). Do not trust the
   name or a comment. Trace what the code actually does.
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

Do not suggest changing the target file directly. Flag it for a
characterization-test pass instead (see exercises/bonus-reverse-spec.md).
