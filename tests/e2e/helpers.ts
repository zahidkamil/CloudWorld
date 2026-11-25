import { expect, type Page } from '@playwright/test';

export type WorldName = 'Modern City' | 'Haunted World';
export type MissionName = 'Showcase' | 'Attack Path';

/** Start menu -> World -> pick a world -> pick a mission. */
export async function enterWorld(
  page: Page,
  world: WorldName = 'Modern City',
  mission: MissionName = 'Showcase',
) {
  await page.goto('./');
  await page
    .getByRole('navigation', { name: 'Main menu' })
    .getByRole('button', { name: /^World/ })
    .click();
  await page.getByRole('button', { name: new RegExp(`^${world}\\.`) }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: new RegExp(`Start ${mission}`) })
    .click();
  await expect(page.getByRole('button', { name: /Menu/ })).toBeVisible();
}

/** Opens the import dialog from the world screen, previews a bundled sample, and loads it. */
export async function loadSample(page: Page, name: RegExp) {
  await page.getByLabel('Infrastructure').getByRole('button', { name: 'Import plan' }).click();
  await page.getByRole('dialog').getByRole('button', { name }).click();
  await page.getByRole('button', { name: 'Load world' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}
