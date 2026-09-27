import { expect, test } from '@playwright/test';

// No mocks: the app talks to the real apps/api through the dev proxy. If the API's
// response shape and the app's model drift apart, this is the test that notices.
test('shows the events the API serves', async ({ page }) => {
  await page.goto('/');

  const day1 = page.getByRole('listitem').filter({ hasText: 'Conference Day 1' });
  await expect(day1).toContainText('100 of 100 sold');
  await expect(day1.getByText('Sold out')).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'Conference Day 2' })).toContainText('40 of 100 sold');
});
