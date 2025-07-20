import { test, expect } from '@playwright/test'

import {
  createProfiles,
  User,
  loadExistingProfiles,
  deleteAllProfiles,
  reloadPage,
} from '../playwright-helper'

test.describe.configure({ mode: 'serial' })

let existingProfiles: User[] = []

const numberOfProfiles = 1

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()

  await reloadPage(page)

  existingProfiles = (await loadExistingProfiles(page)) ?? existingProfiles

  await createProfiles(
    numberOfProfiles,
    existingProfiles,
    page,
    context,
    browser.browserType().name()
  )

  await context.close()
})

test.beforeEach(async ({ page }) => {
  await reloadPage(page)
})

test.afterAll(async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()
  await reloadPage(page)
  await deleteAllProfiles(page, existingProfiles)
  await context.close()
})

test('unencrypted group (plain email)', async ({ page }) => {
  await page.locator('#new-chat-button').click()

  await expect(page.getByRole('button', { name: 'New Group' })).toBeVisible()

  // Since we're on a Chatmail server, this button is not supposed to be shown.
  // TODO we should still test the dialog somehow.
  await expect(
    page.getByRole('button', { name: 'New E-Mail' })
  ).not.toBeVisible()
  // Same button, but double-check, by ID.
  await expect(page.locator('#newemail')).not.toBeVisible()

  // Restore app state to "normal".
  await page.getByRole('button', { name: 'Close' }).click()
})
