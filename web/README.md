# Tickets web (Angular)

Optional UI for the Tickets API (`apps/api`). Angular 22 (standalone, zoneless, OnPush, signals), Angular Material.

```bash
npm ci                          # once, from the repo root (npm workspace)
npm start --workspace apps/api  # API on http://localhost:3000
npm start --workspace web       # http://localhost:4200, /api is proxied to the API
```

| Script                 | What it checks                                                    |
| ---------------------- | ----------------------------------------------------------------- |
| `npm run lint`         | angular-eslint + typescript-eslint rules (see `eslint.config.js`) |
| `npm test`             | Vitest unit tests (`*.spec.ts`)                                   |
| `npm run build`        | production build, strict TypeScript + strict templates            |
| `npm run e2e`          | Playwright, API mocked with `page.route`, no backend needed       |
| `npm run format:check` | Prettier (config in the repo root)                                |
| `npm run check`        | lint, test, build and format:check                                |

First E2E run: `npx playwright install chromium`.
