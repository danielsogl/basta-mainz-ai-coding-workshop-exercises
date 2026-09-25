#!/usr/bin/env node
// Evals for the harness: run fixed prompts through a headless agent and check
// the result with a script, several times each. Usage:
//
//   npm run evals                      # all evals, AGENT defaults to Claude Code
//   npm run evals -- review --runs 1   # only evals whose name contains "review"
//   COPILOT_ALLOW_ALL=true AGENT="copilot -p" npm run evals   # trusts the folder, so hooks load
//   npm run evals -- --verbose         # print the agent's output of failed runs
//
// The prompt is appended as the last argument, so a flag that takes it (-p)
// must come last.
//
// The default agent loads only the project's settings: an eval must not depend
// on someone's personal hooks or config.
//
// Each run gets a fresh git worktree of the eval's `checkout` branch, so the
// agent can change files without touching your working copy.
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const agent = (process.env.AGENT ?? 'claude -p --permission-mode acceptEdits --setting-sources project,local').split(' ');
const args = process.argv.slice(2);
const runsOverride = args.includes('--runs') ? Number(args[args.indexOf('--runs') + 1]) : undefined;
const verbose = args.includes('--verbose');
const filter = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--runs');
const evals = JSON.parse(readFileSync(join(root, 'evals/evals.json'), 'utf8')).filter((e) => !filter || e.name.includes(filter));

const git = (cwd, ...a) => spawnSync('git', a, { cwd, encoding: 'utf8' });

// Each entry is a string or a list of alternatives; every entry must match.
const containsAll = (text, groups) =>
  groups.every((alts) => [alts].flat().some((a) => text.toLowerCase().includes(a.toLowerCase())));

function changedFiles(dir) {
  return git(dir, 'status', '--porcelain', '--untracked-files=all')
    .stdout.split('\n')
    .filter(Boolean)
    .map((line) => line.slice(3))
    .filter((f) => !f.startsWith('.claude/') && f !== 'node_modules');
}

function runOnce(e) {
  const dir = mkdtempSync(join(tmpdir(), 'eval-'));
  rmSync(dir, { recursive: true });
  const ref = git(root, 'rev-parse', '--verify', '--quiet', e.checkout).status === 0 ? e.checkout : `origin/${e.checkout}`;
  if (git(root, 'worktree', 'add', '--detach', dir, ref).status !== 0) return [`cannot check out ${e.checkout}`];
  try {
    // 'junction' makes this work on Windows without admin rights.
    symlinkSync(join(root, 'node_modules'), join(dir, 'node_modules'), 'junction');
    for (const [from, to] of Object.entries(e.copy ?? {})) {
      mkdirSync(dirname(join(dir, to)), { recursive: true });
      copyFileSync(join(dir, from), join(dir, to));
    }
    const [cmd, ...cmdArgs] = agent;
    const win = process.platform === 'win32';
    const result = spawnSync(cmd, [...cmdArgs, win ? `"${e.prompt}"` : e.prompt], {
      cwd: dir,
      encoding: 'utf8',
      shell: win, // .cmd shims need a shell on Windows
      timeout: 10 * 60 * 1000,
    });
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
    const failures = [];
    const x = e.expect;
    if (x.output_contains && !containsAll(output, x.output_contains)) failures.push('output is missing an expected phrase');
    for (const [file, groups] of Object.entries(x.file_contains ?? {})) {
      const path = join(dir, file);
      if (!existsSync(path) || !containsAll(readFileSync(path, 'utf8'), groups)) failures.push(`${file} is missing or incomplete`);
    }
    if (x.no_changes) {
      const bad = changedFiles(dir).filter((f) => new RegExp(x.no_changes).test(f));
      if (bad.length) failures.push(`changed files it must not change: ${bad.join(', ')}`);
    }
    if (verbose && failures.length) process.stdout.write(`\n----- ${e.name}\n${output.trim()}\n-----\n`);
    return failures;
  } finally {
    git(root, 'worktree', 'remove', '--force', dir);
  }
}

let failed = 0;
for (const e of evals) {
  const runs = runsOverride ?? e.runs ?? 3;
  const pass = Math.min(e.pass ?? Math.max(runs - 1, 1), runs);
  let ok = 0;
  const reasons = new Set();
  for (let i = 0; i < runs; i++) {
    const failures = runOnce(e);
    if (failures.length === 0) ok++;
    failures.forEach((f) => reasons.add(f));
  }
  const passed = ok >= pass;
  if (!passed) failed++;
  const why = reasons.size ? `\n      ${[...reasons].join('\n      ')}` : '';
  process.stdout.write(`${passed ? 'PASS' : 'FAIL'}  ${ok}/${runs}  ${e.name}${why}\n`);
}
process.exit(failed ? 1 : 0);
