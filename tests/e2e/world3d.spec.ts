import { expect, test, type Page } from '@playwright/test';
import { enterWorld, loadSample } from './helpers';

/** The 3D world built from the graph: islands, landmarks, hover, click, focus, highlights. Runs on every engine. */

const EC2 = 'aws_instance.web_east[0]';

async function ready(page: Page) {
  const canvas = page.getByTestId('world-canvas');
  await expect(canvas).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
  await expect(canvas).toHaveAttribute('data-landmarks', '60', { timeout: 30_000 });
  await expect
    .poll(async () => Number(await canvas.getAttribute('data-frames')), { timeout: 30_000 })
    .toBeGreaterThanOrEqual(30);
  await expect(canvas).toHaveAttribute('data-camera-settled', 'true', { timeout: 15_000 });
  return canvas;
}

/** Centre of the part of the canvas that the side panels leave free: where a focused resource appears. */
async function freeCentre(page: Page) {
  const canvas = (await page.getByTestId('world-canvas').boundingBox())!;
  const panel = (await page.getByLabel('Infrastructure').boundingBox())!;
  return { x: (canvas.x + panel.x - 14) / 2, y: canvas.y + canvas.height / 2 };
}

async function focusFromPanel(page: Page, name: string) {
  const panel = page.getByLabel('Infrastructure');
  await panel.getByRole('button', { name: 'Expand all' }).click();
  await panel.getByRole('button', { name, exact: true }).first().click();
}

test.describe('3D world from the graph', () => {
  test('draws a landmark for every resource on one island per region plus the global hub', async ({
    page,
  }) => {
    await enterWorld(page, 'Modern City');
    const canvas = await ready(page);
    await expect(canvas).toHaveAttribute('data-islands', '3');
    // Shared geometry keeps the number of draw calls modest for the sample.
    expect(Number(await canvas.getAttribute('data-draw-calls'))).toBeLessThan(600);
    await expect(page.getByText('us-east-1', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('us-west-2', { exact: true }).first()).toBeVisible();
  });

  test('focusing a resource from the panel flies the camera to it, and clicking it in the scene selects it', async ({
    page,
  }) => {
    await enterWorld(page, 'Modern City');
    const canvas = await ready(page);
    await focusFromPanel(page, 'web-east-0');
    await expect(canvas).toHaveAttribute('data-selected', EC2);
    await expect(page.getByLabel('Resource details')).toContainText('EC2 instance');
    await expect(canvas).toHaveAttribute('data-camera-settled', 'true', { timeout: 15_000 });

    // Deselect, then pick the same landmark by clicking it where the camera is looking.
    await page.getByRole('button', { name: /All resources/ }).click();
    await expect(canvas).toHaveAttribute('data-selected', '');
    const { x, y } = await freeCentre(page);
    await page.mouse.move(x, y);
    await expect(canvas).toHaveAttribute('data-hovered', EC2);
    await page.mouse.click(x, y);
    await expect(canvas).toHaveAttribute('data-selected', EC2);
  });

  test('selecting highlights dependencies and shared peers, and dims the rest', async ({ page }) => {
    await enterWorld(page, 'Haunted World');
    const canvas = await ready(page);
    await expect(canvas).toHaveAttribute('data-highlights', '');
    await focusFromPanel(page, 'web-east-0');
    const highlights = await expect
      .poll(async () => (await canvas.getAttribute('data-highlights')) ?? '')
      .toMatch(/primary:1/)
      .then(async () => (await canvas.getAttribute('data-highlights')) ?? '');
    const counts = Object.fromEntries(highlights.split(',').map((p) => p.split(':') as [string, string]));
    expect(Number(counts.dependency)).toBeGreaterThan(0);
    expect(Number(counts.peer)).toBeGreaterThanOrEqual(2); // the other two web servers share the security group
    expect(Number(counts.dim)).toBeGreaterThan(30);

    // A click on empty space clears the selection.
    await page.mouse.click(120, 700);
    await expect(canvas).toHaveAttribute('data-selected', '');
    await expect(canvas).toHaveAttribute('data-highlights', '');
  });

  test('switching theme keeps the same landmarks and the same selection', async ({ page }) => {
    await enterWorld(page, 'Modern City');
    const canvas = await ready(page);
    await focusFromPanel(page, 'web-east-0');
    await expect(canvas).toHaveAttribute('data-selected', EC2);
    const highlightsBefore = await canvas.getAttribute('data-highlights');

    await page.getByLabel('Theme').selectOption('haunted-world');
    await expect(canvas).toHaveAttribute('data-theme', 'haunted-world');
    await expect(canvas).toHaveAttribute('data-landmarks', '60');
    await expect(canvas).toHaveAttribute('data-selected', EC2);
    await expect(canvas).toHaveAttribute('data-highlights', highlightsBefore ?? '');
  });

  test('Fit view frames the whole world again, and a different plan rebuilds the world', async ({ page }) => {
    await enterWorld(page, 'Modern City');
    const canvas = await ready(page);
    await focusFromPanel(page, 'web-east-0');
    await page.getByRole('button', { name: 'Fit view' }).click();
    await expect(canvas).toHaveAttribute('data-selected', '');

    await loadSample(page, /Single-AZ sample/);
    await expect(canvas).toHaveAttribute('data-landmarks', '21');
    await expect(canvas).toHaveAttribute('data-islands', '2');
  });
});
