// Browser e2e (A-17…A-23) against the REAL local service started by tests/e2e/global-setup.ts.
// Browser: the installed Google Chrome (`channel: 'chrome'`), nothing downloaded. One worker: the specs
// share one synthetic profile and the service's rate limits.
import { defineConfig } from '@playwright/test';

const phone = { isMobile: true, hasTouch: true };

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: /.*\.spec\.ts$/,
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['json', { outputFile: 'test-results/e2e-results.json' }]],
  use: { channel: 'chrome', headless: true, trace: 'retain-on-failure', screenshot: 'only-on-failure', locale: 'uk-UA' },
  projects: [
    { name: 'desktop-1440', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'tablet-768', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'phone-390', use: { viewport: { width: 390, height: 844 }, ...phone } },
    { name: 'phone-375', use: { viewport: { width: 375, height: 812 }, ...phone } },
    { name: 'phone-320', use: { viewport: { width: 320, height: 640 }, ...phone } },
    { name: 'dark-390', use: { viewport: { width: 390, height: 844 }, colorScheme: 'dark', ...phone } },
  ],
});
