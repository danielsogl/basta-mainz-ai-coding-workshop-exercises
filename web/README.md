# Tickets web (Angular)

Optional UI for the Tickets API (`apps/api`). Angular 22 (standalone, zoneless, OnPush, signals), Angular Material.

```bash
npm ci                          # once, from the repo root (npm workspace)
npm start                       # API on http://localhost:3000
npm start --workspace web       # http://localhost:4200, /api is proxied to the API
```

| Script                 | What it checks                                                    |
| ---------------------- | ----------------------------------------------------------------- |
| `npm run lint`         | angular-eslint + typescript-eslint rules (see `eslint.config.js`) |
| `npm test`             | Vitest unit tests (`*.spec.ts`)                                   |
| `npm run build`        | production build, strict TypeScript + strict templates            |
| `npm run e2e`          | Playwright; starts API and app, most specs mock `/api`            |
| `npm run check`        | lint, test and build; Prettier runs from the repo root            |

First E2E run: `npx playwright install chromium`.
