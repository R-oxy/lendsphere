import { test, expect } from '@playwright/test';

test('Basic navigation works', async ({ page }) => {
  // Navigate to the root URL (uses baseURL from playwright.config.ts)
  await page.goto('/');

  // Verify that the page loads by checking the title or a prominent element.
  // We'll check if the body is visible and the page URL is correct.
  await expect(page.locator('body')).toBeVisible();
  
  // Lendsphere's homepage might redirect depending on auth state, 
  // but let's just assert that it loaded without errors
  const currentUrl = page.url();
  expect(currentUrl).toContain('http://127.0.0.1:3000/');
});
