/**
 * @file registration.spec.ts
 * @description End-to-end tests for the Lendsphere registration flow.
 * Validates that users can successfully register as either a Borrower
 * or a Lender and are redirected to the login page afterwards.
 * Uses the RegistrationPage Page Object Model for form interactions.
 */
import { test, expect } from '@playwright/test';
import { RegistrationPage } from './pages/RegistrationPage';

/**
 * @description Suite covering the registration lifecycle for both user roles.
 * Each test uses a random email suffix to prevent database collisions.
 */
test.describe('Registration Flow', () => {

  /**
   * @description Registers a new user with the Borrower role and verifies
   * the application redirects to /login upon successful creation.
   * Uses a 15-second timeout to accommodate occasional backend latency.
   */
  test('User can register as a Borrower', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();

    const randomSuffix = Math.floor(Math.random() * 1000000);
    await regPage.registerUser('borrower', `Borrower ${randomSuffix}`, `borrower${randomSuffix}@test.com`, 'password123');

    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });

  /**
   * @description Registers a new user with the Lender role and verifies
   * the application redirects to /login upon successful creation.
   */
  test('User can register as a Lender', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();

    const randomSuffix = Math.floor(Math.random() * 1000000);
    await regPage.registerUser('lender', `Lender ${randomSuffix}`, `lender${randomSuffix}@test.com`, 'password123');

    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });
});
