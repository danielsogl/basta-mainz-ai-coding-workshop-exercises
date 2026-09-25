# Bonus: Reverse spec from legacy code

**Time box:** 20 min · **Proves:** brownfield reverse spec

## Goal

`packages/legacy-invoice` has no tests and no docs, but real (and slightly
surprising) behavior. Recover a spec from the code before anyone changes
it, and pin the current behavior down with characterization tests.

## Starting state

`packages/legacy-invoice/src/invoice.ts`: loosely typed, no `SPEC.md`, no
tests. There is no answer key, so you have to do the work yourself.

## Steps

1. Have your agent read `invoice.ts` fully and write
   `packages/legacy-invoice/SPEC.md`: what `generateInvoice` and
   `applyCreditNote` do, their inputs/outputs, and every branch (the
   discount condition, the rounding, the credit-note floor).
2. Ask it to list anything "surprising": behavior a reasonable reader
   would not guess from the function names. The file has at least three.
   Do not accept "looks fine" as an answer; ask it to
   trace a concrete example by hand for each function.
3. Turn the surprising behaviors into characterization tests:
   `packages/legacy-invoice/src/invoice.test.ts`, asserting the *current*
   (not the "correct") output for each case. These tests exist to detect
   future changes, not to declare the current behavior right.
4. Pick the surprising behavior you find most convincing and verify it
   yourself, by hand or with a one-off script. Don't trust the agent's
   claim.

## Done when

- `SPEC.md` exists and describes real behavior, not aspirational behavior.
- `invoice.test.ts` exists, passes, and each test name states the
  surprising behavior it pins down.
- You can explain, in your own words, one surprising behavior and why it
  happens.

## Stretch

Find a fourth surprising behavior the exercise didn't tip you off about
(hint: what happens with an empty `items` array, or a `discountPct` over
1?).

## In your own repo instead

Pick the oldest, least-documented file you're afraid to touch. Same steps:
reverse spec, list surprises, characterize, verify one by hand.
