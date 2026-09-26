import { expect, test } from '@playwright/test';

test('joins the waitlist of a sold-out event and sees the count go up', async ({ page }) => {
  let length = 2;
  await page.route('**/api/events', (route) =>
    route.fulfill({
      json: [{ id: 'evt-2', name: 'BASTA! Keynote', capacity: 100, sold: 100, available: 0, soldOut: true }],
    }),
  );
  await page.route('**/api/events/evt-2/waitlist', (route) => {
    if (route.request().method() === 'POST') {
      length += 1;
      return route.fulfill({ status: 201, json: { position: length } });
    }
    return route.fulfill({ json: { eventId: 'evt-2', length } });
  });
  await page.goto('/');

  const card = page.getByRole('listitem').filter({ hasText: 'BASTA! Keynote' });
  await expect(card).toContainText('2 people waiting');

  await card.getByRole('button', { name: 'Join waitlist' }).click();
  await expect(card).toContainText('Email is required.');

  await card.getByLabel('Email').fill('ada@example.com');
  await card.getByRole('button', { name: 'Join waitlist' }).click();
  await expect(card.getByRole('status')).toHaveText('You are #3 on the waitlist.');
  await expect(card).toContainText('3 people waiting');
});
