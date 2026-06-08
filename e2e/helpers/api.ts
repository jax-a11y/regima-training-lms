import { Page, expect, APIResponse, Response } from '@playwright/test';

/**
 * API endpoints used in tests
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  MODULES: '/api/modules',
  LESSONS: '/api/lessons',
  PROGRESS: '/api/progress',
  NOTES: '/api/notes',
  FEEDBACK: '/api/feedback',
  INGREDIENTS: '/api/ingredients',
  PRODUCTS: '/api/products',
  INTEGRATIONS: {
    STATUS: '/api/integrations/status',
    HEALTH: '/api/integrations/health',
  },
} as const;

/**
 * Wait for an API response and return its data
 */
export async function waitForApiResponse<T = unknown>(
  page: Page,
  urlPattern: string | RegExp,
  options?: { timeout?: number }
): Promise<T> {
  const response = await page.waitForResponse(
    (res) => {
      if (typeof urlPattern === 'string') {
        return res.url().includes(urlPattern);
      }
      return urlPattern.test(res.url());
    },
    { timeout: options?.timeout || 10000 }
  );
  
  return response.json() as Promise<T>;
}

/**
 * Intercept and modify API responses for testing
 */
export async function mockApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  responseData: unknown,
  status: number = 200
): Promise<void> {
  await page.route(urlPattern, async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(responseData),
    });
  });
}

/**
 * Assert that an API call was made
 */
export async function expectApiCall(
  page: Page,
  urlPattern: string | RegExp,
  method: string = 'GET',
  options?: { timeout?: number }
): Promise<Response> {
  const response = await page.waitForResponse(
    (res) => {
      const matchesUrl = typeof urlPattern === 'string' 
        ? res.url().includes(urlPattern)
        : urlPattern.test(res.url());
      const matchesMethod = res.request().method().toUpperCase() === method.toUpperCase();
      return matchesUrl && matchesMethod;
    },
    { timeout: options?.timeout || 10000 }
  );
  
  return response;
}

/**
 * Make a direct API request (for setup/teardown)
 */
export async function apiRequest(
  page: Page,
  method: string,
  url: string,
  data?: unknown
): Promise<APIResponse> {
  const request = page.request;
  
  switch (method.toUpperCase()) {
    case 'GET':
      return request.get(url);
    case 'POST':
      return request.post(url, { data });
    case 'PUT':
      return request.put(url, { data });
    case 'DELETE':
      return request.delete(url);
    case 'PATCH':
      return request.patch(url, { data });
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
}

/**
 * Assert API returns successful response
 */
export async function expectApiSuccess(response: APIResponse): Promise<void> {
  expect(response.status()).toBeGreaterThanOrEqual(200);
  expect(response.status()).toBeLessThan(300);
}

/**
 * Assert API returns error response
 */
export async function expectApiError(response: APIResponse, expectedStatus?: number): Promise<void> {
  if (expectedStatus) {
    expect(response.status()).toBe(expectedStatus);
  } else {
    expect(response.status()).toBeGreaterThanOrEqual(400);
  }
}
