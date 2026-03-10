/**
 * @file playwright.config.ts
 * @description Central Playwright configuration for the Lendsphere test suite.
 * Defines test directory, timeouts, parallelism, reporters, browser projects,
 * and shared settings such as baseURL, tracing, and screenshot capture.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({

  /** @description Directory containing all test spec files. */
  testDir: './tests',

  /** @description Maximum time (ms) a single test is allowed to run before timing out. */
  timeout: 30 * 1000,

  expect: {
    /** @description Maximum time (ms) an expect() assertion will wait for its condition to be met. */
    timeout: 5000
  },

  /** @description When true, tests across different files run in parallel for faster execution. */
  fullyParallel: true,

  /** @description Prevents accidental test.only() from being committed in CI environments. */
  forbidOnly: !!process.env.CI,

  /** @description Number of automatic retries for failed tests. Retries are enabled only in CI. */
  retries: process.env.CI ? 2 : 0,

  /** @description Number of parallel workers. Limited to 1 in CI for stability; unlimited locally. */
  workers: process.env.CI ? 1 : undefined,

  /** @description Test reporter format. 'html' generates an interactive HTML report after each run. */
  reporter: 'html',

  /**
   * @description Shared settings applied to every test in every project.
   * @see https://playwright.dev/docs/api/class-testoptions
   */
  use: {
    /**
     * @description Base URL prepended to relative paths in actions like page.goto('/').
     * Uses 127.0.0.1 instead of localhost to avoid IPv6 resolution issues on Windows.
     */
    baseURL: 'http://127.0.0.1:3000',

    /** @description Capture a full trace for every test run (viewable via Trace Viewer). */
    trace: 'on',

    /** @description Run tests with a visible browser window for local debugging. */
    headless: false,

    /** @description Automatically capture a screenshot when a test fails. */
    screenshot: 'only-on-failure',

    /** @description Record video and retain it only when a test fails. */
    video: 'retain-on-failure',
  },

  /**
   * @description Browser projects to execute tests against.
   * Currently configured for Chromium (Desktop Chrome) only.
   */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

});
