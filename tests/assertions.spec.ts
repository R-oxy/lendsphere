/**
 * @file assertions.spec.ts
 * @description Demonstrates the most common Playwright assertion types
 * against the Lendsphere login page, including soft assertions.
 * Uses the LoginPage Page Object Model for reliable element targeting.
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

/**
 * @description Suite showcasing different assertion methods available in Playwright.
 * Tagged with @smoke for inclusion in quick validation runs.
 */
test.describe('Demonstrating Assertions @smoke', () => {

  /**
   * @description Navigates to the login page and exercises five assertion categories:
   *   1. toHaveURL   – validates the current page URL matches a pattern
   *   2. toBeVisible – confirms an element is rendered and visible in the DOM
   *   3. toHaveText  – checks the exact text content of an element
   *   4. toHaveCount – asserts the total number of elements matching a locator
   *   5. expect.soft – records a failure without stopping the remaining assertions
   */
  test('Various assertions on the Login Page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    /** 1. toHaveURL – validates the page URL matches a regular expression */
    await expect(page).toHaveURL(/.*login/);

    /** 2. toBeVisible – checks if an element is visible in the DOM and not hidden */
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();

    /** 3. toHaveText – checks if an element contains the expected text */
    const heading = page.locator('h2');
    await expect(heading).toHaveText('Sign in to your account');

    /** 4. toHaveCount – asserts the number of elements matching the locator (email, password, remember-me) */
    const inputs = page.locator('input');
    await expect(inputs).toHaveCount(3);

    /** 5. Soft Assertions – a failing soft assertion does NOT stop test execution */
    await expect.soft(loginPage.submitButton).toHaveText('Sign in');
    await expect.soft(loginPage.submitButton).toBeEnabled();
  });
});
