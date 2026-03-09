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
    expect(response.status()).toBe(401);
    expect(response.ok()).toBeFalsy();

    const responseBody = await response.json();
    // Verify our backend returns an error message property
    expect(responseBody).toHaveProperty('error', 'Invalid email or password');
  });
});


test.describe('Authentication API @auth @api', () => {
  const REGISTER_ENDPOINT = '/api/auth/register';

  // Generate unique emails for tests to avoid collision
  const getUniqueEmail = () => `test_${Date.now()}@example.com`;

  test('POST Request - Successful Registration', async ({ request }) => {
    const payload = {
      email: getUniqueEmail(),
      password: 'password123',
      full_name: 'API Auto Tester',
      phone: '1234567890',
      date_of_birth: '1990-01-01',
      country: 'US',
      role: 'borrower'
    };

    const response = await request.post(REGISTER_ENDPOINT, { data: payload });
    
    // 201 Created is the standard status code for successful resource creation
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('message', 'Registration successful');
  });

  test('POST Request - Registration with existing email fails', async ({ request }) => {
    const payload = {
      email: getUniqueEmail(),
      password: 'password123',
      full_name: 'API Auto Tester',
      role: 'borrower'
    };

    // First call succeeds
    await request.post(REGISTER_ENDPOINT, { data: payload });

    // Second call with same email should fail
    const duplicateResponse = await request.post(REGISTER_ENDPOINT, { data: payload });
    
    // 400 Bad Request indicates client sent bad data (duplicate email)
    expect(duplicateResponse.status()).toBe(400);
    const body = await duplicateResponse.json();
    expect(body).toHaveProperty('error', 'Email already registered');
  });
});

test.describe('User Profile & Auth Flow @users @api', () => {
  let apiContext: any;
  // Test variables for auth flow
  const testUser = {
    email: `profile_${Date.now()}@example.com`,
    password: 'securepassword',
    full_name: 'Profile Tester',
    role: 'borrower'
  };

  test.beforeAll(async ({ playwright }) => {
    // 1. Create a persistent request context for this suite
    apiContext = await playwright.request.newContext({
      baseURL: 'http://127.0.0.1:3000'
    });

    // 2. Setup: Create a user so we can test the protected endpoints
    await apiContext.post('/api/auth/register', { data: testUser });

    // 3. Setup: Login to get the authentication cookie in the current test's context
    await apiContext.post('/api/auth/login', {
      data: { email: testUser.email, password: testUser.password }
    });
  });

  test('GET Request - Fetch User Profile (Authenticated)', async () => {
    // Because we logged in during beforeAll using this same `apiContext`, 
    // the cookie is automatically attached.
    const response = await apiContext.get('/api/users/profile');
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('email', testUser.email);
    expect(body).toHaveProperty('full_name', testUser.full_name);
    // Ensure password hash is NEVER leaked in profile response
    expect(body).not.toHaveProperty('password_hash');
  });

  test('PUT Request - Update Profile Details', async () => {
    const updatePayload = {
      full_name: 'Updated Profile Tester',
      phone: '9998887777',
      address: '123 API St',
      date_of_birth: '1995-05-05'
    };

    const response = await apiContext.put('/api/users/profile', {
      data: updatePayload
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('message', 'Profile updated successfully');

    // Verify the change persisted
    const verifyRes = await apiContext.get('/api/users/profile');
    const verifyBody = await verifyRes.json();
    expect(verifyBody).toHaveProperty('full_name', 'Updated Profile Tester');
    expect(verifyBody).toHaveProperty('phone', '9998887777');
  });

  test('GET Request - Unauthorized access to Profile', async ({ playwright }) => {
    // Create a brand NEW request context that does NOT have the cookies from beforeAll
    const unauthenticatedRequest = await playwright.request.newContext({
      baseURL: 'http://127.0.0.1:3000'
    });

    const response = await unauthenticatedRequest.get('/api/users/profile');
    
    // Expect 401 Unauthorized
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty('error', 'Unauthorized');
  });
});

test.describe('Loans API @loans @api', () => {
  let apiContext: any;
  let borrowerEmail = `borrower_${Date.now()}@test.com`;
  
  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: 'http://127.0.0.1:3000'
    });

    // Create a borrower to test loan endpoints
    await apiContext.post('/api/auth/register', {
      data: { email: borrowerEmail, password: 'pass', full_name: 'Borrower Test', role: 'borrower' }
    });

    // Login to establish the session for the given request block
    await apiContext.post('/api/auth/login', {
      data: { email: borrowerEmail, password: 'pass' }
    });
  });

  test('GET Request - Fetch all Marketplace Loans', async () => {
    // This endpoint '/' fetches the public marketplace
    const response = await apiContext.get('/api/loans');
    
    expect(response.status()).toBe(200);
    const loans = await response.json();
    // Verify it returns an array
    expect(Array.isArray(loans)).toBeTruthy();
  });

  test('POST Request - Apply for a Loan', async () => {
    const payload = {
      amount: 10000,
      purpose: 'API Test Business Setup',
      term_months: 24
    };

    const response = await apiContext.post('/api/loans/apply', { data: payload });
    
    // 201 Created
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('message', 'Loan application submitted successfully');
    expect(body).toHaveProperty('loanId');
  });

  test('GET Request - Fetch a Non-existent Loan', async () => {
    const response = await apiContext.get('/api/loans/invalid-uuid-1234');
    
    // 404 Not Found
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body).toHaveProperty('error', 'Loan not found');
  });
});

test.describe('Transactions API @transactions @api', () => {
  let apiContext: any;
  let userEmail = `wallet_${Date.now()}@test.com`;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: 'http://127.0.0.1:3000'
    });

    await apiContext.post('/api/auth/register', {
      data: { email: userEmail, password: 'pw', full_name: 'Lender Test', role: 'lender' }
    });

    await apiContext.post('/api/auth/login', {
      data: { email: userEmail, password: 'pw' }
    });
  });

  test('POST Request - Deposit Funds successfully', async () => {
    const response = await apiContext.post('/api/transactions/deposit', {
      data: { amount: 500 }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('message', 'Deposit successful');
    expect(body).toHaveProperty('balance', 500); // Because they started at 0
  });

  test('POST Request - Withdraw Funds successfully', async () => {
    const response = await apiContext.post('/api/transactions/withdraw', {
      data: { amount: 100 }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('message', 'Withdrawal successful');
    expect(body).toHaveProperty('balance', 400); // 500 - 100
  });

  test('POST Request - Withdraw Funds with Insufficient Balance', async () => {
    const response = await apiContext.post('/api/transactions/withdraw', {
      data: { amount: 999999 } // Attempting to withdraw more than they have
    });

    // 400 Bad Request
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error', 'Insufficient balance');
  });
});
