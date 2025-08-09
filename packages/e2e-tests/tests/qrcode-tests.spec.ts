import { test, expect, type Page } from '@playwright/test'

import {
  userNames,
  getUser,
  reloadPage,
  createProfiles,
  deleteAllProfiles,
  switchToProfile,
  User,
  loadExistingProfiles,
  getProfile,
  deleteProfile,
  clickThroughTestIds,
} from '../playwright-helper'

/**
 * Test for instant onboarding with contact invite link
 * TODO: see fixme at bottom
 */

test.describe.configure({ mode: 'serial' })

let existingProfiles: User[] = []

const numberOfProfiles = 2

// https://playwright.dev/docs/next/test-retries#reuse-single-page-between-tests
let page: Page

test.beforeAll(async ({ browser }) => {
  const contextForProfileCreation = await browser.newContext()
  const pageForProfileCreation = await contextForProfileCreation.newPage()

  await reloadPage(pageForProfileCreation)

  existingProfiles =
    (await loadExistingProfiles(pageForProfileCreation)) ?? existingProfiles

  await createProfiles(
    numberOfProfiles,
    existingProfiles,
    pageForProfileCreation,
    browser.browserType().name()
  )

  await contextForProfileCreation.close()
  page = await browser.newPage()
  await reloadPage(page)
})

test.afterEach(async () => {
  // Pressing Escape a bunch of times should reset the UI state,
  // so there is no need to reload the page.
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Escape')
  }

  // These tests might add or delete profiles, so let's make sure
  // that `existingProfiles` is always up to date.
  existingProfiles = await loadExistingProfiles(page)
})

test.afterAll(async ({ browser }) => {
  await page?.close()

  const context = await browser.newContext()
  const pageForProfileDeletion = await context.newPage()
  await reloadPage(pageForProfileDeletion)
  await deleteAllProfiles(pageForProfileDeletion, existingProfiles)
  await context.close()
})

test('instant onboarding with contact invite link', async ({ browserName }) => {
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  }
  const userA = getUser(0, existingProfiles)
  const userNameC = userNames[1]
  await switchToProfile(page, userA.id)
  // copy invite link from user A
  await clickThroughTestIds(page, [
    'qr-scan-button',
    'copy-qr-code',
    'confirm-qr-code',
    'add-account-button',
    'create-account-button',
    'other-login-button',
    'scan-qr-login',
    'paste',
  ])

  const confirmDialog = page.getByTestId('ask-create-profile-and-join-chat')
  await expect(confirmDialog).toContainText(userA.name)

  await confirmDialog.getByTestId('confirm').click()

  // we have to wait till both dialogs are closed since
  // the displayName input is just behind these dialogs
  await expect(confirmDialog).not.toBeVisible()

  await expect(page.getByTestId('qr-reader-settings')).not.toBeVisible()

  const nameInput = page.locator('#displayName')

  await expect(nameInput).toBeVisible()

  await nameInput.fill(userNameC)

  await page.getByTestId('login-button').click()
  await expect(
    page.locator('.chat-list .chat-list-item').filter({ hasText: userA.name })
  ).toHaveCount(1)
})

/**
 * To test onboarding with manual credentials
 * we just copy the credentials from userB
 * delete the profile afterwards and use
 * the same credentials for a new manual
 * account creation
 */
test('onboarding with manual credentials', async ({ browserName }) => {
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  }
  const userA = getUser(0, existingProfiles)
  const userB = getUser(1, existingProfiles)
  const userBProfile = await getProfile(page, userB.id, true)
  const { address, password } = userBProfile
  if (!password) {
    throw new Error(`Profile ${userB.name} has no password!`)
  }
  const newUsername = 'Bob2'
  await switchToProfile(page, userA.id)
  await deleteProfile(page, userB.id)
  existingProfiles = existingProfiles.filter(p => p.id !== userB.id)
  await reloadPage(page)
  await page.getByTestId('add-account-button').click()
  await page.getByTestId('create-account-button').click()
  const nameInput = page.locator('#displayName')
  await expect(nameInput).toBeVisible()
  await nameInput.fill(newUsername)

  await page.getByTestId('other-login-button').click()
  await page.getByTestId('manual-email-login').click()
  await page.locator('#addr').fill(address)
  await page.locator('#password').fill(password)
  await page.getByTestId('login-with-credentials').click()
  await expect(page.getByTestId('login-with-credentials')).not.toBeVisible()

  const newAccountList = page.locator('.styles_module_account')
  await expect(newAccountList.last()).toHaveClass(
    /(^|\s)styles_module_active(\s|$)/
  )
  // open settings to validate the name and the mail address
  const settingsButton = page.getByTestId('open-settings-button')
  await settingsButton.click()

  await expect(page.locator('.styles_module_profileDisplayName')).toHaveText(
    newUsername
  )
  await page.getByTestId('open-advanced-settings').click()
  await page.getByTestId('open-account-and-password').click()
  const addressLocator = page.locator('#addr')
  await expect(addressLocator).toHaveValue(/.+@.+/)
  const addressFromSettings = await addressLocator.inputValue()
  expect(addressFromSettings).toEqual(address)
  await page.getByTestId('cancel').click()
  await page.getByTestId('settings-advanced-close').click()
  // needed in deleteAllProfiles
  existingProfiles.push({
    id:
      (await newAccountList
        .last()
        .getAttribute('x-account-sidebar-account-id')) ?? '',
    name: newUsername,
    address: addressFromSettings,
  })
})

test.fixme(
  'instant onboarding fails with withdrawn invite link',
  async () => {}
)

test.fixme('instant onboarding works with revived invite link', async () => {})

// maybe move this to group tests?
test.fixme('instant onboarding with group invite link', async () => {})

test.fixme(
  'instant onboarding fails with withdrawn group invite link',
  async () => {}
)

test.fixme('instant onboarding works with DCLOGIN qr code', async () => {})

test.fixme(
  'instant onboarding with DCACCOUNT link from loaded image',
  async () => {}
)
