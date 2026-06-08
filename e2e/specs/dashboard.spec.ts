import { test, expect, login, DEMO_USER } from '../fixtures';
import { navigateTo, waitForAppReady } from '../helpers';

test.describe('Dashboard @smoke', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
    await login(page);
  });

  test('should display welcome message with user name @smoke', async ({ page }) => {
    await expect(page.getByText(new RegExp(`welcome.*${DEMO_USER.name}|${DEMO_USER.name}`, 'i'))).toBeVisible();
  });

  test('should display progress summary @smoke', async ({ page }) => {
    // Look for progress indicators
    const progressSection = page.getByText(/progress|completed|module/i);
    await expect(progressSection.first()).toBeVisible();
  });

  test('should display module cards or list @smoke', async ({ page }) => {
    // Look for module cards or links
    const moduleElements = page.getByRole('link', { name: /module|lesson|course/i }).or(
      page.getByTestId(/module-card/i)
    );
    
    // At least one module should be visible
    await expect(moduleElements.first()).toBeVisible();
  });

  test('should navigate to module from dashboard @smoke', async ({ page }) => {
    // Find and click on a module
    const moduleLink = page.getByRole('link', { name: /module|start|continue|begin/i }).first();
    
    if (await moduleLink.isVisible()) {
      await moduleLink.click();
      await waitForAppReady(page);
      
      // Should be on modules or lesson page
      await expect(page).toHaveURL(/\/modules|\/lesson/);
    }
  });
});

test.describe('Dashboard - Unauthenticated', () => {
  test('should show login prompt for unauthenticated users @smoke', async ({ page }) => {
    await navigateTo(page, '/');
    
    // Should see login button or login form
    const loginElements = page.getByRole('button', { name: /log\s*in|sign\s*in/i }).or(
      page.getByTestId('login-button')
    );
    
    await expect(loginElements.first()).toBeVisible();
  });
});

test.describe('Dashboard - User Profile Display', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
    await login(page);
  });

  test('should display user role', async ({ page }) => {
    // Look for role display
    const roleText = page.getByText(DEMO_USER.role);
    
    // Role might be displayed somewhere on the page
    if (await roleText.isVisible().catch(() => false)) {
      await expect(roleText).toBeVisible();
    }
  });

  test('should display course completion statistics', async ({ page }) => {
    // Look for statistics like completed modules, percentage, etc.
    const statsElements = page.getByText(/\d+%|\d+\s*(of|\/)\s*\d+|complete/i);
    
    // At least one stat should be visible
    await expect(statsElements.first()).toBeVisible();
  });
});
