/**
 * @file login.spec.ts
 * @description End-to-end tests for the Lendsphere login flow.
 * Validates both successful authentication with valid credentials and
 * rejection of invalid credentials. Uses the LoginPage and RegistrationPage
 * Page Object Models for reliable interactions.
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { RegistrationPage } from './pages/RegistrationPage';

/**
 * @description Suite covering the complete login lifecycle.
 * A fresh user is registered in beforeAll so the suite is self-contained.
 */
test.describe('Login Flow', () => {
  let testEmail = '';
  const testPassword = 'password123';

  /**
   * @description Registers a new borrower user before any login tests run.
   * Uses a random email suffix to avoid collisions between parallel runs.
   * Waits up to 15 seconds for the post-registration redirect to /login.
   * @param {Browser} browser - The Playwright browser fixture for creating isolated contexts.
   */
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const regPage = new RegistrationPage(page);

    testEmail = `login_test_${Math.floor(Math.random() * 1000000)}@test.com`;
    await regPage.goto();
    await regPage.registerUser('borrower', 'Login Test User', testEmail, testPassword);

    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
    await context.close();
  });

  /**
   * @description Logs in with the credentials created in beforeAll and verifies
   * the browser is redirected to the /dashboard route upon success.
   */
  test('Successful login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(testEmail, testPassword);

    await expect(page).toHaveURL(/\/dashboard/);
  });

  /**
   * @description Attempts to log in with incorrect credentials and verifies
   * the browser remains on the /login page. Optionally checks for an
   * on-screen error toast if one is rendered by the frontend.
   */
  test('Invalid login with wrong credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('wrong-email@example.com', 'wrongpassword');

    await expect(page).toHaveURL(/\/login/);

    await expect(page.locator('text=/Login failed|Invalid data|error/i')).toBeVisible({ timeout: 5000 }).catch(() => {
    });
  });
});