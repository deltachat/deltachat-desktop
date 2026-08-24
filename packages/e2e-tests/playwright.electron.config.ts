import { defineConfig } from '@playwright/test'

import { loadEnv } from './load-env.js'

loadEnv()

/**
 * Config for tests that drive the real Electron app (see electron-helper.ts),
 * for features the browser target can't cover: webxdc, calls,
 * multiple windows, native dialogs, IPC security.
 *
 * Unlike playwright.config.ts, this does NOT start the browser-target web
 * server: each test launches its own app instance(s).
 *
 * Prerequisite: `pnpm -w build:electron`.
 * Run with: `pnpm -w e2e:electron` (builds first) or
 * `pnpm e2e:electron` from packages/e2e-tests.
 */
export default defineConfig({
  testDir: './electron-tests',
  outputDir: './test-results-electron',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report-electron', open: 'never' }],
  ],
  timeout: (process.env.CI ? 3 : 1) * 60_000,
  expect: { timeout: process.env.CI ? 60_000 : 20_000 },
})
