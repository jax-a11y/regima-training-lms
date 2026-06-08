import { test as base, expect, Page, BrowserContext } from '@playwright/test';

/**
 * Demo user credentials - seeded in MemStorage on server startup
 */
export const DEMO_USER = {
  username: 'demo',
  password: 'password',
  name: 'Dr. Jane Doe',
  role: 'Skincare Specialist',
};

/**
 * Extended test fixtures for authentication
 */
export interface AuthFixtures {
  /**
   * Authenticated page - logs in before each test
   */
  authenticatedPage: Page;
  
  /**
   * Page with stored auth state - faster for subsequent tests
   */
  authedContext: BrowserContext;
}

/**
 * Helper function to perform login
 */
export async function login(page: Page, username: string = DEMO_USER.username, password: string = DEMO_USER.password): Promise<void> {
  // Navigate to home if not already there
  await page.goto('/');
  
  // Wait for the page to be ready
  await page.waitForLoadState('networkidle');
  
  // Check if already logged in by looking for user menu
  const userMenu = page.getByTestId('button-user-menu');
  const isLoggedIn = await userMenu.isVisible().catch(() => false);
  
  if (isLoggedIn) {
    // Already logged in
    return;
  }
  
  // Click login button
  const loginButton = page.getByTestId('button-login');
  
  if (await loginButton.isVisible()) {
    await loginButton.click();
  }
  
  // Wait for login dialog and fill in credentials
  await page.getByTestId('input-username').fill(username);
  await page.getByTestId('input-password').fill(password);
  
  // Submit the form
  await page.getByTestId('button-submit-login').click();
  
  // Wait for successful login - look for user menu to appear
  await expect(page.getByTestId('button-user-menu')).toBeVisible({ timeout: 10000 });
}

/**
 * Helper function to perform logout
 */
export async function logout(page: Page): Promise<void> {
  // Click on user menu
  const userMenu = page.getByTestId('button-user-menu');
  
  if (await userMenu.isVisible()) {
    await userMenu.click();
    
    // Click logout button in dropdown
    await page.getByTestId('button-logout').click();
    
    // Wait for login button to appear
    await expect(page.getByTestId('button-login')).toBeVisible({ timeout: 10000 });
  }
}

/**
 * Test extension with authentication fixtures
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await login(page);
    await use(page);
  },
  
  authedContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(page);
    await page.context().storageState({ path: '/tmp/auth-state.json' });
    await use(context);
    await context.close();
  },
});

export { expect };
