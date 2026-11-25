import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const PORT = 4173;
// The production build is served under the GitHub Pages base path.
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}/CloudWorld/`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: !isCI,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  // Software WebGL is heavy: too many parallel browsers starve each other of frames and make tests slow.
  workers: isCI ? 1 : 2,
  globalTimeout: 15 * 60 * 1000,
  timeout: 60_000,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.03, animations: 'disabled' },
  },
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
      },
    },
    // Functional tests run on every engine. Pixel baselines (@visual) are Chromium-only
    // because rendering legitimately differs between engines and operating systems.
    {
      name: 'firefox',
      grepInvert: /@visual/,
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1440, height: 900 },
        launchOptions: { firefoxUserPrefs: { 'webgl.force-enabled': true } },
      },
    },
    {
      name: 'webkit',
      grepInvert: /@visual/,
      use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
        url: BASE_URL,
        reuseExistingServer: !isCI,
        timeout: 180_000,
      },
});
