import { defineConfig, devices } from '@playwright/test';

/**
 * Exhaustive Playwright configuration for comprehensive cross-browser testing.
 * 
 * This configuration runs the full test suite across all browsers and viewports.
 * Used for nightly runs and pre-release verification.
 * 
 * Usage:
 *   npx playwright test --config=playwright.exhaustive.config.ts
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e/specs',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* More retries for exhaustive testing to handle flaky tests */
  retries: process.env.CI ? 3 : 1,
  
  /* Use sharding for parallel execution in CI */
  workers: process.env.CI ? 2 : undefined,
  
  /* Reporter to use - comprehensive for exhaustive runs */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    process.env.CI ? ['github'] : ['list'],
  ],
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5000',
    
    /* Always collect trace for exhaustive runs */
    trace: 'on',
    
    /* Capture screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video for all tests in exhaustive mode */
    video: 'on',
    
    /* Set a reasonable timeout for actions */
    actionTimeout: 20000,
    
    /* Set navigation timeout */
    navigationTimeout: 45000,
  },
  
  /* Longer timeout for exhaustive testing */
  timeout: 90000,
  
  /* Expect timeout */
  expect: {
    timeout: 15000,
  },

  /* Configure projects for all supported browsers and viewports */
  projects: [
    /* Desktop Chrome */
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },
    
    /* Desktop Firefox */
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
      },
    },
    
    /* Desktop Safari */
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
      },
    },

    /* Mobile Chrome */
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
      },
      grepInvert: /@desktop-only/,
    },
    
    /* Mobile Safari */
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
      },
      grepInvert: /@desktop-only/,
    },
    
    /* Tablet */
    {
      name: 'tablet',
      use: { 
        ...devices['iPad (gen 7)'],
      },
      grepInvert: /@desktop-only/,
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
