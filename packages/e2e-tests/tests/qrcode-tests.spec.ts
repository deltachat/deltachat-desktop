import { expect, type Page } from '@playwright/test'

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
  test,
  createProfileAndJoinChat,
} from '../playwright-helper'

/**
 * Test for instant onboarding with contact invite link
 */

test.describe.configure({
  mode: 'serial',
})

let existingProfiles: User[] = []

const numberOfProfiles = 1

// https://playwright.dev/docs/next/test-retries#reuse-single-page-between-tests
let page: Page

test.beforeAll(async ({ browser, isChatmail }) => {
  const contextForProfileCreation = await browser.newContext()
  const pageForProfileCreation = await contextForProfileCreation.newPage()

  console.log(
    `Running tests with ${isChatmail ? 'isChatmail' : 'plain email'} profiles`
  )

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
  const userNameB = userNames[1]
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

  await createProfileAndJoinChat(userA.name, userNameB, page)
  await expect(
    page.locator('.chat-list .chat-list-item').filter({ hasText: userA.name })
  ).toHaveCount(1)
})

test('instant onboarding with withdrawn and revived invite link', async ({
  browserName,
}) => {
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  }
  const userA = getUser(0, existingProfiles)
  // user B was created in the previous test
  const userNameC = userNames[2]
  const userNameD = userNames[3]
  await switchToProfile(page, userA.id)
  // copy invite link from user A
  await clickThroughTestIds(page, [
    'qr-scan-button',
    'copy-qr-code',
    'confirm-qr-code',
    'qr-scan-button',
  ])

  // now we reset the qr code (withdraw)
  await page.getByTestId('qr-code-image').click({ button: 'right' })
  await page.getByTestId('withdraw-qr-code').click()
  await page.getByTestId('confirm-dialog').getByTestId('confirm').click()

  await clickThroughTestIds(page, [
    'add-account-button',
    'create-account-button',
    'other-login-button',
    'scan-qr-login',
    'paste',
  ])
  /**
   * scanning a withdrawn invite link allows to start a chat with
   * the inviter but he will should get the invitation message
   * we cannot test this reliably, what we do is to switch to the inviters
   * profile at the end of this test and check that there is
   * NO chat with user B while the chat with user D was created
   */
  await createProfileAndJoinChat(userA.name, userNameC, page)

  // revive the qr code again
  await switchToProfile(page, userA.id)
  await page.getByTestId('qr-scan-button').click()
  await page.getByTestId('qr-code-image').click({ button: 'right' })
  await page.getByTestId('withdraw-qr-code').click()
  await page.getByTestId('confirm-dialog').getByTestId('confirm').click()

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

  await createProfileAndJoinChat(userA.name, userNameD, page)
  await switchToProfile(page, userA.id)

  // chat with user D should exist
  await expect(
    page.locator('.chat-list .chat-list-item').filter({ hasText: userNameD })
  ).toHaveCount(1)

  // chat with user C should NOT exist
  await expect(
    page.locator('.chat-list .chat-list-item').filter({ hasText: userNameC })
  ).toHaveCount(0)
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
  await page.getByTestId('open-transport-settings').click()
  await page.getByLabel('Edit Relay').first().click()
  const addressLocator = page.locator('#addr')
  await expect(addressLocator).toHaveValue(/.+@.+/)
  const addressFromSettings = await addressLocator.inputValue()
  expect(addressFromSettings).toEqual(address)
  await page.getByTestId('cancel').click()
  await page.getByTestId('transports-settings-close').click()
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

test('wrong qr code for onboarding shows error message', async ({
  browserName,
}) => {
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  }
  await page.getByTestId('add-account-button').click()
  await page.reload()
  await expect(page.getByTestId('have-account-button')).toBeVisible()
  const testQrCodeInSecondDeviceScan = async () => {
    await clickThroughTestIds(page, [
      'have-account-button',
      'second-device-button',
      'qr-reader-settings',
      'paste-from-clipboard',
    ])
    await expect(page.getByTestId('qr-code-cannot-be-used')).toBeVisible()
    await page.getByTestId('alert-ok').click()
  }

  await page.evaluate(`navigator.clipboard.writeText('invalid qr code')`)
  await testQrCodeInSecondDeviceScan()

  // see https://github.com/deltachat/deltachat-desktop/issues/5616
  // await page.evaluate(
  //   `navigator.clipboard.writeText('mailto:user@testing.com')`
  // )
  // await testQrCodeInSecondDeviceScan()

  await page.evaluate(`navigator.clipboard.writeText('https://localhost:1111')`)
  await testQrCodeInSecondDeviceScan()

  await clickThroughTestIds(page, [
    'create-account-button',
    'other-login-button',
    'scan-qr-login',
    'paste',
  ])
  // proxy should not be accepted here
  await expect(page.getByTestId('qr-code-cannot-be-used')).toBeVisible()
  await page.getByTestId('alert-ok').click()

  await page.evaluate(`navigator.clipboard.writeText('invalid qr code')`)
  await clickThroughTestIds(page, [
    'dialog-header-context-menu',
    'proxy-context-menu-item',
    'scan-proxy-qr-button',
    'paste',
  ])
  await expect(page.getByTestId('proxy-scan-failed')).toBeVisible()
  await page.getByTestId('alert-ok').click()
  await page.getByTestId('proxy-settings-close').click()

  const accounts = page.getByLabel('profile').getByRole('tab')
  const priorCount = await accounts.count()
  await page.getByTestId('dialog-header-back').click()
  await page
    .getByTestId('onboarding-dialog')
    .getByTestId('dialog-header-close')
    .click()
  // Wait fot the unconfigured account to truly get deleted,
  // otherwise `afterEach` will fail.
  await expect(accounts).toHaveCount(priorCount - 1)
})

test('instant onboarding fails with withdrawn group invite link', async ({
  browserName,
}) => {
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  }
  const userA = getUser(0, existingProfiles)
  const groupName = 'WithdrawnGroupTest'
  const newUserName = 'Withdrawn'

  await switchToProfile(page, userA.id)

  // Create a group
  await page.locator('#new-chat-button').click()
  await page.locator('#newgroup button').click()
  await page.locator('.group-name-input').fill(groupName)
  await page.getByTestId('group-create-button').click()

  const groupChatItem = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: groupName })
  await expect(groupChatItem).toBeVisible()

  // Copy the group invite link (we're already in the group chat after creation)
  await page.getByTestId('chat-info-button').click()
  await page.locator('#showqrcode button').click()
  await clickThroughTestIds(page, ['copy-qr-code', 'confirm-qr-code'])

  // Re-open ShowQR to withdraw the invite
  await page.locator('#showqrcode button').click()
  await page.getByTestId('qr-code-image').click({ button: 'right' })
  await page.getByTestId('withdraw-qr-code').click()
  await page.getByTestId('withdraw-verify-group').getByTestId('confirm').click()
  await page.getByTestId('view-group-dialog-header-close').click()

  // Try instant onboarding with the withdrawn invite link
  await clickThroughTestIds(page, [
    'add-account-button',
    'create-account-button',
    'other-login-button',
    'scan-qr-login',
    'paste',
  ])

  const confirmDialog = page.getByTestId('ask-join-group')
  await expect(confirmDialog).toBeVisible()
  await expect(confirmDialog).toContainText(groupName)
  await confirmDialog.getByTestId('confirm').click()
  await page.locator('#displayName').fill(newUserName)
  await page.getByTestId('login-button').click()

  // Wait for the new account to become active
  const newAccountList = page.locator('.styles_module_account')
  await expect(newAccountList.last()).toHaveClass(
    /(^|\s)styles_module_active(\s|$)/
  )

  // Switch to userA and verify the new user is NOT in the group
  await switchToProfile(page, userA.id)
  await groupChatItem.click()
  await page.getByTestId('chat-info-button').click()
  await expect(
    page
      .locator('.group-member-contact-list-wrapper .contact-list-item')
      .filter({ hasText: newUserName })
  ).not.toBeVisible()
  await page.getByTestId('view-group-dialog-header-close').click()
})

test('instant onboarding works with DCLOGIN qr code', async ({
  browserName,
}) => {
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  }
  const userA = getUser(0, existingProfiles)
  const userAProfile = await getProfile(page, userA.id, true)
  const { address, password } = userAProfile
  if (!password) {
    throw new Error(`Profile ${userA.name} has no password!`)
  }
  const newUsername = userA.name + '2'

  await page.evaluate(
    async ([addr, pass]) => {
      await navigator.clipboard.writeText(
        `dclogin://${addr}?p=${encodeURIComponent(pass)}&v=1`
      )
    },
    [address, password]
  )
  await clickThroughTestIds(page, [
    'add-account-button',
    'create-account-button',
    'other-login-button',
    'scan-qr-login',
    'paste',
  ])

  // For DCLOGIN there is no confirmation dialog, just wait for the scanner to close
  await expect(page.getByTestId('qrscan-dialog')).not.toBeVisible()
  const nameInput = page.locator('#displayName')
  await expect(nameInput).toBeVisible()
  await nameInput.fill(newUsername)
  await page.getByTestId('login-button').click()

  const newAccountList = page.locator('.styles_module_account')
  await expect(newAccountList.last()).toHaveClass(
    /(^|\s)styles_module_active(\s|$)/
  )

  // Verify the new account uses the same address as the DCLOGIN credentials
  await clickThroughTestIds(page, [
    'open-settings-button',
    'open-advanced-settings',
    'open-transport-settings',
  ])
  await page.getByLabel('Edit Relay').first().click()
  const addressLocator = page.locator('#addr')
  await expect(addressLocator).toHaveValue(/.+@.+/)
  const addressFromSettings = await addressLocator.inputValue()
  expect(addressFromSettings).toEqual(address)
  await clickThroughTestIds(page, [
    'cancel',
    'transports-settings-close',
    'settings-advanced-close',
  ])

  // Update existingProfiles for afterAll cleanup
  existingProfiles.push({
    id:
      (await newAccountList
        .last()
        .getAttribute('x-account-sidebar-account-id')) ?? '',
    name: newUsername,
    address: addressFromSettings,
  })
})
