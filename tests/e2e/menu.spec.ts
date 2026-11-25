import { expect, test } from '@playwright/test';
import { enterWorld } from './helpers';

test.describe('Start menu @smoke', () => {
  test('settings choose the default world and mission, and survive a reload', async ({ page }) => {
    await page.goto('./');
    await page
      .getByRole('navigation', { name: 'Main menu' })
      .getByRole('button', { name: /^Settings/ })
      .click();
    await page.getByRole('radio', { name: 'Haunted World' }).click();
    await page.getByRole('radio', { name: /Attack Path/ }).click();
    await expect(page.getByRole('status').filter({ hasText: 'default mission' })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('button', { name: /Quick play/ })).toContainText(
      'Haunted World · Attack Path',
    );

    await page.getByRole('button', { name: /Quick play/ }).click();
    await expect(page.getByLabel('Theme')).toHaveValue('haunted-world');
    await expect(page.getByRole('button', { name: 'Attack Path' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('the world screen marks the default and keeps the locked world locked', async ({ page }) => {
    await page.goto('./');
    await page
      .getByRole('navigation', { name: 'Main menu' })
      .getByRole('button', { name: /^World/ })
      .click();
    await expect(page.getByRole('button', { name: /^Modern City\./ })).toContainText('Default');
    await expect(page.getByRole('button', { name: /^Aqua World\. Coming soon/ })).toBeDisabled();
  });

  test('a mission can be chosen for either world, and Escape closes the picker', async ({ page }) => {
    await page.goto('./');
    await page
      .getByRole('navigation', { name: 'Main menu' })
      .getByRole('button', { name: /^World/ })
      .click();
    await page.getByRole('button', { name: /^Haunted World\./ }).click();
    await expect(page.getByRole('dialog', { name: 'Choose your mission' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await enterWorld(page, 'Haunted World', 'Showcase');
    await expect(page.getByLabel('Theme')).toHaveValue('haunted-world');
  });
});
