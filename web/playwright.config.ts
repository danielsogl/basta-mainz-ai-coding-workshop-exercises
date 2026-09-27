import { defineConfig, devices } from '@playwright/test';

// E2E runs against `ng serve` and the real API (apps/api). Most tests mock /api with page.route;
// e2e/live.spec.ts does not, so the app and the API cannot drift apart unnoticed.
export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm start --workspace apps/api',
      cwd: '..',
      url: 'http://localhost:3000/events',
      reuseExistingServer: !process.env['CI'],
    },
    {
      command: 'npx ng serve --port 4200',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
  ],
});
