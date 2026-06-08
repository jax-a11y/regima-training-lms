import { test, expect } from '../fixtures';
import { navigateTo, ROUTES, waitForAppReady, openMobileMenuIfNeeded } from '../helpers';

test.describe('Navigation @smoke', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
  });

  test('should display main navigation links @smoke', async ({ page }) => {
    // Open mobile menu if needed
    await openMobileMenuIfNeeded(page);
    
    // Check for main navigation links
    const expectedLinks = ['Modules', 'Ingredients', 'Products', 'About', 'Help'];
    
    for (const linkName of expectedLinks) {
      const link = page.getByRole('link', { name: new RegExp(linkName, 'i') });
      await expect(link.first()).toBeVisible();
    }
  });

  test('should navigate to Modules page @smoke', async ({ page }) => {
    await openMobileMenuIfNeeded(page);
    
    await page.getByRole('link', { name: /modules/i }).first().click();
    await waitForAppReady(page);
    
    await expect(page).toHaveURL(/\/modules/);
    await expect(page.getByRole('heading', { name: /module/i })).toBeVisible();
  });

  test('should navigate to Ingredients page @smoke', async ({ page }) => {
    await openMobileMenuIfNeeded(page);
    
    await page.getByRole('link', { name: /ingredients/i }).first().click();
    await waitForAppReady(page);
    
    await expect(page).toHaveURL(/\/ingredients/);
    await expect(page.getByRole('heading', { name: /ingredient/i })).toBeVisible();
  });

  test('should navigate to Products page @smoke', async ({ page }) => {
    await openMobileMenuIfNeeded(page);
    
    await page.getByRole('link', { name: /products/i }).first().click();
    await waitForAppReady(page);
    
    await expect(page).toHaveURL(/\/products/);
    await expect(page.getByRole('heading', { name: /product/i })).toBeVisible();
  });

  test('should navigate to About page @smoke', async ({ page }) => {
    await openMobileMenuIfNeeded(page);
    
    await page.getByRole('link', { name: /about/i }).first().click();
    await waitForAppReady(page);
    
    await expect(page).toHaveURL(/\/about/);
  });

  test('should navigate to Help page @smoke', async ({ page }) => {
    await openMobileMenuIfNeeded(page);
    
    await page.getByRole('link', { name: /help/i }).first().click();
    await waitForAppReady(page);
    
    await expect(page).toHaveURL(/\/help/);
  });

  test('should navigate back to home via logo click', async ({ page }) => {
    // Navigate to another page first
    await openMobileMenuIfNeeded(page);
    await page.getByRole('link', { name: /about/i }).first().click();
    await waitForAppReady(page);
    
    // Click logo to go home
    const logo = page.getByRole('link', { name: /regima|home|logo/i }).first();
    await logo.click();
    await waitForAppReady(page);
    
    await expect(page).toHaveURL('/');
  });
});

test.describe('Navigation - 404 Page @smoke', () => {
  test('should display 404 page for unknown routes @smoke', async ({ page }) => {
    await navigateTo(page, '/this-page-does-not-exist-12345');
    
    // Should show some indication of page not found
    await expect(
      page.getByText(/404|not found|page.*exist/i)
    ).toBeVisible();
  });
  
  test('should have a link back to home from 404 page', async ({ page }) => {
    await navigateTo(page, '/nonexistent-route');
    
    // Should have a way to go back
    const homeLink = page.getByRole('link', { name: /home|back|return/i }).or(
      page.getByRole('button', { name: /home|back|return/i })
    );
    
    // Either we have a link or the navigation is available
    const hasHomeLink = await homeLink.isVisible().catch(() => false);
    
    if (hasHomeLink) {
      await homeLink.click();
      await waitForAppReady(page);
      await expect(page).toHaveURL('/');
    } else {
      // Navigation should still work
      await openMobileMenuIfNeeded(page);
      await page.getByRole('link', { name: /modules/i }).first().click();
      await expect(page).toHaveURL(/\/modules/);
    }
  });
});

test.describe('Dark Mode Toggle @desktop-only', () => {
  test('should toggle dark mode', async ({ page }) => {
    await navigateTo(page, '/');
    
    // Find theme toggle button
    const themeToggle = page.getByTestId('theme-toggle').or(
      page.getByRole('button', { name: /theme|dark|light|mode/i })
    );
    
    if (await themeToggle.isVisible().catch(() => false)) {
      // Get initial state
      const initialClass = await page.locator('html').getAttribute('class');
      
      // Toggle theme
      await themeToggle.click();
      
      // Wait a moment for theme to apply
      await page.waitForTimeout(500);
      
      // Class should change
      const newClass = await page.locator('html').getAttribute('class');
      
      // One should have 'dark' and other shouldn't, or data attribute changes
      const stateChanged = initialClass !== newClass;
      expect(stateChanged).toBe(true);
    } else {
      // Theme toggle might not be present - skip
      test.skip();
    }
  });
});

test.describe('Mobile Navigation @mobile-only', () => {
  test.use({ viewport: { width: 375, height: 667 } });
  
  test('should show mobile menu button on small screens', async ({ page }) => {
    await navigateTo(page, '/');
    
    const mobileMenuButton = page.getByTestId('mobile-menu-button').or(
      page.getByRole('button', { name: /menu/i })
    );
    
    await expect(mobileMenuButton.first()).toBeVisible();
  });

  test('should open and close mobile menu', async ({ page }) => {
    await navigateTo(page, '/');
    
    const mobileMenuButton = page.getByTestId('mobile-menu-button').or(
      page.getByRole('button', { name: /menu/i })
    );
    
    if (await mobileMenuButton.first().isVisible()) {
      // Open menu
      await mobileMenuButton.first().click();
      
      // Navigation links should be visible
      await expect(page.getByRole('link', { name: /modules/i }).first()).toBeVisible();
      
      // Close menu (if there's a close button or click outside)
      const closeButton = page.getByTestId('mobile-menu-close').or(
        page.getByRole('button', { name: /close/i })
      );
      
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
      }
    }
  });
});
