import { test, expect } from '@playwright/test';
import { RegistrationPage } from './pages/RegistrationPage';

test.describe('Registration Flow', () => {
  test('User can register as a Borrower', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();
    
    const randomSuffix = Math.floor(Math.random() * 1000000);
    await regPage.registerUser('borrower', `Borrower ${randomSuffix}`, `borrower${randomSuffix}@test.com`, 'password123');

    // We expect successful redirect to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });

  test('User can register as a Lender', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();
    
    const randomSuffix = Math.floor(Math.random() * 1000000);
    await regPage.registerUser('lender', `Lender ${randomSuffix}`, `lender${randomSuffix}@test.com`, 'password123');

    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });
});
