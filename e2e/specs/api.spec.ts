import { test, expect } from '@playwright/test';
import { API_ENDPOINTS } from '../helpers/api';

test.describe('API Health Checks @smoke', () => {
  test('should return healthy status from integrations health endpoint @smoke', async ({ request }) => {
    const response = await request.get('/api/integrations/health');
    
    // Should return 200 OK
    expect(response.status()).toBe(200);
    
    // Should have healthy status
    const body = await response.json();
    expect(body).toHaveProperty('healthy');
  });

  test('should return status from integrations status endpoint @smoke', async ({ request }) => {
    const response = await request.get('/api/integrations/status');
    
    // Should return 200 OK
    expect(response.status()).toBe(200);
    
    // Should have status object
    const body = await response.json();
    expect(body).toBeDefined();
  });

  test('should return modules list from API @smoke', async ({ request }) => {
    const response = await request.get('/api/modules');
    
    // Should return 200 OK
    expect(response.status()).toBe(200);
    
    // Should return an array
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('should return ingredients from API @smoke', async ({ request }) => {
    const response = await request.get('/api/ingredients');
    
    // Should return 200 OK
    expect(response.status()).toBe(200);
    
    // Should have data
    const body = await response.json();
    expect(body).toBeDefined();
  });

  test('should return products from API @smoke', async ({ request }) => {
    const response = await request.get('/api/products');
    
    // Should return 200 OK
    expect(response.status()).toBe(200);
    
    // Should have data
    const body = await response.json();
    expect(body).toBeDefined();
  });
});

test.describe('Authentication API', () => {
  test('should return 401 for unauthenticated /api/auth/me @smoke', async ({ request }) => {
    const response = await request.get('/api/auth/me');
    
    // Should return 401 Unauthorized when not logged in
    expect(response.status()).toBe(401);
  });

  test('should successfully login with valid credentials @smoke', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        username: 'demo',
        password: 'password'
      }
    });
    
    // Should return 200 OK
    expect(response.status()).toBe(200);
    
    // Should return user data
    const body = await response.json();
    expect(body).toHaveProperty('username', 'demo');
    expect(body).toHaveProperty('name');
  });

  test('should fail login with invalid credentials', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        username: 'invalid',
        password: 'wrong'
      }
    });
    
    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);
  });

  test('should successfully logout', async ({ request }) => {
    // First login
    await request.post('/api/auth/login', {
      data: {
        username: 'demo',
        password: 'password'
      }
    });
    
    // Then logout
    const response = await request.post('/api/auth/logout');
    
    // Should return 200 OK
    expect(response.status()).toBe(200);
  });
});

test.describe('Protected API Endpoints', () => {
  test('should require auth for progress endpoint', async ({ request }) => {
    const response = await request.post('/api/progress', {
      data: {
        lessonId: 1,
        moduleId: 1,
        completed: true
      }
    });
    
    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);
  });

  test('should require auth for notes endpoint', async ({ request }) => {
    const response = await request.post('/api/notes', {
      data: {
        lessonId: 1,
        content: 'Test note'
      }
    });
    
    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);
  });

  test('should require auth for feedback endpoint', async ({ request }) => {
    const response = await request.post('/api/feedback', {
      data: {
        lessonId: 1,
        rating: 5,
        comment: 'Great lesson!'
      }
    });
    
    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);
  });
});

test.describe('OAuth/Integration Endpoints - Safe Checks', () => {
  test('should handle Shopify app config endpoint gracefully', async ({ request }) => {
    const response = await request.get('/api/shopify/app/config');
    
    // Should return some response (200 or 400/401 if not configured)
    expect([200, 400, 401, 404]).toContain(response.status());
  });

  test('should handle LMS SCORM export without valid module', async ({ request }) => {
    const response = await request.post('/api/lms/scorm/export-module', {
      data: {
        moduleId: 999999 // Non-existent module
      }
    });
    
    // Should return error (404 or 400)
    expect([400, 404, 500]).toContain(response.status());
  });

  test('should handle xAPI statements endpoint', async ({ request }) => {
    const response = await request.get('/api/lms/xapi/local-statements');
    
    // Should return 200 with empty or existing statements
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('statements');
  });
});

test.describe('Error Handling', () => {
  test('should return 404 for non-existent API endpoints', async ({ request }) => {
    const response = await request.get('/api/nonexistent-endpoint-12345');
    
    // Should return 404
    expect(response.status()).toBe(404);
  });

  test('should handle invalid JSON gracefully', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      headers: {
        'Content-Type': 'application/json'
      },
      data: 'invalid json'
    });
    
    // Should return 400 Bad Request or similar
    expect([400, 500]).toContain(response.status());
  });

  test('should return lesson 404 for non-existent lesson', async ({ request }) => {
    const response = await request.get('/api/lessons/999999');
    
    // Should return 404
    expect([404, 400]).toContain(response.status());
  });

  test('should return module 404 for non-existent module', async ({ request }) => {
    const response = await request.get('/api/modules/999999');
    
    // Should return 404
    expect([404, 400]).toContain(response.status());
  });
});
