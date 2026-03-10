/**
 * @file LoginPage.ts
 * @description Page Object Model (POM) for the Lendsphere login page.
 * Encapsulates all locators and user actions related to signing in,
 * providing a clean API for test files to interact with the login form.
 */
import { expect, type Locator, type Page } from '@playwright/test';

/**
 * @description Represents the login page of the Lendsphere application.
 * Provides typed locators for the email, password, and submit elements,
 * along with high-level methods for navigation and form submission.
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  /**
   * @description Initialises all page locators using data-testid attributes
   * for resilience against UI style changes.
   * @param {Page} page - The Playwright Page instance to bind locators to.
   */
  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('login-email-input');
    this.passwordInput = page.getByTestId('login-password-input');
    this.submitButton = page.getByTestId('submit-btn');
  }

  /**
   * @description Navigates the browser to the /login route.
   */
  async goto() {
    await this.page.goto('/login');
  }

  /**
   * @description Fills in the login form with the provided credentials and submits it.
   * @param {string} email - The user's email address.
   * @param {string} pass - The user's password.
   */
  async login(email: string, pass: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.submitButton.click();
  }
}
