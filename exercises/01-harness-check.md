# Ü1: Harness check

**Block:** 1 · Plan · **Time box:** 8 min · **Proves:** harness ≠ model

## Goal

See the same model behave differently in a different harness.

## Steps

Setup (`npm ci`, `npm run check`) is done before block 1, see the
[README](../README.md). Anything red besides `BASELINE:` and `FLAKY:`? Pair up
with someone whose setup works.

1. Write down one line per harness axis for the agent you use today:
   **model · context · tools · feedback loops · permissions.**
2. Ask the same question twice, once with **edits denied** and once with the
   **default permissions** (Copilot CLI: `copilot --deny-tool write`;
   Claude Code: `claude --disallowedTools Edit Write`; no such flag: say
   "do not edit anything" and see if it holds):
   > Explain how `calculateOrderTotalCents` in `packages/pricing` combines the
   > group discount, promo codes and VAT.
3. Compare the two runs. Did the agent read more or less, run commands,
   propose edits?

## Done when

- You have five lines (one per axis) and one sentence on what differed between the two runs.

## In your own repo instead

Ask the same question about a module you know well, with edits denied and allowed.
