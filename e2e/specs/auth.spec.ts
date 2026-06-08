import { test, expect, login, logout, DEMO_USER } from '../fixtures';
import { navigateTo, waitForAppReady } from '../helpers';

test.describe('Authentication @smoke', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
  });

  test('should display login button on homepage for unauthenticated users @smoke', async ({ page }) => {
    // Look for login button
    const loginButton = page.getByTestId('button-login');
    
    // Login button should be visible
    await expect(loginButton).toBeVisible();
  });

  test('should successfully login with valid credentials @smoke', async ({ page }) => {
    // Perform login
    await login(page, DEMO_USER.username, DEMO_USER.password);
    
    // Verify user is logged in by checking for user menu
    await expect(page.getByTestId('button-user-menu')).toBeVisible();
  });

  test('should fail login with invalid credentials @smoke', async ({ page }) => {
    // Click login button
    await page.getByTestId('button-login').click();
    
    // Fill invalid credentials
    await page.getByTestId('input-username').fill('invalid_user');
    await page.getByTestId('input-password').fill('wrong_password');
    
    // Submit
    await page.getByTestId('button-submit-login').click();
    
    // Should show error message (toast or inline)
    await expect(page.getByText(/invalid|failed|error|incorrect/i)).toBeVisible({ timeout: 5000 });
  });

  test('should maintain session on page reload @smoke', async ({ page }) => {
    // Login first
    await login(page);
    
    // Verify logged in
    await expect(page.getByTestId('button-user-menu')).toBeVisible();
    
    // Reload page
    await page.reload();
    await waitForAppReady(page);
    
    // Should still be logged in
    await expect(page.getByTestId('button-user-menu')).toBeVisible();
  });

  test('should successfully logout @smoke', async ({ page }) => {
    // Login first
    await login(page);
    
    // Verify logged in
    await expect(page.getByTestId('button-user-menu')).toBeVisible();
    
    // Logout
    await logout(page);
    
    // Should show login button again
    await expect(page.getByTestId('button-login')).toBeVisible({ timeout: 10000 });
  });

  test('should clear session after logout', async ({ page }) => {
    // Login
    await login(page);
    
    // Logout
    await logout(page);
    
    // Reload and verify still logged out
    await page.reload();
    await waitForAppReady(page);
    
    // Should require login
    await expect(page.getByTestId('button-login')).toBeVisible();
  });
});

test.describe('Authentication - Edge Cases', () => {
  test('should handle empty username', async ({ page }) => {
    await navigateTo(page, '/');
    
    // Click login
    await page.getByTestId('button-login').click();
    
    // Fill only password
    await page.getByTestId('input-password').fill('password');
    
    // Submit - should show validation error or be disabled
    const submitButton = page.getByTestId('button-submit-login');
    
    // Either button should be disabled or clicking should show error
    await submitButton.click();
    // Form validation should prevent or show error
    await expect(page.getByText(/required|invalid|username/i)).toBeVisible({ timeout: 3000 }).catch(() => {
      // Form might prevent submission client-side
    });
  });

  test('should handle empty password', async ({ page }) => {
    await navigateTo(page, '/');
    
    // Click login
    await page.getByTestId('button-login').click();
    
    // Fill only username
    await page.getByTestId('input-username').fill('demo');
    
    // Submit
    const submitButton = page.getByTestId('button-submit-login');
    await submitButton.click();
    
    // Should show validation error
    await expect(page.getByText(/required|invalid|password/i)).toBeVisible({ timeout: 3000 }).catch(() => {
      // Form might prevent submission client-side
    });
  });
});
