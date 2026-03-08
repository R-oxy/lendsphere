import { expect, type Locator, type Page } from '@playwright/test';

export class RegistrationPage {
  readonly page: Page;
  readonly roleBorrowerRadio: Locator;
  readonly roleLenderRadio: Locator;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;

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

  async goto() {
    await this.page.goto('/register');
  }

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
