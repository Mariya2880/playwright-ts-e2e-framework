import { defineConfig, devices } from '@playwright/test';
import { env } from './config/env';
import { STORAGE_STATE } from './tests/auth.setup.paths';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // A stray test.only must never silently shrink the CI run.
  forbidOnly: isCI,
  // 0 retries locally so flaky tests fail loudly; 2 in CI to absorb infra noise.
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }], ['list']]
    : [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: env.uiBaseUrl,
    // Sauce Demo exposes stable `data-test` hooks; map getByTestId() to them.
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      // Logs in once and saves the session; UI tests reuse it instead of logging in every time.
      name: 'setup',
      testDir: './tests',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
    },
    // Cross-browser runs are opt-in (nightly in CI) to keep PR feedback fast.
    ...(process.env.CROSS_BROWSER
      ? [
          {
            name: 'firefox',
            testDir: './tests/ui',
            dependencies: ['setup'],
            use: { ...devices['Desktop Firefox'], storageState: STORAGE_STATE },
          },
          {
            name: 'webkit',
            testDir: './tests/ui',
            dependencies: ['setup'],
            use: { ...devices['Desktop Safari'], storageState: STORAGE_STATE },
          },
        ]
      : []),
    {
      // API tests need no browser: they run on Playwright's request context only.
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: env.apiBaseUrl,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],
});
