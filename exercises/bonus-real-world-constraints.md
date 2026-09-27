# Bonus: Real-world constraints

**Time box:** 20 min · **Proves:** handling flaky tests, broken baselines, and coverage theater

## Goal

Handle what a green checkmark hides: a test that fails at random, a test
that failed before you got here, and a suite that covers every line without
checking much.

## Starting state

`npm test` on a fresh clone. Run it. You should see:

- `apps/api/src/server.test.ts`, `Tickets API > BASELINE: reports health
  status as ok`: **fails every time.** This is an unrelated bug that was
  there before you cloned the repo (a broken baseline). The `BASELINE:`
  prefix marks it as "known, not this change's problem". The Ü5 `Stop` hook
  reads it, so changes to pricing or the API don't get blocked by this
  failure on every turn.
- `apps/api/src/server.test.ts`, `Tickets API > FLAKY: availability is
  ready shortly after the server starts`: **fails about 1 run in 3.**
  Run the whole suite 5-10 times if you don't see it fail once.

## Steps

1. **Broken baseline.** Do not fix `BASELINE: reports health status as
   ok`. Write one line documenting it for humans (in a `KNOWN_ISSUES.md`,
   a code comment or a ticket-shaped note, your choice): what fails, since
   when (as far as you can tell), and why you are not fixing it now. The
   tooling (the Ü5 `Stop` hook) reads the `BASELINE:` tag in the test name.
   Your note is the human-readable version of the same fact. You are
   practicing *recording and moving on* instead of fixing everything an
   agent notices.
2. **Flaky test.** Quarantine the `FLAKY` test properly: mark it
   `it.skip` (or your framework's equivalent) with a comment naming the
   real cause (an async cache warm-up race; read the comment in `server.ts`
   above `upstreamLatencyMs`) and a reference to a follow-up.
   Do not "fix" it with a longer wait in the test. That hides the race
   instead of removing it.
   The Ü5 `Stop` hook already skips `FLAKY:` tests so they cannot trap the
   agent in a loop. That is the tooling half of a quarantine. The `it.skip`
   plus a follow-up is the human half.
3. **Coverage theater.** Read `packages/pricing/src/discounts.test.ts`.
   It exercises every line and branch of `discounts.ts` (run `npx vitest
   run packages/pricing/src/discounts.test.ts --coverage
   --coverage.include='packages/pricing/src/discounts.ts'` to see 100%).
   Now mutate `discounts.ts` by hand: change the `quantity >
   MAX_PROMO_QUANTITY` comparison to `quantity >=`. Re-run the test. It
   still passes. Write down, in your own words, why 100% coverage didn't
   catch a real behavior change. Then revert your mutation.

## Done when

- You have a written record of the broken baseline (not a fix).
- The flaky test is `.skip`-quarantined with a reason, not deleted and not
  "fixed" by masking the timing.
- You've reproduced the coverage-theater mutation surviving, in your own
  terminal, and reverted it afterward.

## Stretch

Write one real test for `applyPromoCode` that WOULD catch the
`>` → `>=` mutation (hint: test the exact boundary quantity, not just
"small" and "large" orders).

## In your own repo instead

Find one flaky test in a CI history you have access to. Quarantine it with
a reason instead of re-running until it's green.
