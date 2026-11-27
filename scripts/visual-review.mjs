// Automated visual review of every world, using Playwright's bundled Chromium.
// Usage: node scripts/visual-review.mjs [baseUrl] [--worlds=modern-city,haunted-world]
// Needs the production build served under /CloudWorld/ (npm run build && npx vite preview --port 4173).
// Checks per world: no console or page errors, WebGL frames drawn, lighting is neither black nor washed out,
// the picture has contrast, and a resource can be selected and inspected. Writes screenshots to
// .screenshots/review/ and exits 1 when anything fails. The Playwright MCP hook uses the same criteria.
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

export const THRESHOLDS = {
  /** Average brightness, 0 (black) to 1 (white). */
  minMeanLuma: 0.06,
  maxMeanLuma: 0.82,
  /** Share of pixels that are almost black or almost white. */
  maxNearBlack: 0.9,
  maxNearWhite: 0.35,
  /** Standard deviation of brightness. A flat image is a rendering problem. */
  minContrast: 0.03,
};

export function judgeLighting(stats) {
  const problems = [];
  if (stats.meanLuma < THRESHOLDS.minMeanLuma) problems.push(`too dark (mean ${stats.meanLuma.toFixed(3)})`);
  if (stats.meanLuma > THRESHOLDS.maxMeanLuma)
    problems.push(`washed out (mean ${stats.meanLuma.toFixed(3)})`);
  if (stats.nearBlack > THRESHOLDS.maxNearBlack)
    problems.push(`${(stats.nearBlack * 100).toFixed(0)}% of pixels are black`);
  if (stats.nearWhite > THRESHOLDS.maxNearWhite)
    problems.push(`${(stats.nearWhite * 100).toFixed(0)}% of pixels are white`);
  if (stats.contrast < THRESHOLDS.minContrast)
    problems.push(`flat image (contrast ${stats.contrast.toFixed(3)})`);
  return problems;
}

async function imageStats(context, png) {
  const page = await context.newPage();
  try {
    return await page.evaluate(async (b64) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const g = c.getContext('2d');
      g.drawImage(img, 0, 0);
      const { data } = g.getImageData(0, 0, c.width, c.height);
      let sum = 0;
      let sumSq = 0;
      let black = 0;
      let white = 0;
      const n = data.length / 4;
      for (let i = 0; i < data.length; i += 4) {
        const y = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
        sum += y;
        sumSq += y * y;
        if (y < 0.03) black += 1;
        if (y > 0.97) white += 1;
      }
      const mean = sum / n;
      return {
        meanLuma: mean,
        contrast: Math.sqrt(Math.max(sumSq / n - mean * mean, 0)),
        nearBlack: black / n,
        nearWhite: white / n,
      };
    }, png.toString('base64'));
  } finally {
    await page.close();
  }
}

async function reviewWorld(browser, baseUrl, world) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
  page.on('pageerror', (e) => errors.push(`page: ${e.message}`));
  const checks = [];
  const check = (name, ok, detail = '') => checks.push({ name, ok, detail });

  await page.goto(baseUrl);
  await page
    .getByRole('navigation', { name: 'Main menu' })
    .getByRole('button', { name: /^World/ })
    .click();
  await page.getByRole('button', { name: new RegExp(`^${world.name}\\.`) }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /Start Showcase/ })
    .click();

  const canvas = page.getByTestId('world-canvas');
  await canvas.waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForFunction(
    () =>
      Number(document.querySelector('[data-testid="world-canvas"]')?.getAttribute('data-frames') ?? 0) >= 30,
    undefined,
    { timeout: 30_000 },
  );
  await page.waitForFunction(
    () =>
      document.querySelector('[data-testid="world-canvas"]')?.getAttribute('data-camera-settled') === 'true',
    undefined,
    { timeout: 30_000 },
  );
  check('landmarks drawn for every resource', (await canvas.getAttribute('data-landmarks')) === '60');
  // Every playable world ships a Blender model library (public/worlds/<id>/library.json).
  check(`${world.id} library loaded`, (await canvas.getAttribute('data-library')) === 'loaded');
  check('WebGL 2 frames drawn', (await canvas.getAttribute('data-webgl')) === '2');
  check('draw calls reported', Number(await canvas.getAttribute('data-draw-calls')) > 0);

  mkdirSync('.screenshots/review', { recursive: true });
  await page.mouse.move(0, 0);
  const shot = await canvas.screenshot({ path: `.screenshots/review/${world.id}-scene.png` });
  const stats = await imageStats(context, shot);
  const lighting = judgeLighting(stats);
  check(
    'lighting',
    lighting.length === 0,
    lighting.join('; ') || `mean ${stats.meanLuma.toFixed(2)}, contrast ${stats.contrast.toFixed(2)}`,
  );

  // Resource selection: focus a resource from the panel, then pick it again by clicking it in the 3D scene.
  const panel = page.getByLabel('Infrastructure');
  await panel.getByRole('button', { name: 'Expand all' }).click();
  await panel.getByRole('button', { name: 'web-east-0', exact: true }).first().click();
  await page.waitForFunction(
    () =>
      document.querySelector('[data-testid="world-canvas"]')?.getAttribute('data-camera-settled') === 'true',
    undefined,
    { timeout: 30_000 },
  );
  const details = page.getByLabel('Resource details');
  check('selection opens the details card', await details.isVisible());
  const highlights = (await canvas.getAttribute('data-highlights')) ?? '';
  check(
    'selection highlights, shares peers, and dims the rest',
    /primary:1/.test(highlights) && /peer:/.test(highlights) && /dim:/.test(highlights),
    highlights,
  );
  await page.screenshot({ path: `.screenshots/review/${world.id}-selected.png` });

  await page.getByRole('button', { name: /All resources/ }).click();
  const box = await canvas.boundingBox();
  const panelBox = await panel.boundingBox();
  const cx = (box.x + panelBox.x - 14) / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  check(
    'hovering the focused landmark in the scene',
    (await canvas.getAttribute('data-hovered')) === 'aws_instance.web_east[0]',
  );
  await page.mouse.click(cx, cy);
  check(
    'clicking the landmark in the scene selects it',
    (await canvas.getAttribute('data-selected')) === 'aws_instance.web_east[0]',
  );

  check('no console or page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await context.close();
  return checks;
}

async function main() {
  const baseUrl = process.argv.find((a) => a.startsWith('http')) ?? 'http://localhost:4173/CloudWorld/';
  const only = process.argv
    .find((a) => a.startsWith('--worlds='))
    ?.slice(9)
    .split(',');
  const worlds = [
    { id: 'modern-city', name: 'Modern City' },
    { id: 'haunted-world', name: 'Haunted World' },
  ].filter((w) => !only || only.includes(w.id));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  let failed = false;
  try {
    for (const world of worlds) {
      const checks = await reviewWorld(browser, baseUrl, world);
      console.warn(`\n${world.name}`);
      for (const c of checks) {
        if (!c.ok) failed = true;
        console.warn(`  ${c.ok ? 'ok  ' : 'FAIL'} ${c.name}${c.detail ? ` - ${c.detail}` : ''}`);
      }
    }
  } finally {
    await browser.close();
  }
  console.warn(`\nScreenshots: .screenshots/review/ (compare with docs/images/)`);
  process.exit(failed ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`)
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
