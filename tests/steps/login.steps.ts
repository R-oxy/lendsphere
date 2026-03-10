/**
 * @file login.steps.ts
 * @description Step definitions for the Login feature file.
 * Maps each Gherkin step (Given/When/Then) to Playwright actions
 * using the LoginPage Page Object Model.
 */
import { Given, When, Then } from '@cucumber/cucumber';

/**
 * @description Navigates to the Lendsphere login page.
 */
Given('I am on the login page', async function () {
  await this.page.goto('http://127.0.0.1:3000/login');
  await this.page.waitForSelector('[data-testid="login-email-input"]');
});

/**
 * @description Fills in the email and password fields with valid test credentials.
 */
When('I enter a valid email and password', async function () {
  await this.page.getByTestId('login-email-input').fill('borrower@lendsphere.com');
  await this.page.getByTestId('login-password-input').fill('password123');
});

/**
 * @description Fills in the email and password fields with invalid credentials.
 */
When('I enter an invalid email and password', async function () {
  await this.page.getByTestId('login-email-input').fill('wrong@example.com');
  await this.page.getByTestId('login-password-input').fill('wrongpassword');
});

/**
 * @description Clicks the Sign in submit button.
 */
When('I click the Sign in button', async function () {
  await this.page.getByTestId('submit-btn').click();
});

/**
 * @description Asserts the user has been redirected to the dashboard page.
 */
Then('I should be redirected to the dashboard', async function () {
  await this.page.waitForURL('**/dashboard', { timeout: 10000 });
  const url = this.page.url();
  if (!url.includes('/dashboard')) {
    throw new Error(`Expected URL to contain /dashboard but got ${url}`);
  }
});

/**
 * @description Asserts the user remains on the login page after a failed attempt.
 */
Then('I should remain on the login page', async function () {
  await this.page.waitForTimeout(2000);
  const url = this.page.url();
  if (!url.includes('/login')) {
    throw new Error(`Expected URL to contain /login but got ${url}`);
  }
});
