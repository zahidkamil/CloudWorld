import { expect, test } from '@playwright/test';

test.describe('CloudWorld smoke @smoke', () => {
  test('landing screen loads under the Pages base path without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('./');
    await expect(page.getByRole('heading', { name: 'CloudWorld' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Enter Modern City/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Enter Haunted World/ })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('player can enter a world and return to the menu', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: /Enter Modern City/ }).click();
    await expect(page.getByRole('button', { name: /Menu/ })).toBeVisible();
    await page.getByRole('button', { name: /Menu/ }).click();
    await expect(page.getByRole('heading', { name: 'CloudWorld' })).toBeVisible();
  });
});
