import { expect, test } from '@playwright/test';
import { enterWorld } from './helpers';

test.describe('CloudWorld smoke @smoke', () => {
  test('start menu loads under the Pages base path without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('./');
    await expect(page.getByRole('heading', { name: 'CloudWorld' })).toBeVisible();
    const menu = page.getByRole('navigation', { name: 'Main menu' });
    await expect(menu.getByRole('button', { name: /^World/ })).toBeVisible();
    await expect(menu.getByRole('button', { name: /^Settings/ })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('player can enter a world and return to the menu', async ({ page }) => {
    await enterWorld(page, 'Modern City');
    await page.getByRole('button', { name: /Menu/ }).click();
    await expect(page.getByRole('heading', { name: 'CloudWorld' })).toBeVisible();
  });
});
