import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const hook = 'exercises/reference/hooks/guard-edits.mjs';
const run = (payload: unknown) =>
  spawnSync(process.execPath, [hook], { input: JSON.stringify(payload), encoding: 'utf8' }).status;

// One payload shape per tool: Claude Code, VS Code agent mode, Copilot CLI, Codex, Cursor.
describe('guard-edits hook', () => {
  it('denies editing an existing test (Claude Code)', () => {
    expect(run({ tool_name: 'Edit', tool_input: { file_path: 'apps/api/src/server.test.ts' } })).toBe(2);
  });
  it('denies editing an existing test (VS Code)', () => {
    expect(run({ tool_name: 'replace_string_in_file', tool_input: { filePath: 'apps/api/src/server.test.ts' } })).toBe(
      2,
    );
  });
  it('denies editing an existing test (Copilot CLI, toolArgs as JSON string)', () => {
    expect(run({ toolName: 'edit', toolArgs: JSON.stringify({ path: 'apps/api/src/server.test.ts' }) })).toBe(2);
  });
  it('allows creating a test file that does not exist yet', () => {
    expect(run({ tool_name: 'Write', tool_input: { file_path: 'apps/api/src/brand-new.test.ts' } })).toBe(0);
    expect(run({ toolName: 'create', toolArgs: { path: 'apps/api/src/brand-new.test.ts' } })).toBe(0);
  });
  it('denies changing the hook setup', () => {
    expect(run({ tool_name: 'Write', tool_input: { file_path: '.claude/settings.json' } })).toBe(2);
  });
  it('denies shell writes to tests, allows running them', () => {
    expect(run({ tool_name: 'Bash', tool_input: { command: "sed -i 's/1/2/' apps/api/src/server.test.ts" } })).toBe(2);
    expect(run({ tool_name: 'Bash', tool_input: { command: 'npx vitest run apps/api/src/server.test.ts' } })).toBe(0);
    expect(run({ tool_name: 'Bash', tool_input: { command: 'find . -name "*.test.ts" 2>/dev/null | head' } })).toBe(0);
    expect(run({ tool_name: 'Bash', tool_input: { command: 'grep -n AC3 apps/api/src/waitlist.test.ts 2>&1' } })).toBe(
      0,
    );
    expect(
      run({ tool_name: 'Bash', tool_input: { command: 'echo x > apps/api/src/waitlist.test.ts 2>/dev/null' } }),
    ).toBe(2);
    expect(run({ tool_name: 'Bash', tool_input: { command: 'find apps -name "*.test.ts" -delete' } })).toBe(2);
  });
  it('denies switching the verifier off through the test config', () => {
    expect(run({ tool_name: 'Edit', tool_input: { file_path: 'vitest.config.ts' } })).toBe(2);
    expect(run({ tool_name: 'Edit', tool_input: { file_path: 'package.json' } })).toBe(2);
    expect(run({ tool_name: 'Write', tool_input: { file_path: '.codex/hooks.json' } })).toBe(2);
  });
  it('guards the web app: specs, e2e tests and the rule configs', () => {
    expect(run({ tool_name: 'Edit', tool_input: { file_path: 'web/src/app/events/events.spec.ts' } })).toBe(2);
    expect(run({ tool_name: 'Edit', tool_input: { file_path: 'web/e2e/events.spec.ts' } })).toBe(2);
    expect(run({ tool_name: 'Edit', tool_input: { file_path: 'web/eslint.config.js' } })).toBe(2);
    expect(run({ tool_name: 'Edit', tool_input: { file_path: 'lefthook.yml' } })).toBe(2);
    expect(run({ tool_name: 'Edit', tool_input: { file_path: '.prettierrc.json' } })).toBe(2);
    expect(run({ tool_name: 'Edit', tool_input: { file_path: 'web/src/app/events/events.ts' } })).toBe(0);
    expect(run({ tool_name: 'Write', tool_input: { file_path: 'web/src/app/brand-new.spec.ts' } })).toBe(0);
  });
  it('judges the target, not the content (a doc may mention package.json)', () => {
    expect(
      run({ tool_name: 'Edit', tool_input: { file_path: 'README.md', new_string: 'see package.json and x.test.ts' } }),
    ).toBe(0);
  });
  it('guards shell commands from PowerShell (Claude Code on Windows) and Cursor', () => {
    expect(run({ tool_name: 'PowerShell', tool_input: { command: 'Set-Content apps/api/src/server.test.ts x' } })).toBe(
      2,
    );
    expect(run({ tool_name: 'Shell', tool_input: { command: 'rm apps/api/src/server.test.ts' } })).toBe(2);
  });
  it('reads Codex patches: new test files allowed, existing ones and hook setup denied', () => {
    const patch = (body: string) => ({
      tool_name: 'apply_patch',
      tool_input: { command: `*** Begin Patch\n${body}\n*** End Patch` },
    });
    expect(run(patch('*** Add File: apps/api/src/brand-new.test.ts\n+it()'))).toBe(0);
    expect(run(patch('*** Update File: apps/api/src/server.ts\n@@\n-a\n+b'))).toBe(0);
    expect(run(patch('*** Update File: apps/api/src/server.test.ts\n@@\n-a\n+b'))).toBe(2);
    expect(run(patch('*** Delete File: apps/api/src/server.test.ts'))).toBe(2);
    expect(run(patch('*** Update File: .claude/settings.json\n@@\n-a\n+b'))).toBe(2);
  });
  it('allows reads and unrelated edits, and fails closed on garbage', () => {
    expect(run({ tool_name: 'Read', tool_input: { file_path: 'apps/api/src/server.test.ts' } })).toBe(0);
    expect(run({ tool_name: 'Edit', tool_input: { file_path: 'apps/api/src/server.ts' } })).toBe(0);
    expect(spawnSync(process.execPath, [hook], { input: 'not json', encoding: 'utf8' }).status).toBe(2);
  });
});
