import { expect, type Page } from '@playwright/test'

import {
  groupName,
  userNames,
  getUser,
  createProfiles,
  User,
  loadExistingProfiles,
  deleteAllProfiles,
  reloadPage,
  clickThroughTestIds,
  test,
  createGroupChat,
  createChat,
  chatmailServerDomain,
  isIpAddress,
} from '../playwright-helper.js'

/**
 * Joining a group via instant onboarding needs the DCACCOUNT mechanism,
 * which does not work against a self-signed IP-only relay
 * (see `skipOnIpRelay`), so all tests that need it live in their own self-contained file:
 * in CI it runs in a separate step against the public chatmail relay
 * (see .github/workflows/e2e.yml), while the rest of the suite
 * uses a local Docker relay.
 */

test.describe.configure({
  mode: 'serial',
})

test.skip(
  () => isIpAddress(chatmailServerDomain),
  'cannot onboard against a self-signed IP-only relay, see chatmail/core#8211'
)

let existingProfiles: User[] = []

const numberOfProfiles = 2

// https://playwright.dev/docs/next/test-retries#reuse-single-page-between-tests
let page: Page

test.beforeAll(async ({ browser, isChatmail }) => {
  const contextForProfileCreation = await browser.newContext()
  const pageForProfileCreation = await contextForProfileCreation.newPage()
  await reloadPage(pageForProfileCreation)

  existingProfiles =
    (await loadExistingProfiles(pageForProfileCreation)) ?? existingProfiles
  test.setTimeout(120_000)

  await createProfiles(
    numberOfProfiles,
    existingProfiles,
    pageForProfileCreation,
    browser.browserType().name(),
    isChatmail
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
})

test.afterAll(async ({ browser }) => {
  await page?.close()

  const context = await browser.newContext()
  const pageForProfileDeletion = await context.newPage()
  await reloadPage(pageForProfileDeletion)
  await deleteAllProfiles(pageForProfileDeletion, existingProfiles)
  await context.close()
})

test('Invite new user to group', async ({ browserName }) => {
  // Profile creation, group creation and onboarding involve
  // a lot of roundtrips to the (public) relay.
  test.setTimeout(120_000)
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  }
  const userA = getUser(0, existingProfiles)
  const userB = getUser(1, existingProfiles)
  const newUserName = userNames[2] ?? 'Chris'
  const groupInviteMessage = `${userA.name} invited you to join this group`

  // Establish contact between userA and userB and create the group
  // that the new user is then invited to.
  await createChat(userA, userB, page, browserName)
  await createGroupChat(page, groupName, userA, userB)

  // copy group invite link (createGroupChat leaves the group chat open)
  await page.getByTestId('chat-info-button').click()
  await page.locator('#showqrcode button').click()
  await clickThroughTestIds(page, [
    'copy-qr-code',
    'confirm-qr-code',
    'view-group-dialog-header-close',
  ])

  // paste invite link in Instant Onboarding Dialog
  await clickThroughTestIds(page, [
    'add-account-button',
    'create-account-button',
    'other-login-button',
    'scan-qr-login',
    'paste',
  ])

  const confirmDialog = page.getByTestId('ask-join-group')
  await expect(confirmDialog).toBeVisible()
  // confirm dialog should contain group name
  await expect(confirmDialog).toContainText(groupName)
  await confirmDialog.getByTestId('confirm').click()
  await page.locator('#displayName').fill(newUserName)
  await page.getByTestId('login-button').click()
  // userA invited you to group message
  await expect(
    page
      .getByRole('list', { name: 'Messages' })
      .getByRole('listitem')
      .filter({ hasText: groupInviteMessage })
  ).toBeVisible()
  const composer = page.locator('textarea.create-or-edit-message-input')
  await expect(composer).not.toBeVisible({ timeout: 1 })

  // verified chat after response from userA
  await expect(page.locator('.e2ee-info')).toBeVisible()

  const msg = 'Hello chat!' + Math.random()
  await composer.fill(msg)
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(
    page.locator('#message-list li.message-wrapper').last()
  ).toContainText(msg)

  await page.getByTestId('chat-info-button').click()
  // new user sees group members
  await expect(
    page
      .locator('.group-member-contact-list-wrapper .contact-list-item')
      .filter({ hasText: userB.name })
  ).toBeVisible()
  await page.getByTestId('view-group-dialog-header-close').click()
  // update existing profiles so they include the new user
  // to make sure all get deleted after the test
  existingProfiles = await loadExistingProfiles(page)
})
