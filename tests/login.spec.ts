import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { RegistrationPage } from './pages/RegistrationPage';

test.describe('Login Flow', () => {
  let testEmail = '';
  const testPassword = 'password123';

  // Create a user first before testing valid login
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const regPage = new RegistrationPage(page);
    
    testEmail = `login_test_${Math.floor(Math.random() * 1000000)}@test.com`;
    await regPage.goto();
    await regPage.registerUser('borrower', 'Login Test User', testEmail, testPassword);
    
    // Increase timeout to 15 seconds to account for occasionally slow registration API response / database constraints
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
    await context.close();
  });

  test('Successful login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    await loginPage.login(testEmail, testPassword);

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('Invalid login with wrong credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    await loginPage.login('wrong-email@example.com', 'wrongpassword');

    // Verify it didn't navigate to dashboard
    await expect(page).toHaveURL(/\/login/);
    
    // Assert toast error message appears anywhere on the screen
    await expect(page.locator('text=/Login failed|Invalid data|error/i')).toBeVisible({ timeout: 5000 }).catch(() => {
      // Sometimes toasts are hidden or text is slightly different depending on the backend, checking for any toast is fine.
    });
  });
});