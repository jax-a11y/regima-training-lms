# Testing Guide

This document describes how to run tests for the RegimA Training System.

## Table of Contents

- [Prerequisites](#prerequisites)
- [E2E Testing with Playwright](#e2e-testing-with-playwright)
- [Running Tests Locally](#running-tests-locally)
- [CI/CD Workflows](#cicd-workflows)
- [Writing Tests](#writing-tests)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager
- For local development: the app should be able to start on port 5000

## E2E Testing with Playwright

We use [Playwright](https://playwright.dev/) for end-to-end testing. Playwright tests verify the application works correctly from a user's perspective across different browsers.

### Installing Test Dependencies

```bash
# Install project dependencies (includes Playwright)
npm install

# Install browser binaries
npx playwright install chromium  # For smoke tests
npx playwright install           # For full browser suite
```

## Running Tests Locally

### Smoke Tests (Quick Feedback)

Run the smoke test suite with Chromium only - these are the critical path tests:

```bash
npm run test:e2e:smoke
```

### Full Test Suite

Run all tests with the default browser (Chromium):

```bash
npm run test:e2e
```

### Interactive UI Mode

Debug and explore tests with Playwright's UI:

```bash
npm run test:e2e:ui
```

### Debug Mode

Step through tests with the debugger:

```bash
npm run test:e2e:debug
```

### View Test Report

After running tests, view the HTML report:

```bash
npm run test:e2e:report
```

### Exhaustive Cross-Browser Tests

Run the full test suite across all browsers (Chromium, Firefox, WebKit):

```bash
npm run test:e2e:exhaustive
```

## CI/CD Workflows

### Primary CI Workflow (`ci.yml`)

Runs on every pull request and push to main branches:

1. **Build & Type Check** - Validates TypeScript and builds the application
2. **E2E Smoke Tests** - Runs critical path tests with Chromium

This workflow provides fast feedback (typically < 5 minutes) on whether changes break core functionality.

### Exhaustive E2E Workflow (`e2e-exhaustive.yml`)

Runs:
- Nightly at 2 AM UTC
- On manual dispatch
- On pushes to main (when client/server/e2e files change)

Features:
- Full cross-browser testing (Chromium, Firefox, WebKit)
- Mobile viewport testing
- Parallel execution with sharding
- Comprehensive artifact collection

To manually trigger:

```bash
# Via GitHub CLI
gh workflow run e2e-exhaustive.yml

# With specific browsers
gh workflow run e2e-exhaustive.yml -f browsers=chromium,firefox
```

## Writing Tests

### Test Structure

Tests are organized in `e2e/specs/`:

```
e2e/
├── fixtures/           # Test fixtures (auth, etc.)
│   ├── auth.fixture.ts
│   └── index.ts
├── helpers/            # Helper utilities
│   ├── navigation.ts
│   ├── api.ts
│   └── index.ts
└── specs/              # Test specifications
    ├── auth.spec.ts
    ├── navigation.spec.ts
    ├── dashboard.spec.ts
    ├── modules.spec.ts
    ├── lesson.spec.ts
    ├── ingredients.spec.ts
    ├── products.spec.ts
    ├── informational.spec.ts
    └── api.spec.ts
```

### Test Tags

Use tags to categorize tests:

- `@smoke` - Critical path tests that run on every PR
- `@desktop-only` - Tests that only run on desktop viewports
- `@mobile-only` - Tests that only run on mobile viewports
- `@skip-ci` - Tests to skip in CI (e.g., flaky or WIP)

Example:

```typescript
test('should login successfully @smoke', async ({ page }) => {
  // This test runs in CI smoke suite
});

test('should show desktop navigation @desktop-only', async ({ page }) => {
  // This test skipped on mobile viewports
});
```

### Using Fixtures

The auth fixture provides authenticated page context:

```typescript
import { test, expect, login, DEMO_USER } from '../fixtures';

test('authenticated test', async ({ page }) => {
  await login(page);
  // User is now logged in
});

// Or use the fixture directly
test('use authenticated page', async ({ authenticatedPage }) => {
  // Already logged in
  await expect(authenticatedPage.getByText(DEMO_USER.name)).toBeVisible();
});
```

### Demo User Credentials

The application seeds a demo user for testing:

- **Username**: `demo`
- **Password**: `password`
- **Name**: Dr. Jane Doe
- **Role**: Skincare Specialist

### Using Selectors

Prefer stable selectors in order of preference:

1. `data-testid` attributes
2. ARIA roles with accessible names
3. Text content (for static text)
4. CSS selectors (last resort)

```typescript
// Best - data-testid
page.getByTestId('login-button')

// Good - ARIA role
page.getByRole('button', { name: /log in/i })

// Acceptable - text content
page.getByText('Welcome')

// Avoid - CSS selectors (fragile)
page.locator('.btn-primary')
```

## Troubleshooting

### Tests Failing Locally but Passing in CI

1. Ensure you're running the latest dependencies: `npm ci`
2. Clear Playwright cache: `rm -rf playwright/.cache`
3. Install browsers: `npx playwright install`

### Timeout Errors

Increase timeout in test or config:

```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});
```

### Flaky Tests

1. Add explicit waits for elements
2. Use `expect().toBeVisible()` instead of relying on implicit waits
3. Wait for network to settle: `await page.waitForLoadState('networkidle')`

### Viewing Traces

Traces are captured on test failure. To view:

1. Find the trace file in `test-results/`
2. Open with: `npx playwright show-trace path/to/trace.zip`

Or enable trace for all tests in config:

```typescript
use: {
  trace: 'on', // Always capture traces
}
```

### CI Artifacts

When tests fail in CI:
1. Download the `playwright-report-*` artifact
2. Extract and open `index.html` in a browser
3. Review failed tests with screenshots and traces

## Best Practices

1. **Keep smoke tests fast** - Under 5 minutes total
2. **Use explicit waits** - Don't rely on implicit timeouts
3. **Test user journeys** - Not implementation details
4. **Isolate tests** - Each test should be independent
5. **Clean up state** - Use `beforeEach` to reset state
6. **Add data-testid** - For elements that need stable selectors
7. **Document flaky tests** - Use `@skip-ci` tag with comments

## Adding New Tests

1. Create a new spec file in `e2e/specs/`
2. Import fixtures and helpers
3. Tag smoke tests with `@smoke`
4. Test locally: `npm run test:e2e -- path/to/test.spec.ts`
5. Submit PR - CI will validate

## Questions?

See the [Playwright documentation](https://playwright.dev/docs/intro) or open an issue.
