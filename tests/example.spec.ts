/**
 * @file example.spec.ts
 * @description A minimal smoke test that verifies basic browser navigation
 * to the Lendsphere application root URL. Confirms the dev server is
 * reachable and the page renders without critical errors.
 */
import { test, expect } from '@playwright/test';

/**
 * @description Navigates to the application root and asserts the page loaded
 * successfully by checking body visibility and the current URL.
 */
test('Basic navigation works', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('body')).toBeVisible();

  const currentUrl = page.url();
  expect(currentUrl).toContain('http://127.0.0.1:3000/');
});
