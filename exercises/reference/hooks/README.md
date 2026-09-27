# Hooks (all tools, all operating systems)

Two Node scripts, used by every tool's config next door. This repo already
requires Node, so they run the same on macOS, Linux and Windows without bash
or `jq`.

| Script | Event | What it does |
|---|---|---|
| `guard-edits.mjs` | before a tool runs | Blocks changes to **existing** tests (`*.test.ts`, `*.spec.ts`, anything under `e2e/`), to the hook setup itself (`exercises/reference/hooks/`, `.claude/settings*.json`, `.github/hooks/`, `.codex/`, `.cursor/hooks.json`, `.vscode/settings.json`), to the files that define the checks (`vitest.config.ts`, `playwright.config.ts`, `eslint.config.js`, `.prettierrc*`, `lefthook.yml`, `angular.json`, `package.json`), and `git commit`/`git push` with `--no-verify` or `-n`, which would skip Lefthook. Creating a **new** test file is allowed: that is the RED step. Also catches the usual shell workarounds (`sed -i`, `>`, `rm`, `git checkout -- x.test.ts`, `Set-Content`, …) and Codex patches (`*** Update File: x.test.ts`). |
| `verify-on-stop.mjs` | agent wants to stop | Runs typecheck and the tests affected by the change, plus `web/`'s lint and unit tests when the change touches `web/`. If they fail, the agent has to keep working. Skips tests named `BASELINE:` and `FLAKY:` (known, see [`../../bonus-real-world-constraints.md`](../../bonus-real-world-constraints.md)). After three blocks in a row it lets the agent stop and says so on stderr: a test the agent cannot fix belongs to a human. |

`guard-edits.mjs` understands the payload shapes of Claude Code
(`tool_name`/`tool_input.file_path`), VS Code agent mode (`tool_name`,
`filePath`), Copilot CLI / cloud agent (`toolName`, `toolArgs` as a JSON
string), Codex (`apply_patch` with the patch in `tool_input.command`) and
Cursor (`tool_name`/`tool_input`). Deny = exit code `2`, which blocks in all of them. The reason goes to stderr (Claude Code, VS Code) and into the
stdout JSON (`permissionDecisionReason`, read by Copilot); the script does both.
Allow = exit `0` with no output, so your tool's own permission prompts still apply.

The guard fails closed on input it cannot parse. A crash, a wrong path or a
timeout still fails **open** in most tools, because only exit `2` blocks. The
configs use paths relative to the repo root, so start your agent from the repo
root. (Not `${CLAUDE_PROJECT_DIR}`: the Copilot CLI also runs the hooks in
`.claude/settings.json`, and in PowerShell that placeholder comes out empty, so
every tool call would be denied.)

The Copilot CLI runs both files when both exist: `.github/hooks/hooks.json`
and the hooks in `.claude/settings.json`. That is harmless, the guard gives the
same answer twice and the stop check runs twice.

## Which branches have them on

`main` up to `checkpoint/04-context`: off, you switch them on in Ü5 with the
commands below. `checkpoint/05-red`, `checkpoint/05-build` and
`pr/leave-waitlist` ship both configs, so they are on after a checkout.
Tools read hook configs when a session starts: **restart your agent after
every `git checkout`**.

## Install

Run your agent from the repo root. Then:

| You use | Copy | Result |
|---|---|---|
| Claude Code | `node -e "require('fs').mkdirSync('.claude',{recursive:true});require('fs').copyFileSync('exercises/reference/claude-code/settings.json','.claude/settings.json')"` | `.claude/settings.json` |
| Copilot: VS Code agent mode, CLI, cloud agent | `node -e "require('fs').mkdirSync('.github/hooks',{recursive:true});require('fs').copyFileSync('exercises/reference/copilot/hooks.json','.github/hooks/hooks.json')"` | `.github/hooks/hooks.json` |
| Codex | `node -e "require('fs').mkdirSync('.codex',{recursive:true});require('fs').copyFileSync('exercises/reference/codex/hooks.json','.codex/hooks.json')"`, then `/hooks` in Codex to trust them | `.codex/hooks.json` |
| Cursor | `node -e "require('fs').mkdirSync('.cursor',{recursive:true});require('fs').copyFileSync('exercises/reference/cursor/hooks.json','.cursor/hooks.json')"` | `.cursor/hooks.json` |
| Anything else | run `npm run check` yourself after every agent turn | – |

**Copilot CLI:** repo hooks run only in a trusted folder. Confirm the trust
prompt when the CLI starts in the repo. In an untrusted folder, and in
`copilot -p` without `COPILOT_ALLOW_ALL=true`, the hooks are skipped silently,
so always do step 5 of Ü5 (try to break the rule) to see them work.

(The `node -e` one-liners work in bash, zsh, PowerShell and cmd alike.
`cp` / `mkdir -p` are fine too if your shell has them.)

VS Code agent hooks are in preview. You do not need to switch them on, but
your organisation can disable them by policy. VS Code reads
`.github/hooks/*.json` and maps the Copilot events (`preToolUse`, `agentStop`)
to its own. It ignores `.claude/settings.json` unless you turn on
`chat.useClaudeHooks` (off by default), so VS Code users copy the Copilot file.
VS Code runs the hook in the workspace root, on Windows through Windows
PowerShell, and runs it on every tool call; the script filters by tool name
itself (a hook you write for your own repo must do the same). Visual Studio
has no agent hooks yet: use the Copilot CLI in a terminal for Ü5.

Codex and Cursor use the same model with small differences:

- **Codex** (`.codex/hooks.json`): `PreToolUse` and `Stop`, exit `2` blocks,
  like Claude Code. New or changed hooks do not run until you review and
  trust them with `/hooks`.
- **Cursor** (`.cursor/hooks.json`): `preToolUse` blocks on exit `2`, but
  fails open on a crash unless `failClosed: true` (set in the reference file).
  `stop` cannot block with an exit code; `verify-on-stop.mjs --cursor` answers
  with a `followup_message` that sends the agent back, at most `loop_limit` times.

## Try them without an agent

```sh
node -e "console.log(JSON.stringify({tool_name:'Edit',tool_input:{file_path:'apps/api/src/server.test.ts'}}))" | node exercises/reference/hooks/guard-edits.mjs
# → "Blocked: …", exit code 2

node exercises/reference/hooks/verify-on-stop.mjs < /dev/null   # PowerShell: $null | node …
# → no output, exit code 0 on a clean tree
```

`guard-edits.test.ts` next to the scripts checks all three payload shapes and runs with `npm test`.
