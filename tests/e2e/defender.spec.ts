import { expect, test } from '@playwright/test';
import { enterWorld } from './helpers';

test.describe('Attack Path mission', () => {
  test('finds the open SSH port, spends a hint, and catches it for points', async ({ page }) => {
    await enterWorld(page, 'Modern City', 'Attack Path');
    const panel = page.getByLabel('Attack path mission');
    await expect(panel).toContainText('No cloud to defend yet');

    await page
      .getByLabel('Infrastructure')
      .getByRole('button', { name: /multi-region sample/i })
      .click();
    await expect(panel.getByLabel('1 of 1 findings caught')).toHaveCount(0);
    await expect(panel.getByLabel('0 of 1 findings caught')).toBeVisible();

    await panel.getByRole('button', { name: /SSH is open to the internet/ }).click();
    await expect(panel).toContainText('port 22');

    await panel.getByRole('button', { name: /Show hint 1 of 3/ }).click();
    await expect(
      panel.getByRole('listitem').filter({ hasText: 'Look at the security groups' }),
    ).toBeVisible();
    await expect(panel).toContainText('worth 75 pts');

    await panel.getByRole('button', { name: /Leave it open and rely on a strong password/ }).click();
    await expect(panel.getByLabel('Score 0 points')).toBeVisible();

    await panel.getByRole('button', { name: /Limit the source to a trusted network/ }).click();
    await expect(panel.getByLabel('Score 75 points')).toBeVisible();
    await expect(panel.getByLabel('1 of 1 findings caught')).toBeVisible();
    await expect(panel).toContainText('Every finding caught');
  });

  test('shows "No findings" for a clean cloud', async ({ page }) => {
    await enterWorld(page, 'Haunted World', 'Attack Path');
    await page
      .getByLabel('Infrastructure')
      .getByRole('button', { name: /single-az sample/i })
      .click();
    const panel = page.getByLabel('Attack path mission');
    await expect(panel.getByText('No findings')).toBeVisible();
    await expect(panel.getByLabel('0 of 0 findings caught')).toBeVisible();
  });
});
