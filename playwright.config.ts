import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for RegimA Training System E2E tests.
 * 
 * Usage:
 *   - Smoke tests (CI): npx playwright test --project=chromium-smoke
 *   - Full suite: npx playwright test
 *   - Exhaustive cross-browser: npx playwright test --config=playwright.exhaustive.config.ts
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e/specs',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only to handle flaky tests */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI to reduce resource contention */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use */
  reporter: process.env.CI 
    ? [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['github'],
        ['list']
      ]
    : [
        ['html', { outputFolder: 'playwright-report', open: 'on-failure' }],
        ['list']
      ],
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5000',
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Capture screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on first retry */
    video: 'on-first-retry',
    
    /* Set a reasonable timeout for actions */
    actionTimeout: 15000,
    
    /* Set navigation timeout */
    navigationTimeout: 30000,
  },
  
  /* Global timeout for each test */
  timeout: 60000,
  
  /* Expect timeout */
  expect: {
    timeout: 10000,
  },

  /* Configure projects for major browsers */
  projects: [
    /* Smoke tests - Chromium only for fast CI feedback */
    {
      name: 'chromium-smoke',
      use: { 
        ...devices['Desktop Chrome'],
      },
      grep: /@smoke/,
      grepInvert: /@skip-ci/,
    },
    
    /* Full Chromium tests */
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
      },
      grepInvert: /@skip-ci/,
    },
    
    /* Desktop Safari - exhaustive runs */
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
      },
      grepInvert: /@skip-ci/,
    },

    /* Mobile Chrome - exhaustive runs */
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
      },
      grepInvert: /@skip-ci|@desktop-only/,
    },
    
    /* Mobile Safari - exhaustive runs */
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
      },
      grepInvert: /@skip-ci|@desktop-only/,
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NODE_ENV: 'development',
    },
  },
});
