<!--
  Example repository custom instructions for GitHub Copilot.
  Copy to .github/copilot-instructions.md at the repo root.
  Source/format checked 2026-09: docs.github.com/en/copilot/how-tos/configure-custom-instructions.
-->

# Tickets monorepo: Copilot instructions

- npm workspaces: `packages/*` and `apps/*`. Run `npm run check` (typecheck
  + lint + test) before considering a change done.
- `packages/legacy-invoice` is intentionally untyped and undocumented. Do
  not "clean it up" as a side effect of an unrelated change. See
  `exercises/bonus-reverse-spec.md`.
- Never edit a `*.test.ts` file to make it pass. If a test looks wrong, say
  so and stop.
- This repo ships with one known-broken baseline test and one flaky test
  by design (see root `README.md`). Do not "fix" either unless the task is
  specifically about them.

For path-scoped instructions (e.g. rules that only apply under
`packages/pricing/`), add `.github/instructions/<name>.instructions.md`
files with an `applyTo: <glob>` frontmatter field instead of putting
everything in this file.
