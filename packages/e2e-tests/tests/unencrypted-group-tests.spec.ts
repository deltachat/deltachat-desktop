import { expect, Page } from '@playwright/test'

import {
  createProfiles,
  User,
  loadExistingProfiles,
  deleteAllProfiles,
  reloadPage,
  test,
  switchToProfile,
  clickThroughTestIds,
  getUser,
} from '../playwright-helper'

test.describe.configure({ mode: 'serial' })

let existingProfiles: User[] = []

const numberOfProfiles = 4

const encryptedGroupSubject = 'Encrypted group chat subject'
const unencryptedGroupSubject1 = '1st unencrypted group chat subject'
const unencryptedGroupSubject2 = '2nd unencrypted group chat subject'

// https://playwright.dev/docs/next/test-retries#reuse-single-page-between-tests
let page: Page

test.beforeAll(async ({ browser, isChatmail }) => {
  if (isChatmail) {
    test.skip(
      true,
      'Non encrypted groups are not possible on chatmail accounts'
    )
  }
  const contextForProfileCreation = await browser.newContext()
  const pageForProfileCreation = await contextForProfileCreation.newPage()
  await reloadPage(pageForProfileCreation)

  existingProfiles =
    (await loadExistingProfiles(pageForProfileCreation)) ?? existingProfiles

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

/**
 * create an unencrypted group with plain email contacts
 */
test('check "New E-Mail" option is shown and a chat can be created', async () => {
  const userA = existingProfiles[0]
  const userB = existingProfiles[1]
  const userC = existingProfiles[2]
  const emailUserB = userB.address
  const emailUserC = userC.address
  // prepare last open chat for receiving user
  await switchToProfile(page, userA.id)
  await page.locator('#new-chat-button').click()

  // Since we're on a non-chatmail server, this button is supposed to be shown.
  const newEmailButton = page.getByRole('button', { name: 'New E-Mail' })
  await expect(newEmailButton).toBeVisible()

  await newEmailButton.click()

  await page.getByTestId('group-name-input').fill(unencryptedGroupSubject1)
  await page.locator('#addmember').click()

  await page.getByTestId('add-member-search').fill(emailUserB)

  const contactRowA = page
    .locator('.styles_module_addMemberContactList li button')
    .filter({ hasText: emailUserB })
    .first()
  await contactRowA.click()

  await page.getByTestId('add-member-search').fill(emailUserC)

  const contactRowB = page
    .locator('.styles_module_addMemberContactList li button')
    .filter({ hasText: emailUserC })
    .first()
  await contactRowB.click()

  await page.getByTestId('ok').click()

  await page.getByTestId('group-create-button').click()

  const chatListItem = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: unencryptedGroupSubject1 })
  await expect(chatListItem).toBeVisible()
  await chatListItem.click()
  await expect(page.locator('.navbar-heading')).toContainText(
    unencryptedGroupSubject1
  )
})

test('start encrypted chat with user D', async ({ browserName }) => {
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  }
  const userA = getUser(0, existingProfiles)
  const userD = getUser(3, existingProfiles)
  await switchToProfile(page, userA.id)
  // copy invite link from user A
  await clickThroughTestIds(page, [
    'qr-scan-button',
    'copy-qr-code',
    'confirm-qr-code',
  ])

  await switchToProfile(page, userD.id)
  // paste invite link in account of userD
  await clickThroughTestIds(page, ['qr-scan-button', 'show-qr-scan', 'paste'])
  const confirmDialog = page.getByTestId('confirm-start-chat')
  await expect(confirmDialog).toContainText(userA.name)

  await page.getByTestId('confirm-start-chat').getByTestId('confirm').click()
  await expect(
    page.locator('.chat-list .chat-list-item').filter({ hasText: userA.name })
  ).toHaveCount(1)
  console.log(`Chat with ${userA.name} created!`)
})

test('check appropriate members are shown for new encrypted group', async () => {
  const userA = existingProfiles[0]
  const userB = existingProfiles[1]
  // verified contact added via invite code
  const userD = existingProfiles[3]

  await switchToProfile(page, userA.id)
  await clickThroughTestIds(page, ['new-chat-button', 'newgroup', 'addmember'])
  const addMemberDialog = page.getByTestId('add-member-dialog')
  const contactList = page.getByTestId('add-member-dialog').locator('li button')
  // only self and the verified user should be visible
  await expect(contactList).toHaveCount(2)
  // TODO: this should show the contact by name but it fails with a
  // screenshot showing the mail address instead of the name ??
  await page
    .locator('.contact-list-item')
    .filter({ hasText: userD.address })
    .click()
  const contactShouldNotBeListed = page
    .locator('.contact-list-item')
    .filter({ hasText: userB.name })
  await expect(contactShouldNotBeListed).not.toBeVisible()
  await addMemberDialog.getByTestId('ok').click()
  await page.getByTestId('group-name-input').fill(encryptedGroupSubject)
  await page.getByTestId('group-create-button').click()
  const chatListItem = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: encryptedGroupSubject })
  await expect(chatListItem).toBeVisible()
})

test('check appropriate members are shown for new unencrypted group', async () => {
  const userA = existingProfiles[0]
  const userB = existingProfiles[1]
  // verified contact added via invite code
  const userD = existingProfiles[3]

  await switchToProfile(page, userA.id)
  await clickThroughTestIds(page, ['new-chat-button', 'newemail', 'addmember'])
  const addMemberDialog = page.getByTestId('add-member-dialog')
  const contactList = page.getByTestId('add-member-dialog').locator('li button')
  // only self and the non verified users should be visible
  await expect(contactList).toHaveCount(3)
  await page
    .locator('.contact-list-item')
    .filter({ hasText: userB.address })
    .click()
  const contactShouldNotBeListedByName = page
    .locator('.contact-list-item')
    .filter({ hasText: userD.name })
  await expect(contactShouldNotBeListedByName).not.toBeVisible()
  const contactShouldNotBeListedByAddress = page
    .locator('.contact-list-item')
    .filter({ hasText: userD.address })
  await expect(contactShouldNotBeListedByAddress).not.toBeVisible()
  await addMemberDialog.getByTestId('ok').click()
  await page.getByTestId('group-name-input').fill(unencryptedGroupSubject2)
  await page.getByTestId('group-create-button').click()
  const chatListItem = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: unencryptedGroupSubject2 })
  await expect(chatListItem).toBeVisible()
})

test('check group dialog for unencrypted group has appropriate entries', async () => {
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: unencryptedGroupSubject1 })
    .first()
    .click()
  await page.getByTestId('chat-info-button').click()

  const dialog = page.getByTestId('view-group-dialog')
  await expect(dialog).toContainText(unencryptedGroupSubject1)
  await expect(dialog).toContainText('3 members')
  // Unavailable for unencrypted groups.
  await expect(
    dialog.getByRole('button', { name: 'Add Members' })
  ).not.toBeVisible({ timeout: 1 })
  await expect(dialog.locator('#addmember')).not.toBeVisible({ timeout: 1 })
  await expect(
    dialog.getByTestId('view-group-dialog-header-edit')
  ).not.toBeVisible({ timeout: 1 })
  await expect(
    dialog.getByRole('button', { name: 'QR Invite Code' })
  ).not.toBeVisible({ timeout: 1 })
  await expect(dialog.locator('#showqrcode')).not.toBeVisible({ timeout: 1 })

  await page.getByTestId('view-group-dialog-header-close').click()
})

test('chat list item context menu', async () => {
  const chatListItem = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: unencryptedGroupSubject1 })
    .first()
  await chatListItem.click({
    button: 'right',
  })
  // "Leave Group" does not apply to unencrypted groups.
  await expect(
    page.getByRole('menuitem', { name: 'Delete Chat' })
  ).toBeVisible()
  await expect(
    page.getByRole('menuitem', { name: 'Leave Group' })
  ).not.toBeVisible()
  await expect(page.getByRole('menuitem')).toHaveCount(7)

  await page.getByRole('menuitem').first().press('Escape')
  await expect(page.getByRole('menuitem')).not.toBeVisible()
})
