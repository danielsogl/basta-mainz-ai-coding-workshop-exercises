#!/usr/bin/env node
// Stop hook: the agent may not end its turn while typecheck or the tests
// affected by its change are red. Works on macOS, Linux and Windows:
// - Claude Code and Codex (Stop): exit 2 + reason on stderr
// - .github/hooks/hooks.json (agentStop, pass --copilot): the Copilot CLI and
//   cloud agent read the top-level {"decision":"block"}, VS Code reads it under
//   hookSpecificOutput
// - Cursor (stop, pass --cursor): {"followup_message": ...} sends the agent back
//
// Tests named BASELINE: (known broken) and FLAKY: (known flaky, quarantined)
// are skipped — see exercises/bonus-real-world-constraints.md. Blocking the
// agent on a failure it is not allowed to fix only teaches it to fight the hook.
//
// After MAX_BLOCKS blocks in a row in one session the hook lets the agent stop
// and says so: a red test the agent cannot fix should reach a human after a
// few rounds, not after the tool's own loop limit.
import { spawnSync } from 'node:child_process';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { Buffer } from 'node:buffer';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const MAX_BLOCKS = 3;
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const copilot = process.argv.includes('--copilot');
const cursor = process.argv.includes('--cursor');

// Read stdin as a stream: readFileSync(0) throws EAGAIN on a non-blocking pipe.
let input = {};
try {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
} catch {
  // no stdin or no JSON — fine, run the checks anyway
}
const session = String(input.session_id ?? input.sessionId ?? input.conversation_id ?? 'default').replace(/[^\w-]/g, '');
// One counter per config: the Copilot CLI also runs the hooks in
// .claude/settings.json, so one stop can reach this script twice.
const counterFile = join(tmpdir(), `verify-on-stop-${session}${copilot ? '-copilot' : cursor ? '-cursor' : ''}.txt`);
const readCount = () => {
  try {
    return Number(readFileSync(counterFile, 'utf8')) || 0;
  } catch {
    return 0;
  }
};

function run(script, args) {
  const result = spawnSync(process.execPath, [resolve(root, script), ...args], { cwd: root, encoding: 'utf8' });
  return { ok: result.status === 0, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
}

const checks = [
  ['typecheck', 'node_modules/typescript/bin/tsc', ['--noEmit']],
  ['affected tests', 'node_modules/vitest/vitest.mjs', ['run', '--changed', '-t', '^(?!.*(BASELINE|FLAKY):)']],
];

for (const [name, script, args] of checks) {
  const { ok, output } = run(script, args);
  if (ok) continue;
  const reason = `${name} failed — fix this before you finish:\n${output.trim().split('\n').slice(-40).join('\n')}`;
  const blocks = readCount() + 1;
  if (blocks > MAX_BLOCKS) {
    rmSync(counterFile, { force: true });
    process.stderr.write(`verify-on-stop: still red after ${MAX_BLOCKS} rounds, letting the agent stop. A human has to look.\n${reason}\n`);
    process.exit(0);
  }
  writeFileSync(counterFile, String(blocks));
  if (cursor) {
    process.stdout.write(JSON.stringify({ followup_message: reason }));
    process.exit(0);
  }
  if (copilot) {
    process.stdout.write(
      JSON.stringify({ decision: 'block', reason, hookSpecificOutput: { hookEventName: 'Stop', decision: 'block', reason } }),
    );
    process.exit(0);
  }
  process.stderr.write(`${reason}\n`);
  process.exit(2);
}
rmSync(counterFile, { force: true });
