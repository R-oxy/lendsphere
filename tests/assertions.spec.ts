import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('Demonstrating Assertions @smoke', () => {
  test('Various assertions on the Login Page', async ({ page }) => {
    // Using our previously created Page Object Model
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // 1. toHaveURL - Validates the page URL matches a regular expression or string
    await expect(page).toHaveURL(/.*login/);

    // 2. toBeVisible - Checks if an element is visible in the DOM and not hidden
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();

    // 3. toHaveText - Checks if an element contains the expected text
    const heading = page.locator('h2');
    await expect(heading).toHaveText('Sign in to your account');

    // 4. toHaveCount - Asserts the number of elements matching the locator
    // There are 3 inputs on the login page: email, password, and the "remember me" checkbox
    const inputs = page.locator('input');
    await expect(inputs).toHaveCount(3);

    // 5. Soft Assertions - A failing soft assertion does NOT stop test execution.
    // The test will continue running the next lines, but will still be marked as "failed" at the end.
    await expect.soft(loginPage.submitButton).toHaveText('Sign in');
    await expect.soft(loginPage.submitButton).toBeEnabled();
  });
});
