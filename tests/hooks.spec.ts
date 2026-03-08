import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

// Grouping related tests together. We can tag this entire group with @regression
test.describe('Hooks, Groups, and Annotations @regression', () => {
  
  // HOOK: runs ONCE before all tests in this describe block
  test.beforeAll(async () => {
    console.log('--- Starting execution of Hooks & Annotations Suite ---');
    // Useful for setting up databases, starting servers, or fetching auth tokens
  });

  // HOOK: runs before EACH test in this describe block
  test.beforeEach(async ({ page }) => {
    console.log(`Navigating to the login page before the test...`);
    // Example of POM reuse: We navigate to the login page before every test saves repetition
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // HOOK: runs after EACH test
  test.afterEach(async ({ page }, testInfo) => {
    console.log(`Finished test: ${testInfo.title} with status ${testInfo.status}`);
    // Useful for taking screenshots conditionally or cleaning up test-specific state
  });

  // HOOK: runs ONCE after all tests in this describe block
  test.afterAll(async () => {
    console.log('--- Finished execution of Hooks & Annotations Suite ---');
    // Useful for tearing down databases or closing connections
  });

  // 1. Regular test
  test('Normal test execution', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await expect(loginPage.submitButton).toBeVisible();
  });

  // 2. Skipped test - test.skip() ignores this test during execution
  test.skip('This test is skipped', async ({ page }) => {
    // This code will not run! Useful for tests that are currently broken but shouldn't fail the pipeline
    await page.goto('/register');
  });

  // 3. Failing test - test.fail() marks the test as expecting to fail
  test.fail('This test is expected to fail', async ({ page }) => {
    const loginPage = new LoginPage(page);
    // We expect the button to have 'Wrong Text', which isn't true. 
    // Because of test.fail(), Playwright will pass the test RUN since it failed as expected!
    await expect(loginPage.submitButton).toHaveText('Wrong Text', { timeout: 1000 });
  });

  // 4. Fixme annotation - similar to skip, but semantically means "this needs a fix"
  test.fixme('This test needs fixing', async ({ page }) => {
    // Test logic goes here...
  });

  // 5. Only annotation (You can uncomment to try it out)
  // test.only('This is the ONLY test that will run in this file', async ({ page }) => {
  //   console.log('Running standalone test!');
  // });
});
