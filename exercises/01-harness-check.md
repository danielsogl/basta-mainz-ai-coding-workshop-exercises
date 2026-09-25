# Ü1: Harness check

**Block:** 1 · Plan · **Time box:** 10 min · **Proves:** harness ≠ model

## Goal

Get your setup running and see the same model behave differently in a
different harness.

## Steps

1. Setup check:
   ```sh
   npm ci
   npm run check
   ```
   Expected: `BASELINE: reports health status as ok` fails every time, and
   `FLAKY: availability is ready …` fails now and then. Both are on purpose
   (see [`bonus-real-world-constraints.md`](./bonus-real-world-constraints.md)).
   Anything else red? Ask your neighbour or pair up with someone whose setup works.
2. Write down one line per harness axis for the agent you use today:
   **model · context · tools · feedback loops · permissions.**
3. Ask the same question twice, once in **plan / read-only mode** and once in
   **normal (act) mode**:
   > Explain how `calculateOrderTotalCents` in `packages/pricing` combines the
   > group discount, promo codes and VAT.
4. Compare the two runs. Did the agent read more or less, run commands,
   propose edits?

## Done when

- `npm run check` shows only the two known failures.
- You have five lines (one per axis) and one sentence on what differed between the two modes.

## In your own repo instead

Ask the same question about a module you know well, in both modes.
