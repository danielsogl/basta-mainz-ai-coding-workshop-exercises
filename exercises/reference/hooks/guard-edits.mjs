#!/usr/bin/env node
// Pre-tool hook: the agent may not change the tests that verify it, nor the
// hook setup that enforces this. Works unchanged on macOS, Linux and Windows,
// and for Claude Code (PreToolUse), VS Code agent mode (PreToolUse, reads the
// Copilot file in .github/hooks), Copilot CLI / cloud agent (preToolUse),
// Codex (PreToolUse, apply_patch) and Cursor (preToolUse).
//
// Allowed: reading anything, and creating a test file that does not exist yet
// (the RED step of red-green). Denied: changing an existing test (*.test.ts
// in the API, *.spec.ts and e2e/ in web/), and any change to the hook setup or
// to the configs that define the rules (lint, format, test runners, git hooks).
//
// Deny = exit 2 plus a reason on stderr, which every one of the three tools
// treats as "blocked". Allow = exit 0 with no output, so the tool's own
// permission prompts still apply.
import { existsSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Buffer } from 'node:buffer';
import process from 'node:process';

const TEST_FILE = /\.(test|spec)\.ts\b|(^|[\\/\s'"])e2e[\\/]/;
// The hook setup, plus the files that decide which checks run and what they
// enforce: changing vitest.config.ts, the ESLint config or a package.json
// script switches the verifier off just as well as deleting the hook.
const HOOK_SETUP =
  /(exercises[\\/]reference[\\/]hooks|\.claude[\\/]settings(\.local)?\.json|\.github[\\/]hooks|\.codex[\\/]|\.cursor[\\/]hooks\.json|\.vscode[\\/]settings\.json|(vitest|playwright)\.config\.[cm]?[jt]s|eslint\.config\.[cm]?[jt]s|\.prettierrc|lefthook\.ya?ml|angular\.json|(^|[\\/\s'"])package\.json)/;
// ponytail: name-based tool classification; add names here when a tool ships
// a new edit or shell tool.
const EDIT_TOOL = /edit|write|create|replace|patch|insert|delete|rename|move/i;
const SHELL_TOOL = /^(bash|shell|powershell|run_?in_?terminal|execute|exec)$/i;
// ponytail: shell commands are matched by pattern, not parsed — a determined
// agent can still get around this; the hook catches the usual sed/echo/rm moves.
const SHELL_WRITE =
  /(>|\s-delete\b|\bsed\s+-i|\bperl\s+-i|\btee\b|\brm\b|\bmv\b|\bcp\b|\bgit\s+(checkout|restore)\b|Set-Content|Out-File|Remove-Item|Move-Item|Copy-Item)/;

function parseInput(raw) {
  const data = JSON.parse(raw);
  const toolName = String(data.tool_name ?? data.toolName ?? '');
  let args = data.tool_input ?? data.toolArgs ?? {};
  // Copilot CLI sends toolArgs as a JSON string.
  if (typeof args === 'string') {
    try {
      args = JSON.parse(args);
    } catch {
      args = { command: args };
    }
  }
  return { toolName, args, cwd: data.cwd ?? process.cwd() };
}

function strings(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

function targetPath(args) {
  const p = args.file_path ?? args.filePath ?? args.path ?? args.file;
  return typeof p === 'string' ? p : undefined;
}

export function decide(raw) {
  let input;
  try {
    input = parseInput(raw);
  } catch {
    return 'could not parse the hook input — denying to be safe.';
  }
  const { toolName, args, cwd } = input;
  const texts = strings(args);

  if (SHELL_TOOL.test(toolName)) {
    // Redirecting errors or output into nowhere (2>&1, 2>/dev/null, > $null)
    // writes nothing: drop it before looking for a write.
    const command = texts.join(' ').replace(/\d?>&\d|\d?>\s*(\/dev\/null|\$null|NUL)\b/gi, '');
    if ((TEST_FILE.test(command) || HOOK_SETUP.test(command)) && SHELL_WRITE.test(command)) {
      return `shell command would change a test file or the hook setup: ${command}`;
    }
    return undefined;
  }

  if (!EDIT_TOOL.test(toolName)) return undefined;

  // Codex apply_patch: one patch can add, update, delete or move several files.
  const ops = [...texts.join('\n').matchAll(/^\*\*\* (Add|Update|Delete) File: (.+)$|^\*\*\* Move to: (.+)$/gm)];
  if (ops.length) {
    for (const [, op = 'Move', file = '', moveTo = ''] of ops) {
      const path = (file || moveTo).trim();
      if (HOOK_SETUP.test(path)) return 'agents may not change the hook setup or the test config. Ask a human.';
      const isNewTest = op === 'Add' && !existsSync(isAbsolute(path) ? path : resolve(cwd, path));
      if (TEST_FILE.test(path) && !isNewTest) {
        return `agents may not change existing tests (${path}). If a test looks wrong, stop and tell the human why.`;
      }
    }
    return undefined;
  }

  // Judge the target path, not the new content: a doc that mentions
  // package.json is not a change to it. Unknown payload shape: judge everything.
  const path = targetPath(args);
  const targets = path ? [path] : texts;
  if (targets.some((t) => HOOK_SETUP.test(t))) {
    return 'agents may not change the hook setup or the test config. Ask a human.';
  }
  if (targets.some((t) => TEST_FILE.test(t))) {
    const isNewFile =
      /create|write/i.test(toolName) && path && !existsSync(isAbsolute(path) ? path : resolve(cwd, path));
    if (isNewFile) return undefined;
    return `agents may not change existing tests (${path ?? 'a test file'}). If a test looks wrong, stop and tell the human why.`;
  }
  return undefined;
}

// Works on every Node 24 release (import.meta.main only exists from 24.2 on).
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // Read stdin as a stream: readFileSync(0) throws EAGAIN when a tool hands
  // the hook a non-blocking pipe before the payload arrives (Copilot CLI does).
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const reason = decide(Buffer.concat(chunks).toString('utf8'));
  if (reason) {
    process.stderr.write(`Blocked: ${reason}\n`);
    process.stdout.write(
      JSON.stringify({
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: reason,
        },
      }),
    );
    process.exit(2);
  }
}
