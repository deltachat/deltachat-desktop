import { test, expect } from '@playwright/test'

import {
  getUser,
  createProfiles,
  deleteProfile,
  switchToProfile,
  User,
  loadExistingProfiles,
  clickThroughTestIds,
  reloadPage,
} from '../playwright-helper'

/**
 * This test suite covers basic functionalities like
 * creating profiles based on DCACCOUNT qr code
 * - invite a user
 * - start a chat
 * - send, edit, delete messages
 * - load and send webxdc app
 * - delete profile
 *
 * creating and deleting profiles also happens in
 * other tests in beforAll and afterAll so if this
 * test fails the other ones will also
 */

test.describe.configure({ mode: 'serial' })

let existingProfiles: User[] = []

const numberOfProfiles = 2

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()

  await reloadPage(page)

  existingProfiles = (await loadExistingProfiles(page)) ?? existingProfiles

  await context.close()
})

test.beforeEach(async ({ page }) => {
  await reloadPage(page)
})

/**
 * covers creating a profile with preconfigured
 * chatmail server on first start or after
 */
test('create profiles', async ({ page, context, browserName }) => {
  test.setTimeout(120_000)
  await createProfiles(
    numberOfProfiles,
    existingProfiles,
    page,
    context,
    browserName
  )
  expect(existingProfiles.length).toBe(numberOfProfiles)
})

test('start chat with user', async ({ page, context, browserName }) => {
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
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
  /* ignore-console-log */
  console.log(`Chat with ${userA.name} created!`)
})

/**
 * user A sends two messages to user B
 */
test('send message', async ({ page }) => {
  const userA = existingProfiles[0]
  const userB = existingProfiles[1]
  // prepare last open chat for receiving user
  await switchToProfile(page, userB.id)
  // the chat that receives the message should not be selected
  // when profile is selected
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: 'Saved Messages' })
    .click()
  await switchToProfile(page, userA.id)
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userB.name })
    .click()

  const messageText = `Hello ${userB.name}!`
  await page.locator('#composer-textarea').fill(messageText)
  await page.locator('button.send-button').click()

  const badgeNumber = page
    .getByTestId(`account-item-${userB.id}`)
    .locator('.styles_module_accountBadgeIcon')
  const sentMessageText = page
    .locator(`.message.outgoing`)
    .last()
    .locator('.msg-body .text')
  await expect(sentMessageText).toHaveText(messageText)
  await expect(badgeNumber).toHaveText('1')

  await page.locator('#composer-textarea').fill(`${messageText} 2`)
  await page.locator('button.send-button').click()

  await expect(sentMessageText).toHaveText(messageText + ' 2')
  await expect(badgeNumber).toHaveText('2')

  await switchToProfile(page, userB.id)
  const chatListItem = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userB.name })
  await expect(
    chatListItem.locator('.chat-list-item-message .text')
  ).toHaveText(messageText + ' 2')
  await expect(
    chatListItem
      .locator('.chat-list-item-message')
      .locator('.fresh-message-counter')
  ).toHaveText('2')
  await chatListItem.click()
  const receivedMessageText = page
    .locator(`.message.incoming`)
    .first()
    .locator(`.msg-body .text`)
  await expect(receivedMessageText).toHaveText(messageText)
})

/**
 * user A deletes one message for himself
 */
test('delete message', async ({ page }) => {
  const userA = existingProfiles[0]
  const userB = existingProfiles[1]
  await switchToProfile(page, userA.id)
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userB.name })
    .click()
  await page.locator('.message-wrapper').last().hover()
  const menuButtons = page.locator('.styles_module_shortcutMenuButton')
  await expect(menuButtons.last()).toBeVisible()
  await menuButtons.last().click()
  await page.locator('.dc-context-menu button').last().click()
  const deleteButton = page.getByTestId('delete_for_me')
  await expect(deleteButton).toBeVisible()
  await deleteButton.click()
  await switchToProfile(page, userB.id)
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userA.name })
    .click()
  await expect(page.locator('.message.incoming')).toHaveCount(2)
})

/**
 * user A deletes one message for all
 */
test('delete message for all', async ({ page }) => {
  const userA = existingProfiles[0]
  const userB = existingProfiles[1]
  await switchToProfile(page, userA.id)
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userB.name })
    .click()
  await page.locator('.message-wrapper').last().hover()
  const menuButtons = page.locator('.styles_module_shortcutMenuButton')
  await expect(menuButtons.last()).toBeVisible()
  await menuButtons.last().click()
  await page.locator('.dc-context-menu button').last().click()
  const deleteButton = page.getByTestId('delete_for_everyone')
  await expect(deleteButton).toBeVisible()
  await deleteButton.click()
  await switchToProfile(page, userB.id)
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userA.name })
    .click()
  await expect(page.locator('.message.incoming')).toHaveCount(1)
})

/**
 * user A sends and edits a message
 */
test('edit message', async ({ page }) => {
  const userA = existingProfiles[0]
  const userB = existingProfiles[1]
  await switchToProfile(page, userA.id)
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userB.name })
    .click()

  const originalMessageText = `Original message textttt`
  await page.locator('#composer-textarea').fill(originalMessageText)
  await page.locator('button.send-button').click()
  const lastMessageLocator = page
    .locator(`.message.outgoing`)
    .last()
    .locator('.msg-body .text')
  await expect(lastMessageLocator).toHaveText(originalMessageText)

  await lastMessageLocator.click({ button: 'right' })
  await page.locator('[role="menuitem"]').filter({ hasText: 'Edit ' }).click()
  await expect(page.locator('#composer-textarea')).toHaveValue(
    originalMessageText
  )
  const editedMessageText = `Edited message texttttt`
  await page.locator('#composer-textarea').fill(editedMessageText)
  await page.locator('button.send-button').click()
  await expect(lastMessageLocator).toHaveText(editedMessageText)
  await expect(page.locator('body')).not.toContainText(originalMessageText)

  await switchToProfile(page, userB.id)
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userA.name })
    .click()
  const lastReceivedMessage = page
    .locator(`.message.incoming`)
    .last()
    .locator(`.msg-body .text`)
  await expect(lastReceivedMessage).toHaveText(editedMessageText)
  await expect(page.locator('body')).not.toContainText(originalMessageText)
})

test('add app from picker to chat', async ({ page }) => {
  const userA = existingProfiles[0]
  const userB = existingProfiles[1]
  await switchToProfile(page, userA.id)
  const chatListItem = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userB.name })
  await chatListItem.click()
  await page.getByTestId('open-attachment-menu').click()
  await page.getByTestId('open-app-picker').click()
  const apps = page.locator('.styles_module_appPickerList button').first()
  await apps.waitFor({ state: 'visible' })
  const appsCount = await page
    .locator('.styles_module_appPickerList')
    .locator('button')
    .count()
  expect(appsCount).toBeGreaterThan(0)
  await page.locator('.styles_module_searchInput').fill('Cal')
  const appName = 'Calendar'
  const calendarApp = page
    .locator('.styles_module_appPickerList button')
    .getByText(appName)
    .first()
  await expect(calendarApp).toBeVisible()
  await calendarApp.click()
  const appInfoDialog = page.locator('.styles_module_dialogContent')
  await expect(appInfoDialog).toBeVisible()
  await page.getByTestId('add-app-to-chat').click()
  const appDraft = page.locator('.attachment-quote-section .text-part')
  await expect(appDraft).toContainText(appName)
  await page.locator('button.send-button').click()
  const webxdcMessage = page.locator('.msg-body .webxdc')
  await expect(webxdcMessage).toContainText(appName)
})

test('focuses first visible item on arrow down key on input in create chat dialog', async ({
  page,
}) => {
  const userA = existingProfiles[0]
  await switchToProfile(page, userA.id)
  await page.locator('#new-chat-button').click()
  await page.locator('dialog *:focus').waitFor({ state: 'visible' })
  await page.locator('*:focus').press('ArrowDown')

  // check if moved the focus down
  await expect(page.locator('*:focus')).toContainText('New Contact')
})

test('delete profiles', async ({ page }) => {
  if (existingProfiles.length < 1) {
    throw new Error('Not existing profiles to delete!')
  }
  for (let i = 0; i < existingProfiles.length; i++) {
    const profileToDelete = existingProfiles[i]
    const deleted = await deleteProfile(page, profileToDelete.id)
    expect(deleted).toContain(profileToDelete.name)
    if (deleted) {
      /* ignore-console-log */
      console.log(`User ${profileToDelete.name} was deleted!`)
    }
  }
})
