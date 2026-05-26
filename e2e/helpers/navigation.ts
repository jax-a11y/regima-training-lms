import { Page, expect } from '@playwright/test';

/**
 * Navigation routes in the application
 */
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/',
  MODULES: '/modules',
  LESSON: (id: number) => `/lesson/${id}`,
  INGREDIENTS: '/ingredients',
  PRODUCTS: '/products',
  ABOUT: '/about',
  HELP: '/help',
} as const;

/**
 * Wait for the application to be fully loaded
 */
export async function waitForAppReady(page: Page): Promise<void> {
  // Wait for hydration to complete
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for React to finish rendering (no loading spinner)
  const loadingIndicator = page.getByRole('status').or(page.locator('[aria-busy="true"]'));
  
  // If there's a loading indicator, wait for it to disappear
  if (await loadingIndicator.isVisible().catch(() => false)) {
    await expect(loadingIndicator).not.toBeVisible({ timeout: 30000 });
  }
  
  // Additional wait for network to settle
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to a route and wait for it to be ready
 */
export async function navigateTo(page: Page, route: string): Promise<void> {
  await page.goto(route);
  await waitForAppReady(page);
}

/**
 * Click a navigation link and wait for navigation
 */
export async function clickNavLink(page: Page, linkText: string | RegExp): Promise<void> {
  await page.getByRole('link', { name: linkText }).click();
  await waitForAppReady(page);
}

/**
 * Verify current route
 */
export async function expectRoute(page: Page, route: string): Promise<void> {
  await expect(page).toHaveURL(new RegExp(route.replace(/\//g, '\\/')));
}

/**
 * Check if mobile navigation is visible
 */
export async function isMobileNav(page: Page): Promise<boolean> {
  const mobileMenu = page.getByTestId('mobile-menu-button').or(page.getByRole('button', { name: /menu/i }));
  return mobileMenu.isVisible();
}

/**
 * Open mobile menu if on mobile viewport
 */
export async function openMobileMenuIfNeeded(page: Page): Promise<void> {
  const mobileMenuButton = page.getByTestId('mobile-menu-button').or(page.getByRole('button', { name: /menu/i }));
  
  if (await mobileMenuButton.isVisible()) {
    await mobileMenuButton.click();
    // Wait for menu to open
    await expect(page.getByRole('navigation').or(page.getByTestId('mobile-nav'))).toBeVisible();
  }
}

/**
 * Close mobile menu if open
 */
export async function closeMobileMenuIfNeeded(page: Page): Promise<void> {
  const closeButton = page.getByTestId('mobile-menu-close').or(page.getByRole('button', { name: /close/i }));
  
  if (await closeButton.isVisible()) {
    await closeButton.click();
  }
}
