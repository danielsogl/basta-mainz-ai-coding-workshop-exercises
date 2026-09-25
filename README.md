# Tickets: BASTA! Mainz AI-native SDLC workshop exercises

Starter repository for the hands-on exercises in the workshop "The AI-native
SDLC" at BASTA! Mainz (28 September 2026). "Tickets"
is a small conference-ticketing monorepo with real code, real tests and a few
intentional rough edges you'll use as material during the workshop. It works
with Claude Code, GitHub Copilot or any other harness.

## What's in here

```
packages/pricing/         ticket price, discount codes, group rates, VAT (well tested)
packages/legacy-invoice/  older, untyped, undocumented, no tests on purpose
apps/api/                 a small HTTP API over both packages
exercises/                the hands-on exercises (start here)
```

See [`exercises/README.md`](./exercises/README.md) for the exercises.

## Before the workshop

Do this at home, not on the conference Wi-Fi. It takes 10 minutes.

1. Install Node.js 24+ and Git.
2. Clone this repo, run `npm ci`, then `npm run check`. One or two failing
   tests are expected (see below); anything else, open an issue.
3. Start your agent (Copilot, Claude Code, Codex, Cursor, …) in the repo
   root and ask it "What does this repo do?". If that works, you are ready.

On Windows: the Copilot CLI needs PowerShell 7 (`winget install
Microsoft.PowerShell`); Windows PowerShell 5.1 is not enough. Claude Code uses
Git Bash from Git for Windows if it is installed, otherwise PowerShell. The
commands in the exercises work in both.

No working agent or no licence? Come anyway: you work in pairs, one agent
per pair.

## On the workshop day

1. `git pull`, then `npm ci`, to get the latest exercises.
2. Find a partner. You work in pairs, one agent, and swap the driver after every exercise.
3. Start at [`exercises/01-harness-check.md`](./exercises/01-harness-check.md).
4. Fell behind? `git stash -u; git checkout checkpoint/<name>` (list in `exercises/README.md`).

## Why TypeScript at a .NET conference?

No SDK to install and no build step: Node runs the TypeScript directly, on
every OS. Everything you practise (intent, spec, context files, hooks, skills,
evals, review) is language-neutral. Block 3 has a slide that maps the hooks and
`AGENTS.md` commands to `dotnet build`, `dotnet test` and Azure DevOps.

## Setup

Requires Node.js 24+ and Git. Works the same on macOS, Linux and Windows,
because the hooks are Node scripts.

```sh
npm ci
npm run check   # typecheck + lint + test
```

No build step: Node 24 runs the TypeScript directly, so `npm run check` and
`apps/api`'s `npm start` need no compilation.

## Expected test output on `main`

One or two failures on a clean clone are intentional:

- One test always fails: `apps/api/src/server.test.ts` >
  `Tickets API > BASELINE: reports health status as ok`. It is a
  deterministic broken baseline, unrelated to any exercise. The `BASELINE:`
  prefix is the only place this is recorded. The example `Stop` hook in
  `exercises/reference/hooks/` reads it so it doesn't block every turn on this
  known failure (see that folder's README). The bonus exercise
  `exercises/bonus-real-world-constraints.md` has you record it, not fix it.
- One test fails about 1 run in 3: `apps/api/src/server.test.ts` >
  `Tickets API > FLAKY: availability is ready shortly after the server
  starts`. It races a simulated async cache warm-up. If it passes, run
  `npm test` a few more times. The same bonus exercise has you quarantine it
  instead of chasing the flake.

`npm run typecheck`, `npm run lint` and all other tests are green on a clean
clone. Any other failure is a real regression.

Also look at `packages/pricing/src/discounts.test.ts`: it passes with 100%
line coverage of `discounts.ts` and still misses a real bug (see the bonus
exercise). Coverage percentage says nothing about test quality.

## Scripts

- `npm run typecheck`: `tsc --noEmit` across the whole workspace.
- `npm run lint`: ESLint (flat config).
- `npm test`: the full Vitest suite.
- `npm run test:affected`: `vitest run --changed`, only the tests touched by
  your current (uncommitted or last-commit) change. Used by the example
  `Stop` hook in `exercises/reference/hooks/`.
- `npm run check`: all three, in order.

## Try the API from your editor

`apps/api/requests.http` holds ready-made requests. Start the API with
`npm start --workspace apps/api` (port 3000), then click "Send Request" above a
request. Visual Studio, Rider and IntelliJ run `.http` files as they are; VS
Code needs the "REST Client" extension (`humao.rest-client`). The checkpoint
branches add the waitlist requests as the feature grows.

## Slides

The slides are on [speakerdeck.com/danielsogl](https://speakerdeck.com/danielsogl)
after the workshop.

## Bring this to your team

One day shows the method. Getting it into a team takes context files, skills,
hooks and review gates built on your own codebase. I run this workshop
in-house on your code and support your team through the rollout.

Get in touch: [daniel.sogl@shi-gmbh.com](mailto:daniel.sogl@shi-gmbh.com) ·
[LinkedIn](https://linkedin.com/in/daniel-sogl)
