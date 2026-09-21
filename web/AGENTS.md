# web/ (Angular)

- Angular 22: standalone components, signals, OnPush (the default), `inject()`,
  `@if`/`@for`. Data from the API through `httpResource`. The `angular-developer`
  skill has the details; this file only lists what is specific to this repo.
- UI comes from Angular Material. No other UI or state library.
- The app calls `/api/...`; the dev server proxies it to `apps/api` on port 3000.
- Tests: Vitest `*.spec.ts` next to the code, HTTP mocked with `HttpTestingController`.
  E2E in `e2e/` with Playwright, API mocked with `page.route` — no backend needed.
- Done means `npm run check --workspace web` is green. `eslint-disable` is not a fix.
