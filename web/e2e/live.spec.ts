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

test('joins the waitlist for real, survives a reload and does not count a repeat twice', async ({ page }) => {
  // The API keeps state while it runs: a unique email keeps reruns independent.
  const email = `e2e-${Date.now()}@example.com`;
  const count = async () => {
    const text = await page
      .getByText(/waiting/)
      .first()
      .innerText();
    return text.startsWith('Nobody') ? 0 : Number.parseInt(text, 10);
  };
  await page.goto('/');
  await expect(page.getByText(/waiting/).first()).toBeVisible();
  const before = await count();

  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Join waitlist' }).click();
  await expect(page.getByRole('status')).toContainText(`You are #${before + 1} on the waitlist.`);
  await expect.poll(count).toBe(before + 1);

  await page.reload();
  await expect.poll(count).toBe(before + 1);

  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Join waitlist' }).click();
  await expect(page.getByRole('status')).toContainText(`You are already on the waitlist as #${before + 1}.`);
  await expect.poll(count).toBe(before + 1);
});
