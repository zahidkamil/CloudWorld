import { expect, test, type Page } from '@playwright/test';
import { enterWorld } from './helpers';

async function openWorldWithSample(page: Page, buttonName: RegExp) {
  await enterWorld(page, 'Modern City');
  const inspector = page.getByLabel('Infrastructure');
  await inspector.getByRole('button', { name: buttonName }).click();
  return inspector;
}

test.describe('Infrastructure panel', () => {
  test('groups resources by AWS type, then by location', async ({ page }) => {
    const inspector = await openWorldWithSample(page, /Load single-az sample/i);
    await expect(inspector).toContainText('1 region');

    await inspector.getByRole('button', { name: 'Expand all' }).click();
    for (const group of ['Networking', 'Compute', 'Storage', 'Database']) {
      await expect(inspector.getByText(group, { exact: false }).first()).toBeVisible();
    }
    await expect(inspector.getByText('S3 bucket').first()).toBeVisible();
    await expect(inspector.getByRole('button', { name: /single-az-app-0/ })).toBeVisible();

    await inspector.getByRole('button', { name: 'Collapse all' }).click();
    await expect(inspector.getByRole('button', { name: /single-az-app-0/ })).toBeHidden();

    await inspector.getByRole('button', { name: 'By location' }).click();
    await expect(inspector.getByText('us-east-1a').first()).toBeVisible();
  });

  test('the multi-region sample still loads from the panel', async ({ page }) => {
    const inspector = await openWorldWithSample(page, /Load multi-region sample/i);
    await expect(inspector).toContainText('60 resources');
    await expect(inspector).toContainText('2 regions');
  });

  test('the panel can be widened by dragging and with the keyboard', async ({ page }) => {
    const inspector = await openWorldWithSample(page, /Load single-az sample/i);
    const handle = page.getByRole('separator', { name: 'Resize side panel' });
    const before = (await inspector.boundingBox())!.width;

    const box = (await handle.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x - 160, y, { steps: 8 });
    await page.mouse.up();

    const dragged = (await inspector.boundingBox())!.width;
    expect(dragged).toBeGreaterThan(before + 120);

    await handle.focus();
    await page.keyboard.press('ArrowLeft');
    const keyed = (await inspector.boundingBox())!.width;
    expect(keyed).toBeGreaterThan(dragged);

    await handle.dblclick();
    const reset = (await inspector.boundingBox())!.width;
    expect(Math.abs(reset - before)).toBeLessThan(2);

    // The chosen width survives a reload.
    await handle.focus();
    await page.keyboard.press('Shift+ArrowLeft');
    const saved = (await inspector.boundingBox())!.width;
    await page.reload();
    await enterWorld(page, 'Modern City');
    expect(Math.abs((await page.getByLabel('Infrastructure').boundingBox())!.width - saved)).toBeLessThan(2);
  });
});
