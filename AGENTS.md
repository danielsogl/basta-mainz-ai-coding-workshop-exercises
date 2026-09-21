# Tickets — agent instructions

Conference-ticketing monorepo: `packages/pricing` (prices, discounts, VAT),
`packages/legacy-invoice` (old, untested — do not change without
characterization tests first), `apps/api` (small HTTP API over both),
`web/` (optional Angular UI for the API, see `web/AGENTS.md`).

## Commands
- `npm run check` — typecheck, lint, format check, web checks, tests. A change is done when this is green.
- `npm run test:affected` — only the tests touched by the current change.
- `npm run format` — Prettier. The pre-commit hook rejects unformatted files; format, don't bypass it.
- Node 24 runs the API's TypeScript directly. There is no build step for `apps/` and `packages/` — do not add one.

## Known failures
- `BASELINE: reports health status as ok` always fails. Known, unrelated — do not fix it as part of other work.
- `FLAKY: availability is ready …` fails about 1 run in 3. Known — do not "fix" it with longer waits.

## Rules
- Never edit, delete or skip existing tests. If a test looks wrong, stop and say why.
- Specs live in `docs/<feature>/spec.md`. Follow them; non-goals stay out.
- `apps/api`: keep state in memory, answer through `sendJson`, errors as `{ "error": "..." }`.
- No new dependencies without asking.
- Never bypass the git hooks (`--no-verify`) or switch off a lint rule to get green. Fix the code or ask.
