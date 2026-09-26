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
web/                      optional Angular 22 + Material UI for the API
exercises/                the hands-on exercises (start here)
.agents/skills/           workshop skills + the official Angular skill (copied to .claude/skills/)
```

Everything is TypeScript. The API is the main track; `web/` is an optional
extra for everyone who wants to see a UI, not only HTTP requests.

See [`exercises/README.md`](./exercises/README.md) for the exercises.

## Before the workshop

Do this at home, not on the conference Wi-Fi. It takes 10 minutes.

1. Install Node.js 24+ and Git.
2. Install an agent that runs in the terminal. **Recommended: the GitHub
   Copilot CLI** (`npm install -g @github/copilot`, then `copilot` and `/login`).
   It supports everything the day uses (AGENTS.md, skills, MCP, hooks) the
   same way on every OS, which the IDE plugins do not all do yet (Visual Studio
   has no agent hooks). Claude Code works just as well
   (`npm install -g @anthropic-ai/claude-code`). Codex and Cursor work too; the
   exercises name their equivalents.
3. Clone this repo, run `npm ci`, then `npm run check`. One or two failing
   tests are expected (see below); anything else, open an issue. `npm ci` also
   installs the git hooks (Lefthook).
4. Start your agent in the repo root and ask it "What does this repo do?". If
   that works, you are ready.
5. Optional, for the web app's end-to-end tests: `npx playwright install chromium`.

On Windows: the Copilot CLI needs PowerShell 7 (`winget install
Microsoft.PowerShell`); Windows PowerShell 5.1 is not enough. Claude Code uses
Git Bash from Git for Windows if it is installed, otherwise PowerShell. The
commands in the exercises work in both.

Laptop not cooperating, or joining remotely? Open the repo in a GitHub
Codespace: `.devcontainer/` installs Node, both agents and the dependencies.

No working agent or no licence? Come anyway: you work in pairs, one agent
per pair.

## On the workshop day

1. `git pull`, then `npm ci`, to get the latest exercises.
2. Find a partner. You work in pairs, one agent, and swap the driver after every exercise.
3. Start at [`exercises/01-harness-check.md`](./exercises/01-harness-check.md).
4. Fell behind? `git stash -u; git checkout checkpoint/<name>` (list in `exercises/README.md`).

## This repo or your own

Every exercise works on this repo, and every card ends with "In your own repo
instead". Use your own repo if you have one you know well, but keep two things
in mind: the checkpoint branches only exist here, and Ü7 needs this repo's
prepared pull request.

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
- `npm run format` / `npm run format:check`: Prettier for code and config
  (Markdown is left alone).
- `npm run check`: typecheck, lint, format check, the web app's checks, then
  the tests.

## Rules the agent cannot talk its way around

Prompts and `AGENTS.md` are requests. These are enforced, for people and
agents alike, without anyone having to ask:

| Rule | Where | Runs |
|---|---|---|
| Strict TypeScript, strict Angular templates | `tsconfig.json`, `web/tsconfig.json` | typecheck, build |
| Lint rules with a reason each (signals, OnPush, no `any`, accessibility) | `eslint.config.js`, `web/eslint.config.js` | lint |
| One code format | `.prettierrc.json` | format check |
| Staged files are formatted and linted; types and lint pass before push | `lefthook.yml` | every commit and push |
| Existing tests and the rule configs are off limits for the agent; checks must pass before it stops | `exercises/reference/hooks/` | every agent turn, after Ü5 |
| Everything above, on Linux, Windows and macOS | `.github/workflows/ci.yml` | every push |

## The web app

`web/` is an Angular 22 app with Angular Material, Vitest, Playwright,
angular-eslint and Prettier. It lists the events and, from
`checkpoint/05-build` on, lets you join the waitlist of a sold-out event.

```sh
npm start --workspace apps/api   # API on http://localhost:3000
npm start --workspace web        # http://localhost:4200, /api is proxied to the API
```

For agents: the official `angular-developer` skill is installed (from
`angular/skills`, pinned in `skills-lock.json`), and `.mcp.json` /
`.vscode/mcp.json` register the Angular CLI MCP server for Copilot CLI, Claude
Code and VS Code. See [`web/README.md`](./web/README.md).

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
