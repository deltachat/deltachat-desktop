import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'

import { loadEnv } from './load-env.js'
import type { TestOptions } from './playwright-helper.js'
import {
  DC_FRONTEND_NO_TLS,
  NUM_APP_INSTANCES,
  instanceBaseURL,
  instancePort,
} from './playwright-helper.js'

loadEnv()

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
    // Instance 0 is used as the default instance for single-instance tests.
    baseURL: instanceBaseURL(0),

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    permissions: ['notifications'],
    ignoreHTTPSErrors: !DC_FRONTEND_NO_TLS,
    launchOptions: {
      args: DC_FRONTEND_NO_TLS ? undefined : ['--ignore-certificate-errors'],
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

  webServer: Array.from({ length: NUM_APP_INSTANCES }, (_, _index) => {
    const index = _index as 0 | 1
    const port = instancePort(index)
    const url = instanceBaseURL(index)
    return {
      command: `node ${
        process.env.CI ? '' : '--env-file .env'
      } ../target-browser/dist/server.js`,
      name: `DC instance ${port}`,
      url,
      timeout: 120 * 1000,
      ignoreHTTPSErrors: !DC_FRONTEND_NO_TLS,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        ...(process.env as Record<string, string>),
        WEB_PORT: port.toString(),
        DATA_DIR: path.join(
          import.meta.dirname,
          'data',
          `app-instance-${port}`
        ),
      },
    }
  }),
})
