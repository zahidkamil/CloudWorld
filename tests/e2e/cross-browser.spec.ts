import { expect, test, type Page } from '@playwright/test';
import { enterWorld } from './helpers';

/**
 * Cross-engine checks (Chromium, Firefox, WebKit): WebGL initialization, Three.js rendering,
 * theme selection, navigation, and camera interaction. Gameplay journeys are added here as
 * Explorer and Defender features land.
 */

async function waitForFrames(page: Page, minFrames: number) {
  const canvas = page.getByTestId('world-canvas');
  await expect(canvas).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
  await expect
    .poll(async () => Number(await canvas.getAttribute('data-frames')), { timeout: 30_000 })
    .toBeGreaterThanOrEqual(minFrames);
  return canvas;
}

test.describe('cross-browser rendering', () => {
  test('browser exposes WebGL 2', async ({ page }) => {
    await page.goto('./');
    const info = await page.evaluate(() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      return gl ? { ok: true, version: String(gl.getParameter(gl.VERSION)) } : { ok: false, version: '' };
    });
    expect(info.ok, 'WebGL 2 context should be available').toBe(true);
    expect(info.version).toMatch(/WebGL 2/);
  });

  test('Three.js initializes WebGL and draws frames', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await enterWorld(page, 'Modern City');
    const canvas = await waitForFrames(page, 30);

    await expect(canvas).toHaveAttribute('data-webgl', '2');
    expect(Number(await canvas.getAttribute('data-draw-calls'))).toBeGreaterThan(0);
    expect(Number(await canvas.getAttribute('data-triangles'))).toBeGreaterThan(0);
    await expect(page.locator('[data-testid="world-canvas"] canvas')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('theme selection re-renders the world without leaving it', async ({ page }) => {
    await enterWorld(page, 'Modern City');
    const canvas = await waitForFrames(page, 30);
    await page.mouse.move(0, 0);
    const city = await canvas.screenshot();

    await page.getByLabel('Theme').selectOption('haunted-world');
    await expect(canvas).toHaveAttribute('data-theme', 'haunted-world');
    const framesBefore = Number(await canvas.getAttribute('data-frames'));
    await waitForFrames(page, framesBefore + 30);
    const haunted = await canvas.screenshot();

    expect(city.equals(haunted), 'theme switch should change the rendered image').toBe(false);
    await expect(page.getByRole('button', { name: /Menu/ })).toBeVisible();
  });

  test('camera responds to pointer drag', async ({ page }) => {
    await enterWorld(page, 'Modern City');
    const canvas = await waitForFrames(page, 30);
    const box = await canvas.boundingBox();
    if (!box) throw new Error('canvas has no bounding box');
    const before = await canvas.screenshot();

    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 220, cy + 40, { steps: 12 });
    await page.mouse.up();
    await page.mouse.move(0, 0);

    const framesAfterDrag = Number(await canvas.getAttribute('data-frames'));
    await waitForFrames(page, framesAfterDrag + 30);
    const after = await canvas.screenshot();
    expect(before.equals(after), 'orbit drag should move the camera').toBe(false);
  });

  test('navigation keeps mode and theme consistent', async ({ page }) => {
    await enterWorld(page, 'Haunted World', 'Attack Path');
    await waitForFrames(page, 10);
    await expect(page.getByRole('button', { name: 'Attack Path' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByLabel('Theme')).toHaveValue('haunted-world');

    await page.getByRole('button', { name: 'Showcase' }).click();
    await expect(page.getByRole('button', { name: 'Showcase' })).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: /Menu/ }).click();
    await expect(page.getByRole('heading', { name: 'CloudWorld' })).toBeVisible();

    await page
      .getByRole('navigation', { name: 'Main menu' })
      .getByRole('button', { name: /^World/ })
      .click();
    await page.getByRole('button', { name: /^Modern City\./ }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /Start Showcase/ })
      .click();
    await expect(page.getByLabel('Theme')).toHaveValue('modern-city');
    await waitForFrames(page, 10);
  });
});
