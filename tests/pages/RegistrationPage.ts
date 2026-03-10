/**
 * @file RegistrationPage.ts
 * @description Page Object Model (POM) for the Lendsphere registration page.
 * Encapsulates all locators and user actions related to creating a new account,
 * including role selection (Borrower or Lender).
 */
import { expect, type Locator, type Page } from '@playwright/test';

/**
 * @description Represents the registration page of the Lendsphere application.
 * Provides typed locators for every form field and a high-level registerUser()
 * method that abstracts the entire registration flow into a single call.
 */
export class RegistrationPage {
  readonly page: Page;
  readonly roleBorrowerRadio: Locator;
  readonly roleLenderRadio: Locator;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;

  /**
   * @description Initialises all page locators using data-testid attributes
   * for resilience against UI style changes.
   * @param {Page} page - The Playwright Page instance to bind locators to.
   */
  constructor(page: Page) {
    this.page = page;
    this.roleBorrowerRadio = page.locator('input[name="role"][value="borrower"]');
    this.roleLenderRadio = page.locator('input[name="role"][value="lender"]');
    this.fullNameInput = page.getByTestId('register-name-input');
    this.emailInput = page.getByTestId('register-email-input');
    this.passwordInput = page.getByTestId('register-password-input');
    this.confirmPasswordInput = page.getByTestId('register-confirm-password-input');
    this.submitButton = page.getByTestId('submit-btn');
  }

  /**
   * @description Navigates the browser to the /register route.
   */
  async goto() {
    await this.page.goto('/register');
  }

  /**
   * @description Fills in the registration form and submits it.
   * Selects the appropriate role radio button, populates all text fields,
   * and clicks the submit button.
   * @param {'borrower' | 'lender'} role - The account role to select.
   * @param {string} name - The user's full name.
   * @param {string} email - The user's email address.
   * @param {string} pass - The password (used for both password and confirm fields).
   */
  async registerUser(role: 'borrower' | 'lender', name: string, email: string, pass: string) {
    if (role === 'borrower') {
      await this.roleBorrowerRadio.check();
    } else {
      await this.roleLenderRadio.check();
    }

    await this.fullNameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.confirmPasswordInput.fill(pass);
    await this.submitButton.click();
  }
}
