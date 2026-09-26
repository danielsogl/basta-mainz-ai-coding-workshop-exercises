// @ts-check
// Rules instead of prompts: every convention an agent must follow lives here,
// so `npm run lint` rejects violations no matter who (or what) wrote the code.
import eslint from '@eslint/js';
import angular from 'angular-eslint';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strict,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    languageOptions: {
      // Type information for rules like no-uncalled-signals.
      parserOptions: {
        projectService: { allowDefaultProject: ['*.ts', 'e2e/*.ts'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
      // An empty @Component class is fine; an empty undecorated class is not.
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
      // `any` switches the type checker off; use `unknown` and narrow instead.
      '@typescript-eslint/no-explicit-any': 'error',
      // `import type` makes it obvious what is erased at build time.
      '@typescript-eslint/consistent-type-imports': 'error',
      // Component state is signals, not plain mutable fields (OnPush + zoneless need it).
      '@angular-eslint/prefer-signals': 'error',
      // `count` instead of `count()` in a condition is always truthy: a silent bug.
      '@angular-eslint/no-uncalled-signals': 'error',
      // `inject()` works in functions and field initializers; constructor DI does not.
      '@angular-eslint/prefer-inject': 'error',
      // Standalone components only; NgModules are legacy in this codebase.
      '@angular-eslint/prefer-standalone': 'error',
      // OnPush is the only change detection strategy we use.
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      // Use @if/@for/@switch, not *ngIf/*ngFor.
      '@angular-eslint/template/prefer-control-flow': 'error',
      // `$any()` in a template hides type errors from strictTemplates.
      '@angular-eslint/template/no-any': 'error',
      // A <button> without type inside a <form> submits it by accident.
      '@angular-eslint/template/button-has-type': 'error',
      // Only focusable elements may be clickable, and they need keyboard handlers too.
      '@angular-eslint/template/interactive-supports-focus': 'error',
      '@angular-eslint/template/click-events-have-key-events': 'error',
      // Every form control needs a label a screen reader can announce.
      '@angular-eslint/template/label-has-associated-control': 'error',
      // Images need alt text.
      '@angular-eslint/template/alt-text': 'error',
    },
  },
]);
