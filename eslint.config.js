// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // web/ has its own Angular ESLint config (web/eslint.config.js).
    ignores: ['node_modules', '**/dist', '.vitest', 'web'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // legacy-invoice predates the strict TS setup and is untyped on purpose
    // (see exercises/bonus-reverse-spec.md) — don't fight that here.
    files: ['packages/legacy-invoice/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
