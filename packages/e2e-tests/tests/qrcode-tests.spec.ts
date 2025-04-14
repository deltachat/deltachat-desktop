import { test, expect } from '@playwright/test'

import {
  userNames,
  getUser,
  createProfiles,
  deleteAllProfiles,
  switchToProfile,
  User,
  loadExistingProfiles,
} from '../playwright-helper'

test.describe.configure({ mode: 'serial' })

let existingProfiles: User[] = []

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto('https://localhost:3000/')

  existingProfiles = (await loadExistingProfiles(page)) ?? existingProfiles

  await createProfiles(
    2,
    existingProfiles,
    page,
    context,
    browser.browserType().name()
  )

  await context.close()
})

test.beforeEach(async ({ page }) => {
  await page.goto('https://localhost:3000/')
})

test.afterAll(async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto('https://localhost:3000/')
  await deleteAllProfiles(page, existingProfiles)
  await context.close()
})

test('instant onboarding with contact invite link', async ({
  page,
  context,
  browserName,
}) => {
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  }
  const userA = getUser(0, existingProfiles)
  const userNameB = userNames[1]
  await switchToProfile(page, userA.id)
  // copy invite link from user A
  await page.getByTestId('qr-scan-button').click()
  await page.getByTestId('copy-qr-code').click()
  await page.getByTestId('confirm-qr-code').click()

  await page.getByTestId('add-account-button').click()

  await page.getByTestId('create-account-button').click()

  await page.getByTestId('other-login-button').click()

  await page.getByTestId('scan-qr-login').click()

  await page.getByTestId('paste').click()

  const confirmDialog = page.getByTestId('ask-create-profile-and-join-chat')
  await expect(confirmDialog).toContainText(userA.name)

  confirmDialog.getByTestId('confirm').click()

  // we have to wait till both dialogs are closed since
  // the displayName input is just behind these dialogs
  await expect(confirmDialog).not.toBeVisible()

  await expect(page.getByTestId('qr-reader-settings')).not.toBeVisible()

  const nameInput = page.locator('#displayName')

  await expect(nameInput).toBeVisible()

  await nameInput.fill(userNameB)

  await page.getByTestId('login-button').click()
  await expect(
    page.locator('.chat-list .chat-list-item').filter({ hasText: userA.name })
  ).toHaveCount(1)
})
