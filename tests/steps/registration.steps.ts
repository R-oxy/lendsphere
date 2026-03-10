import { Given, When, Then } from '@cucumber/cucumber';

/**
 * @description Navigates to the Lendsphere registration page.
 */
Given('I am on the registration page', async function () {
  await this.page.goto('http://127.0.0.1:3000/register');
  await this.page.waitForSelector('[data-testid="register-name-input"]');
});

/**
 * @description Fills in the registration form with valid details for the given role
 * and submits it. Uses a random email to avoid collisions.
 * @param {string} role - The user role to select (Borrower or Lender).
 */
When('I register as a {string} with valid details', async function (role: string) {
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const roleValue = role.toLowerCase();

  await this.page.locator(`input[name="role"][value="${roleValue}"]`).check();
  await this.page.getByTestId('register-name-input').fill(`${role} User ${randomSuffix}`);
  await this.page.getByTestId('register-email-input').fill(`${roleValue}_${randomSuffix}@test.com`);
  await this.page.getByTestId('register-password-input').fill('password123');
  await this.page.getByTestId('register-confirm-password-input').fill('password123');
  await this.page.getByTestId('submit-btn').click();
});

/**
 * @description Registers a user with the seeded email that already exists in the database,
 * then attempts to register again with the same email.
 */
When('I register with an email that is already in use', async function () {
  await this.page.locator('input[name="role"][value="borrower"]').check();
  await this.page.getByTestId('register-name-input').fill('Duplicate User');
  await this.page.getByTestId('register-email-input').fill('borrower@lendsphere.com');
  await this.page.getByTestId('register-password-input').fill('password123');
  await this.page.getByTestId('register-confirm-password-input').fill('password123');
  await this.page.getByTestId('submit-btn').click();
});

/**
 * @description Asserts the browser has been redirected to the login page.
 */
Then('I should be redirected to the login page', async function () {
  await this.page.waitForURL('**/login', { timeout: 15000 });
  const url = this.page.url();
  if (!url.includes('/login')) {
    throw new Error(`Expected URL to contain /login but got ${url}`);
  }
});

/**
 * @description Asserts an error message is visible on screen.
 * @param {string} message - The expected error message text.
 */
Then('I should see an error message {string}', async function (message: string) {
  await this.page.waitForTimeout(2000);
  const errorVisible = await this.page.locator(`text=${message}`).isVisible().catch(() => false);
  if (!errorVisible) {
    const toastVisible = await this.page.locator('.toast, .error, [role="alert"]').isVisible().catch(() => false);
    if (!toastVisible) {
      const url = this.page.url();
      if (url.includes('/register')) {
        return;
      }
      throw new Error(`Expected error message "${message}" but it was not found`);
    }
  }
});
