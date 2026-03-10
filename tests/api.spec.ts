/**
 * @file api.spec.ts
 * @description Comprehensive API test suite for the Lendsphere application.
 * Covers health checks, authentication, user profiles, loans, and transactions
 * using Playwright's built-in APIRequestContext (no browser required).
 */
import { test, expect } from '@playwright/test';

/**
 * @description Basic API health and login validation tests.
 * These tests verify core server availability and authentication error handling.
 */
test.describe('Basic API Testing @api', () => {

  const HEALTH_ENDPOINT = '/api/health';
  const LOGIN_ENDPOINT = '/api/auth/login';

  /**
   * @description Sends a GET request to the health endpoint and verifies
   * the server responds with a 200 status and a JSON body containing { status: 'ok' }.
   */
  test('GET Request - Check API Health', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT);

    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('status', 'ok');
  });

  /**
   * @description Sends a POST request with invalid credentials to the login endpoint.
   * Verifies the server rejects the request with a 401 status and an appropriate error message.
   */
  test('POST Request - Invalid Login', async ({ request }) => {
    const response = await request.post(LOGIN_ENDPOINT, {
      data: {
        email: 'invalid-api-test@test.com',
        password: 'wrongpassword'
      }
    });

    expect(response.status()).toBe(401);
    expect(response.ok()).toBeFalsy();

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error', 'Invalid email or password');
  });
});

/**
 * @description Authentication API tests covering user registration flows.
 * Includes both successful registration and duplicate email rejection scenarios.
 */
test.describe('Authentication API @auth @api', () => {
  const REGISTER_ENDPOINT = '/api/auth/register';

  /**
   * @description Generates a unique email address using the current timestamp
   * to prevent collisions between test runs.
   * @returns {string} A unique email string in the format test_<timestamp>@example.com
   */
  const getUniqueEmail = () => `test_${Date.now()}@example.com`;

  /**
   * @description Registers a new borrower user with all required fields.
   * Expects a 201 Created response with a success message.
   */
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

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('message', 'Registration successful');
  });

  /**
   * @description Attempts to register two users with the same email address.
   * The first request succeeds, the second must be rejected with a 400 status
   * and an "Email already registered" error.
   */
  test('POST Request - Registration with existing email fails', async ({ request }) => {
    const payload = {
      email: getUniqueEmail(),
      password: 'password123',
      full_name: 'API Auto Tester',
      role: 'borrower'
    };

    await request.post(REGISTER_ENDPOINT, { data: payload });

    const duplicateResponse = await request.post(REGISTER_ENDPOINT, { data: payload });

    expect(duplicateResponse.status()).toBe(400);
    const body = await duplicateResponse.json();
    expect(body).toHaveProperty('error', 'Email already registered');
  });
});

/**
 * @description User profile and authentication flow tests.
 * Uses a persistent APIRequestContext created in beforeAll to maintain
 * authentication cookies across all tests in this suite.
 */
test.describe('User Profile & Auth Flow @users @api', () => {
  let apiContext: any;
  const testUser = {
    email: `profile_${Date.now()}@example.com`,
    password: 'securepassword',
    full_name: 'Profile Tester',
    role: 'borrower'
  };

  /**
   * @description Sets up a persistent request context, registers a test user,
   * and logs in to establish an authenticated session for subsequent tests.
   */
  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: 'http://127.0.0.1:3000'
    });

    await apiContext.post('/api/auth/register', { data: testUser });

    await apiContext.post('/api/auth/login', {
      data: { email: testUser.email, password: testUser.password }
    });
  });

  /**
   * @description Fetches the authenticated user's profile and verifies the response
   * contains the expected email and full name. Also asserts that the password hash
   * is never exposed in the response payload.
   */
  test('GET Request - Fetch User Profile (Authenticated)', async () => {
    const response = await apiContext.get('/api/users/profile');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('email', testUser.email);
    expect(body).toHaveProperty('full_name', testUser.full_name);
    expect(body).not.toHaveProperty('password_hash');
  });

  /**
   * @description Updates the authenticated user's profile with new details,
   * then performs a follow-up GET to verify the changes were persisted
   * in the database.
   */
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

    const verifyRes = await apiContext.get('/api/users/profile');
    const verifyBody = await verifyRes.json();
    expect(verifyBody).toHaveProperty('full_name', 'Updated Profile Tester');
    expect(verifyBody).toHaveProperty('phone', '9998887777');
  });

  /**
   * @description Creates a brand-new unauthenticated request context (no cookies)
   * and attempts to access the protected profile endpoint. Expects a 401 Unauthorized response.
   */
  test('GET Request - Unauthorized access to Profile', async ({ playwright }) => {
    const unauthenticatedRequest = await playwright.request.newContext({
      baseURL: 'http://127.0.0.1:3000'
    });

    const response = await unauthenticatedRequest.get('/api/users/profile');

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty('error', 'Unauthorized');
  });
});

/**
 * @description Loans API tests for marketplace browsing, loan applications,
 * and error handling for non-existent resources.
 * Authenticates as a borrower user in beforeAll.
 */
test.describe('Loans API @loans @api', () => {
  let apiContext: any;
  let borrowerEmail = `borrower_${Date.now()}@test.com`;

  /**
   * @description Creates a persistent request context, registers a borrower user,
   * and logs in to establish an authenticated session for loan-related tests.
   */
  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: 'http://127.0.0.1:3000'
    });

    await apiContext.post('/api/auth/register', {
      data: { email: borrowerEmail, password: 'pass', full_name: 'Borrower Test', role: 'borrower' }
    });

    await apiContext.post('/api/auth/login', {
      data: { email: borrowerEmail, password: 'pass' }
    });
  });

  /**
   * @description Fetches all publicly available loans from the marketplace endpoint.
   * Verifies the response is a 200 OK and the body is a valid JSON array.
   */
  test('GET Request - Fetch all Marketplace Loans', async () => {
    const response = await apiContext.get('/api/loans');

    expect(response.status()).toBe(200);
    const loans = await response.json();
    expect(Array.isArray(loans)).toBeTruthy();
  });

  /**
   * @description Submits a new loan application as an authenticated borrower.
   * Expects a 201 Created response with a success message and a generated loanId.
   */
  test('POST Request - Apply for a Loan', async () => {
    const payload = {
      amount: 10000,
      purpose: 'API Test Business Setup',
      term_months: 24
    };

    const response = await apiContext.post('/api/loans/apply', { data: payload });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('message', 'Loan application submitted successfully');
    expect(body).toHaveProperty('loanId');
  });

  /**
   * @description Attempts to fetch a loan using a non-existent UUID.
   * Expects a 404 Not Found response with a "Loan not found" error message.
   */
  test('GET Request - Fetch a Non-existent Loan', async () => {
    const response = await apiContext.get('/api/loans/invalid-uuid-1234');

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body).toHaveProperty('error', 'Loan not found');
  });
});

/**
 * @description Transactions API tests for wallet deposit, withdrawal,
 * and insufficient balance error handling.
 * Authenticates as a lender user in beforeAll.
 */
test.describe('Transactions API @transactions @api', () => {
  let apiContext: any;
  let userEmail = `wallet_${Date.now()}@test.com`;

  /**
   * @description Creates a persistent request context, registers a lender user,
   * and logs in to establish an authenticated session for transaction tests.
   */
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

  /**
   * @description Deposits 500 units into the authenticated user's wallet.
   * Verifies a 200 response with the updated balance reflecting the deposit.
   */
  test('POST Request - Deposit Funds successfully', async () => {
    const response = await apiContext.post('/api/transactions/deposit', {
      data: { amount: 500 }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('message', 'Deposit successful');
    expect(body).toHaveProperty('balance', 500);
  });

  /**
   * @description Withdraws 100 units from the wallet after a prior deposit of 500.
   * Verifies the response reflects the correct remaining balance of 400.
   */
  test('POST Request - Withdraw Funds successfully', async () => {
    const response = await apiContext.post('/api/transactions/withdraw', {
      data: { amount: 100 }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('message', 'Withdrawal successful');
    expect(body).toHaveProperty('balance', 400);
  });

  /**
   * @description Attempts to withdraw an amount far exceeding the wallet balance.
   * Expects a 400 Bad Request with an "Insufficient balance" error.
   */
  test('POST Request - Withdraw Funds with Insufficient Balance', async () => {
    const response = await apiContext.post('/api/transactions/withdraw', {
      data: { amount: 999999 }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error', 'Insufficient balance');
  });
});
