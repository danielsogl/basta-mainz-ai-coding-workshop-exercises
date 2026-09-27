import { expect, test } from '@playwright/test';

const events = [
  { id: 'evt-1', name: 'Angular Deep Dive', capacity: 50, sold: 20, available: 30, soldOut: false },
  { id: 'evt-2', name: 'BASTA! Keynote', capacity: 100, sold: 100, available: 0, soldOut: true },
];

test('lists events with how many tickets are sold', async ({ page }) => {
  await page.route('**/api/events', (route) => route.fulfill({ json: events }));
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Events' })).toBeVisible();
  const card = page.getByRole('listitem').filter({ hasText: 'Angular Deep Dive' });
  await expect(card).toContainText('20 of 50 sold');
  await expect(card).toContainText('30 left');
});

test('marks sold-out events', async ({ page }) => {
  await page.route('**/api/events', (route) => route.fulfill({ json: events }));
  await page.goto('/');

  const soldOut = page.getByRole('listitem').filter({ hasText: 'BASTA! Keynote' });
  await expect(soldOut.getByText('Sold out')).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'Angular Deep Dive' }).getByText('Sold out')).toHaveCount(
    0,
  );
});

test('explains how to start the API and recovers on retry', async ({ page }) => {
  let apiUp = false;
  await page.route('**/api/events', (route) =>
    apiUp ? route.fulfill({ json: events }) : route.fulfill({ status: 504 }),
  );
  await page.goto('/');

  await expect(page.getByRole('alert')).toContainText('npm start --workspace apps/api');

  apiUp = true;
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByText('BASTA! Keynote')).toBeVisible();
});
