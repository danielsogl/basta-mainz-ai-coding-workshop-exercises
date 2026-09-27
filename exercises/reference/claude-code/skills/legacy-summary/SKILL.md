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
3. Write a short characterization script that calls the exported functions
   with a handful of representative and edge-case inputs and prints the
   results. Run it.
4. Report:
   - What the module does, in plain language.
   - A list of "surprising" behaviors: anything a reasonable reader would
     not guess from the function names alone (rounding, silent clamping,
     inconsistent handling of edge cases, etc.), each with the input that
     demonstrates it.
   - A one-line risk rating per exported function: safe to change / change
     with a characterization test first / do not change without a domain
     expert.

Do not modify the target file. This skill only investigates. See
exercises/bonus-reverse-spec.md for turning the findings into characterization tests.
