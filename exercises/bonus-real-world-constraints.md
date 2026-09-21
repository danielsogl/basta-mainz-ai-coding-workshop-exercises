# Bonus — Real-world constraints

**Time box:** 20 min · **Proves:** handling flaky tests, broken baselines, and coverage theater

## Goal

Practice the three things a green checkmark doesn't tell you: a test that
sometimes fails for no code reason, a test that's been failing since
before you got here, and a test suite that hits every line without
checking anything meaningful.

## Starting state

`npm test` on a fresh clone. Run it. You should see:

- `apps/api/src/server.test.ts`, `Tickets API > BASELINE: reports health
  status as ok` — **fails every time.** This is a pre-existing, unrelated
  bug (a broken baseline). It was here before you cloned the repo. The
  `BASELINE:` prefix is already the recorded marker for "known, not this
  change's problem" — the `Stop` hook from Ü5 reads it so that changing
  pricing or the API doesn't get blocked by this
  unrelated failure every single turn.
- `apps/api/src/server.test.ts`, `Tickets API > FLAKY: availability is
  ready shortly after the server starts` — **fails roughly 1 run in 4.**
  Run the whole suite 5-10 times if you don't see it fail once.

## Steps

1. **Broken baseline.** Do not fix `BASELINE: reports health status as
   ok`. Instead, write one line documenting it for humans (in a
   `KNOWN_ISSUES.md`, a code comment, or a ticket-shaped note — your
   choice) that states: what fails, since when (as far as you can tell),
   and why you are choosing not to fix it right now. The `BASELINE:` tag
   in the test name is what the tooling (the Ü5 `Stop` hook) reads —
   your note is the human-readable version of the same fact. The skill
   being practiced is *recording and moving on*, not fixing everything an
   agent notices.
2. **Flaky test.** Quarantine the `FLAKY` test properly: mark it
   `it.skip` (or your framework's equivalent) with a comment naming the
   real cause (an async cache warm-up race — read the comment already in
   `server.ts` above `upstreamLatencyMs`) and a reference to a follow-up.
   Do not "fix" it by adding a longer wait in the test — that hides the
   race instead of removing it, and the exercise wants you to recognize
   that.
3. **Coverage theater.** Read `packages/pricing/src/discounts.test.ts`.
   It exercises every line and branch of `discounts.ts` (run `npx vitest
   run packages/pricing/src/discounts.test.ts --coverage
   --coverage.include='packages/pricing/src/discounts.ts'` to see 100%).
   Now mutate `discounts.ts` by hand: change the `quantity >
   MAX_PROMO_QUANTITY` comparison to `quantity >=`. Re-run the test. It
   still passes. Write down, in your own words, why 100% coverage didn't
   catch a real behavior change — then revert your mutation.

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
