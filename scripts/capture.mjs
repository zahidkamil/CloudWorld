// Development-only visual capture used for milestone reviews.
// Usage: node scripts/capture.mjs <url> <output.png> [width] [height] [waitMs] [clickSelector]
import { chromium } from '@playwright/test';

const [
  url = 'http://localhost:4173/CloudWorld/',
  out = '.screenshots/capture.png',
  w = '1440',
  h = '900',
  wait = '1500',
  click,
] = process.argv.slice(2);

const browser = await chromium.launch({
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({
  viewport: { width: Number(w), height: Number(h) },
  deviceScaleFactor: 1,
});
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(url);
if (click) {
  for (const sel of click.split('|')) {
    await page.locator(sel).first().click();
    await page.waitForTimeout(400);
  }
}
await page.waitForTimeout(Number(wait));
await page.screenshot({ path: out });
await browser.close();
console.warn(`saved ${out}${errors.length ? `\nconsole errors:\n${errors.join('\n')}` : ''}`);
