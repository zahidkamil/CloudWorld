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
