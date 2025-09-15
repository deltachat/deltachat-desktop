import { defineConfig, devices } from '@playwright/test'

import { TestOptions } from './playwright-helper'

const port = process.env.PORT ?? 3000

const baseURL = `https://localhost:${port}`

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<TestOptions>({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['list'], ['html']],

  // Our tests involve network interaction, so we want a higher timeout
  // for assertions, such as receiving an invitation to a group,
  // as well as whole tests.
  timeout: 5 * 60 * 1000,
  expect: {
    timeout: 60_000,
  },

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    permissions: ['notifications'],
    ignoreHTTPSErrors: true,
    launchOptions: {
      args: ['--ignore-certificate-errors'],
    },
  },

  /* Configure projects for chatmail and non-chatmail tests */
  projects: [
    {
      name: 'chatmail',
      use: {
        ...devices['Desktop Chrome'],
        isChatmail: true, // create profiles on a dedicated chatmail server
      },
    },
    // Our non chatmail server is too unreliable right now to be used in CI
    // {
    //   name: 'non-chatmail',
    //   use: {
    //     ...devices['Desktop Chrome'],
    //     isChatmail: false, // create profiles on a dedicated non-chatmail server
    //   },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: `node ${
      process.env.CI ? '' : '--env-file .env'
    } ../target-browser/dist/server.js`,
    url: baseURL,
    timeout: 120 * 1000,
    ignoreHTTPSErrors: true,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
