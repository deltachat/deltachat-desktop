import { expect, type Page } from '@playwright/test'

import {
  groupName,
  userNames,
  getUser,
  createProfiles,
  switchToProfile,
  User,
  loadExistingProfiles,
  deleteAllProfiles,
  reloadPage,
  clickThroughTestIds,
  test,
} from '../playwright-helper'

test.describe.configure({ mode: 'serial' })

let existingProfiles: User[] = []

const numberOfProfiles = 3

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

test('start chat with user', async ({ browserName }) => {
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  }
  const userA = getUser(0, existingProfiles)
  const userB = getUser(1, existingProfiles)
  await switchToProfile(page, userA.id)
  // copy invite link from user A
  await clickThroughTestIds(page, [
    'qr-scan-button',
    'copy-qr-code',
    'confirm-qr-code',
  ])

  await switchToProfile(page, userB.id)
  // paste invite link in account of userB
  await clickThroughTestIds(page, ['qr-scan-button', 'show-qr-scan', 'paste'])
  const confirmDialog = page.getByTestId('confirm-start-chat')
  await expect(confirmDialog).toContainText(userA.name)

  await page.getByTestId('confirm-start-chat').getByTestId('confirm').click()
  await expect(
    page.locator('.chat-list .chat-list-item').filter({ hasText: userA.name })
  ).toHaveCount(1)
  console.log(`Chat with ${userA.name} created!`)
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userA.name })
    .click()

  const messageText = `Hello ${userA.name}!`
  await page.locator('#composer-textarea').fill(messageText)
  await page.locator('button.send-button').click()
  const sentMessageText = page
    .locator(`.message.outgoing`)
    .last()
    .locator('.msg-body .text')
  await expect(sentMessageText).toHaveText(messageText)
})

test('create group', async ({ browserName }) => {
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  }
  const userA = existingProfiles[0]
  const userB = existingProfiles[1]
  await switchToProfile(page, userA.id)
  const chatUserB = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userB.name })
  await expect(chatUserB).toBeVisible()
  await page.locator('#new-chat-button').click()
  await page.locator('#newgroup button').click()
  await page.locator('.group-name-input').fill(groupName)
  await page.locator('#addmember button').click()
  const addMemberDialog = page.getByTestId('add-member-dialog')
  console.log('userB', userB)
  await page
    .locator('.contact-list-item')
    .filter({ hasText: userB.name })
    .click()

  await addMemberDialog.getByTestId('ok').click()

  await page.getByTestId('group-create-button').click()
  const chatListItem = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: groupName })
  await expect(chatListItem).toBeVisible()
  await page.locator('#composer-textarea').fill(`Hello group members!`)
  await page.locator('button.send-button').click()
  const badgeNumber = page
    .getByTestId(`account-item-${userB.id}`)
    .locator('.styles_module_accountBadgeIcon')
  await expect(badgeNumber).toHaveText('1')
})

test('check "New E-Mail" option presence', async ({ isChatmail }) => {
  await page.locator('#new-chat-button').click()

  await expect(page.getByRole('button', { name: 'New Group' })).toBeVisible()

  // Since we're on a Chatmail server, this button is not supposed to be shown.
  const newEmailButton = page.getByRole('button', { name: 'New E-Mail' })
  if (isChatmail) {
    await expect(newEmailButton).not.toBeVisible()
    // Same button, but double-check, by ID.
    await expect(page.locator('#newemail')).not.toBeVisible({ timeout: 1 })
  } else {
    await expect(newEmailButton).toBeVisible()
  }

  await page.getByRole('dialog').press('Escape')
})

test('Invite existing user to group', async ({ browserName }) => {
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  }
  const userA = existingProfiles[0]
  const userB = existingProfiles[1]
  const userC = existingProfiles[2]
  await switchToProfile(page, userA.id)
  const chatListItem = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: groupName })
  await expect(chatListItem).toBeVisible()
  await chatListItem.click()
  // copy group invite link
  await page.getByTestId('chat-info-button').click()
  await page.locator('#showqrcode button').click()
  await clickThroughTestIds(page, [
    'copy-qr-code',
    'confirm-qr-code',
    'view-group-dialog-header-close',
  ])

  // paste invite link in account of userC
  await switchToProfile(page, userC.id)
  await clickThroughTestIds(page, ['qr-scan-button', 'show-qr-scan', 'paste'])

  const confirmDialog = page.getByTestId('confirm-join-group')
  await expect(confirmDialog).toBeVisible()
  // confirm dialog should contain group name
  await expect(confirmDialog).toContainText(groupName)
  await page.getByTestId('confirm-join-group').getByTestId('confirm').click()
  const chatListGroupItem = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: groupName })
  await expect(chatListGroupItem).toBeVisible()
  // userA invited you to group message
  await expect(
    page
      .locator('#message-list li.message-wrapper')
      .filter({ hasText: userA.name })
  ).toBeVisible()
  const composer = page.locator('textarea#composer-textarea')
  await expect(composer).not.toBeVisible({ timeout: 1 })

  // userB has 2 new notifications now
  const badge = page
    .getByTestId(`account-item-${userB.id}`)
    .locator('.styles_module_accountBadgeIcon')
    .getByText('2')

  await expect(badge).toBeVisible()
  await expect(page.locator('.e2ee-info')).toBeVisible()
  const msg = 'Hello chat!' + Math.random()
  await composer.fill(msg)
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(
    page.locator('#message-list li.message-wrapper').last()
  ).toContainText(msg)
})

test('Invite new user to group', async ({ browserName }) => {
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  }
  const newUserName = userNames[3]
  const userA = existingProfiles[0]
  const userB = existingProfiles[1]
  await switchToProfile(page, userA.id)
  const chatListItem = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: groupName })
  await expect(chatListItem).toBeVisible()
  await chatListItem.click()
  // copy group invite link
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
      .locator('#message-list li.message-wrapper')
      .filter({ hasText: userA.name })
  ).toBeVisible()
  const composer = page.locator('textarea#composer-textarea')
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

test('Remove user from group', async () => {
  // user C removes user B
  const userB = existingProfiles[1]
  const userC = existingProfiles[2]
  await switchToProfile(page, userC.id)
  const chatListItem = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: groupName })
  await expect(chatListItem).toBeVisible()
  await chatListItem.click()
  await page.getByTestId('chat-info-button').click()

  const userBRow = page
    .locator('.group-member-contact-list-wrapper .contact-list-item')
    .filter({ hasText: userB.name })
    .first()
  await userBRow.locator('button.btn-remove').click()
  await page
    .getByTestId('remove-group-member-dialog')
    .getByTestId('confirm')
    .click()
  const pastMember = page.locator('.group-member-contact-list-wrapper').nth(1)
  await expect(pastMember.locator('.contact-list-item').first()).toContainText(
    userB.name
  )
  await page.getByTestId('view-group-dialog-header-close').click()
})

test('Readd user to group', async () => {
  // user A adds user B again
  const userA = existingProfiles[0]
  const userB = existingProfiles[1]
  const userC = existingProfiles[2]
  const userD = existingProfiles[3]
  await switchToProfile(page, userA.id)
  const chatListItem = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: groupName })
  await expect(chatListItem).toBeVisible()
  await chatListItem.click()
  await page.getByTestId('chat-info-button').click()

  // Wait for the removal of userB in the "View Group" dialog,
  // because the "Add Members" dialog won't auto-update.
  // We probably should make it auto-updateable as well.
  const membersList = page.getByTestId('group-member-list')
  await expect(membersList.getByRole('listitem')).toHaveCount(3)
  await expect(membersList).not.toContainText(userB.name)
  for (const name of ['Me', userC.name, userD.name]) {
    await expect(membersList).toContainText(name)
  }

  await page.locator('#addmember button').click()
  const addMemberDialog = page.getByTestId('add-member-dialog')
  const userBRow = addMemberDialog
    .locator('.contact-list-item')
    .filter({ hasText: userB.name })
    .first()
  await userBRow.click()
  await expect(userBRow.locator('.checkmark')).toBeVisible()
  await addMemberDialog.getByTestId('ok').click()
  for (const name of ['Me', userB.name, userC.name, userD.name]) {
    await expect(membersList).toContainText(name)
  }
  await expect(membersList.getByRole('listitem')).toHaveCount(4)
  await page.getByTestId('view-group-dialog-header-close').click()
})

test('Edit group profile from context menu and rename group', async () => {
  const userA = existingProfiles[0]
  const userC = existingProfiles[2]
  await switchToProfile(page, userA.id)
  // switch to another chat
  await page.getByTestId('chat-self-talk').click()
  const chatListItem = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: groupName })
  // open context menu of group chat
  await chatListItem.click({ button: 'right' })
  // click edit group item
  await page.getByTestId('edit-group').click({ force: true })
  // open edit group profile dialog
  await page.getByTestId('view-group-dialog-header-edit').click()
  await page.locator('#groupname').fill(groupName + ' edited')
  await page.getByTestId('ok').click()
  await expect(page.locator('.styles_module_displayName')).toHaveText(
    groupName + ' edited'
  )
  await page.getByTestId('view-group-dialog-header-close').click()
  await switchToProfile(page, userC.id)
  const renamedGroupchatListItem = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: groupName + ' edited' })
  await expect(renamedGroupchatListItem).toBeVisible()
})

test.fixme('create channel and add members', async () => {})

test.fixme('accept or decline channel invite', async () => {})

test.fixme('leave channel and remove from channel', async () => {})
