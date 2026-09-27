# Claude Code reference material

Nothing here is on by default. You switch it on yourself in Ü5.

- `settings.json`: hook config. The matcher includes `PowerShell`, the shell
  tool Claude Code uses on Windows without Git Bash. The Copilot CLI reads this
  file too, which is why it keeps plain relative paths. Copy to `.claude/settings.json` (see
  [`../hooks/README.md`](../hooks/README.md) for the command and what the two
  scripts do). For Copilot in VS Code use `../copilot/hooks.json`: VS Code
  ignores this file unless `chat.useClaudeHooks` is on.
- `skills/legacy-summary/`: an example project skill. A repeated instruction
  ("read this legacy module and tell me what it really does, don't touch it")
  turned into a reusable, named skill. Compare Ü6.
- `agents/legacy-researcher.md`: the same task as a sub-agent
  (`.claude/agents/`). It runs in its own context window, and only its final
  summary comes back to your session. A skill runs inline in your context.

Instruction files: the repo ships a one-line `CLAUDE.md` containing
`@AGENTS.md` in the root and in `packages/pricing/`. Claude Code reads
`AGENTS.md` through that import in every version and on every provider.

Why not rely on Claude Code reading `AGENTS.md` directly (since 2.1.277)?
It does so only when no `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md`
exists in the working directory or above, so one personal `CLAUDE.local.md`
switches it off. It also skips the first session after an upgrade and
sessions with the built-in `agents-md` plugin disabled. The **Project
instructions** setting (`claude-md-and-agents-md`) would load both kinds of
files, but Claude Code ignores it in a project's `.claude/settings.json`: it
only works in `~/.claude/settings.json`, a `--settings` file or managed
settings (`code.claude.com/docs/en/memory#agents-md`, checked 2026-09).

A root `CLAUDE.md` also stops Claude from reading nested `AGENTS.md` files on
its own, which is why `packages/pricing/` has its own bridge. It loads when
Claude reads a file in that folder. Copilot reads `CLAUDE.md` too and sees
the one import line; that is harmless.
