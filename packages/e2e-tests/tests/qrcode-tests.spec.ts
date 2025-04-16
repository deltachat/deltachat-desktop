import { test, expect } from '@playwright/test'

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

test('instant onboarding with contact invite link', async ({
  page,
  context,
  browserName,
}) => {
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
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
test('onboarding with manual credentials', async ({
  page,
  context,
  browserName,
}) => {
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
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
