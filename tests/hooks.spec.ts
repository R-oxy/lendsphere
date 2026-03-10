/**
 * @file hooks.spec.ts
 * @description Demonstrates Playwright lifecycle hooks (beforeAll, beforeEach,
 * afterEach, afterAll), test grouping with test.describe, and annotation
 * modifiers (skip, fail, fixme, only).
 * Uses the LoginPage Page Object Model for consistent navigation.
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

/**
 * @description Groups all hook and annotation demonstrations into a single suite.
 * Tagged with @regression for inclusion in full regression test runs.
 */
test.describe('Hooks, Groups, and Annotations @regression', () => {

  /**
   * @description Runs once before all tests in this describe block.
   * Ideal for one-time setup such as database seeding, server startup, or token generation.
   */
  test.beforeAll(async () => {
    console.log('--- Starting execution of Hooks & Annotations Suite ---');
  });

  /**
   * @description Runs before each individual test in this describe block.
   * Navigates to the login page using the POM, eliminating repetitive goto() calls
   * inside every test body.
   * @param {Page} page - The Playwright page fixture injected per test.
   */
  test.beforeEach(async ({ page }) => {
    console.log(`Navigating to the login page before the test...`);
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  /**
   * @description Runs after each individual test in this describe block.
   * Logs the test title and outcome. Useful for conditional screenshots or state cleanup.
   * @param {Page} page - The Playwright page fixture.
   * @param {TestInfo} testInfo - Metadata about the completed test (title, status, duration).
   */
  test.afterEach(async ({ page }, testInfo) => {
    console.log(`Finished test: ${testInfo.title} with status ${testInfo.status}`);
  });

  /**
   * @description Runs once after all tests in this describe block.
   * Ideal for tearing down databases, closing connections, or releasing resources.
   */
  test.afterAll(async () => {
    console.log('--- Finished execution of Hooks & Annotations Suite ---');
  });

  /**
   * @description A standard test that simply verifies the submit button is visible.
   * Demonstrates the normal test lifecycle with beforeEach and afterEach hooks firing.
   */
  test('Normal test execution', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await expect(loginPage.submitButton).toBeVisible();
  });

  /**
   * @description Demonstrates test.skip() – this test is entirely ignored during execution.
   * Useful for temporarily disabling broken tests without removing them from the suite.
   */
  test.skip('This test is skipped', async ({ page }) => {
    await page.goto('/register');
  });

  /**
   * @description Demonstrates test.fail() – marks this test as expected to fail.
   * Playwright will pass the overall run if the test does indeed fail.
   * Here we intentionally assert incorrect button text to trigger the expected failure.
   */
  test.fail('This test is expected to fail', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await expect(loginPage.submitButton).toHaveText('Wrong Text', { timeout: 1000 });
  });

  /**
   * @description Demonstrates test.fixme() – semantically identical to skip,
   * but signals that this test requires a code fix before it can be re-enabled.
   */
  test.fixme('This test needs fixing', async ({ page }) => {
  });

  /**
   * @description Demonstrates test.only() – when uncommented, only this test
   * will execute in the file. All other tests are silently skipped.
   * Uncomment the block below to try it out.
   */
  // test.only('This is the ONLY test that will run in this file', async ({ page }) => {
  //   console.log('Running standalone test!');
  // });
});
