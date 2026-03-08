import { test, expect } from '@playwright/test';

// API tests do not require a browser, they use Playwright's APIRequestContext
test.describe('Basic API Testing @api', () => {
  
  // Using the baseURL defined in playwright.config.ts
  const HEALTH_ENDPOINT = '/api/health';
  const LOGIN_ENDPOINT = '/api/auth/login';

  test('GET Request - Check API Health', async ({ request }) => {
    // Playwright allows us to make raw HTTP requests
    const response = await request.get(HEALTH_ENDPOINT);
    
    // Assert status code is 200 OK
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    // Parse the JSON body and assert its properties
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('status', 'ok');
  });

  test('POST Request - Invalid Login', async ({ request }) => {
    // Perform a POST request with JSON payload directly
    const response = await request.post(LOGIN_ENDPOINT, {
      data: {
        email: 'invalid-api-test@test.com',
        password: 'wrongpassword'
      }
    });

    // Assert the response is NOT ok (e.g. 400 or 401)
    expect(response.ok()).toBeFalsy();

    const responseBody = await response.json();
    // Verify our backend returns an error message property
    expect(responseBody).toHaveProperty('error');
  });
  
  // Note: For PUT and DELETE, the implementation is very similar.
  // Example structure (demonstration only, these routes may not exist or require auth tokens):
  test.skip('PUT Request - Update Data (Example)', async ({ request }) => {
    const response = await request.put('/api/loans/123', {
      data: { amount: 5000 }
    });
    expect(response.ok()).toBeTruthy();
  });

  test.skip('DELETE Request - Delete Data (Example)', async ({ request }) => {
    const response = await request.delete('/api/loans/123');
    // Using toContain for acceptable deletion status codes
    expect([200, 204]).toContain(response.status()); 
  });
});
