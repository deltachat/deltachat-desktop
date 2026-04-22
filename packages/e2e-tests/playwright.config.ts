import { defineConfig, devices } from '@playwright/test'

import { loadEnv } from './load-env'
import { TestOptions } from './playwright-helper'

loadEnv()

export const DC_FRONTEND_NO_TLS: boolean =
  process.env.DC_FRONTEND_NO_TLS === 'true' ||
  process.env.DC_FRONTEND_NO_TLS === '1'
const port = process.env.WEB_PORT ?? 3000

const baseURL = `${DC_FRONTEND_NO_TLS ? 'http' : 'https'}://localhost:${port}`

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<TestOptions>({
  testDir: './tests',
  /* Run all tests in serial mode only */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* We have some flaky tests which tend to fail on CI only */
  retries: process.env.CI ? 3 : 0,
  /* Disable parallel tests. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['list'], ['html']],

  // Our tests involve network interaction, so we want a higher timeout
  // for assertions, such as receiving an invitation to a group,
  // as well as whole tests.
  timeout: (process.env.CI ? 5 : 1) * 60 * 1000,
  expect: {
    timeout: process.env.CI ? 60_000 : 20_000,
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
      // Only relevant with TLS.
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
