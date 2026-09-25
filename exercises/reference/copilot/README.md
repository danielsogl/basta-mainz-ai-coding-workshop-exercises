# GitHub Copilot reference material

Checked against docs.github.com and code.visualstudio.com, 2026-09.

- `hooks.json`: hook config for the **Copilot CLI, the cloud agent and
  Copilot in VS Code** (agent mode, hooks in preview, can be disabled by
  organisation policy). Copy to `.github/hooks/hooks.json` (see
  [`../hooks/README.md`](../hooks/README.md)). VS Code maps `preToolUse` and
  `agentStop` to its own events and runs the `powershell` command on Windows.
  It ignores `.claude/settings.json` unless `chat.useClaudeHooks` is on (off by
  default). **Visual Studio** has no agent hooks yet. The **Copilot CLI** loads
  repo hooks only in a trusted folder (the trust prompt at startup, or
  `COPILOT_ALLOW_ALL=true` headless); elsewhere it skips them silently.
- `copilot-instructions.md`: copy to `.github/copilot-instructions.md`. For
  path-scoped rules use `.github/instructions/<name>.instructions.md` with an
  `applyTo: <glob>` frontmatter field. Copilot also reads `AGENTS.md`:
  the cloud agent reads nested files (nearest wins), the CLI only the repo
  root and the current directory, VS Code nested files only with the
  experimental setting `chat.useNestedAgentsMdFiles`. Visual Studio does not
  list `AGENTS.md` support.
- `agents/legacy-researcher.agent.md`: a custom agent; copy to
  `.github/agents/`. CLI: `/agent legacy-researcher` or `copilot --agent
  legacy-researcher`; VS Code: pick it in the agent dropdown of the chat.
- `skills/legacy-summary/SKILL.md`: same Agent Skills format as for Claude
  Code. Copilot loads skills from `.github/skills`, `.claude/skills` and
  `.agents/skills` in the CLI, the cloud agent, code review, and VS Code /
  JetBrains agent mode, and Visual Studio reads the same folders. Because
  this repo keeps the workshop skills in both `.agents/skills` and
  `.claude/skills`, Copilot (and Cursor) may list each one twice. That is
  harmless: both copies are identical.
