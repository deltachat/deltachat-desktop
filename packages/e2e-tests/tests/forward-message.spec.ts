import { expect, type Page } from '@playwright/test'
import path from 'path'

import {
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

/**
 * This test suite covers basic forward message functionality:
 * - Forward a message to another chat in the same account (with confirmation)
 * - Forward a message to self-chat (without confirmation)
 * - Forward a message to another account using the account switcher
 */

test.describe.configure({ mode: 'serial' })

let existingProfiles: User[] = []

const numberOfProfiles = 2

let page: Page

const fixturesPath = path.join(import.meta.dirname, '..', 'fixtures')
const zipPath = path.join(fixturesPath, 'test.zip')

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

test('start chat between users', async ({ browserName }) => {
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
})

/**
 * Helper function to right-click on a message and click Forward
 */
async function openForwardDialog(pageRef: Page, messageText: string) {
  const message = pageRef.locator('.message').filter({ hasText: messageText })
  await message.click({ button: 'right' })
  await pageRef.getByRole('menuitem', { name: 'Forward' }).click()
  // Wait for the SelectChat dialog to appear
  await expect(pageRef.getByRole('dialog')).toContainText('Forward to')
}

test('forward message to another chat (same account, with confirmation)', async () => {
  const userA = getUser(0, existingProfiles)
  const userB = getUser(1, existingProfiles)

  // Switch to user A and send a message to user B
  await switchToProfile(page, userA.id)
  const messageText = `Test message to forward ${Date.now()}`

  // Go to Saved Messages and send a message there
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: 'Saved Messages' })
    .click()
  await page.locator('.create-or-edit-message-input').fill(messageText)
  await page.locator('button.send-button').click()

  // Right-click message and open forward dialog
  await openForwardDialog(page, messageText)

  // Select chat with userB in the forward dialog
  await page
    .getByRole('dialog')
    .locator('.chat-list-item')
    .filter({ hasText: userB.name })
    .click()

  // Confirmation dialog should appear
  const confirmDialog = page.getByTestId('confirm-dialog')
  await expect(confirmDialog).toBeVisible()
  await expect(confirmDialog).toContainText(
    `Forward messages to ${userB.name}?`
  )

  // Confirm the forward
  await confirmDialog.getByTestId('confirm').click()

  // Verify we're now in the chat with userB and the message is there
  await expect(page.getByRole('heading', { name: 'Chat' })).toContainText(
    userB.name
  )
  await expect(
    page.locator('.message').filter({ hasText: messageText })
  ).toHaveCount(1)
})

test('forward message to self-chat (without confirmation)', async () => {
  const userA = getUser(0, existingProfiles)
  const userB = getUser(1, existingProfiles)

  // Switch to user A and go to chat with user B
  await switchToProfile(page, userA.id)
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userB.name })
    .click()

  // Find a message to forward
  const messageToForward = page.locator('.message').first()

  // Right-click and forward
  await messageToForward.click({ button: 'right' })
  await page.locator('[role="menuitem"]').filter({ hasText: 'Forward' }).click()

  // Wait for the SelectChat dialog to appear
  await expect(page.getByRole('dialog')).toContainText('Forward to')

  // Click on "Saved Messages" chat
  await page
    .getByRole('dialog')
    .locator('.chat-list-item')
    .filter({ hasText: 'Saved Messages' })
    .click()

  // No confirmation dialog - forward happens directly
  // The message should be in the Saved Messages chat but we stay in
  // the chat with user B (forward to self-chat is similar to save message)
  // so just check that the forwarded message appears as last message in the
  // chat list (scope to main chat list, not dialog)
  await expect(
    page
      .locator('.chat-list .chat-list-item')
      .filter({ hasText: 'Saved Messages' })
  ).toContainText('Me: Forwarded: Test')
})

test('forward message to another account', async () => {
  const userA = getUser(0, existingProfiles)
  const userB = getUser(1, existingProfiles)

  // Switch to user A and go to chat with user B
  await switchToProfile(page, userA.id)
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userB.name })
    .click()

  // Send a unique message to forward
  const messageText = `Cross-account forward test ${Date.now()}`
  await page.locator('.create-or-edit-message-input').fill(messageText)
  await page.locator('button.send-button').click()

  // Wait for the message to appear
  await expect(
    page.locator('.message.outgoing').last().locator('.msg-body .text')
  ).toHaveText(messageText)

  // Right-click and forward
  await page.locator('.message.outgoing').last().click({ button: 'right' })
  await page.locator('[role="menuitem"]').filter({ hasText: 'Forward' }).click()

  // Wait for the SelectChat dialog to appear
  await expect(page.getByRole('dialog')).toContainText('Forward to')

  // Click the switch account button
  await page.getByTestId('switch-account-button').click()

  // Wait for the SelectAccountDialog to appear
  await expect(page.getByTestId('select-account-dialog')).toBeVisible()

  // Click on user B's account
  await page.getByTestId(`account-select-${userB.id}`).click()

  // The SelectChat dialog should now show user B's chats
  // Wait for the dialog to update (it should still be visible)
  await expect(page.getByRole('dialog')).toContainText('Forward to')

  // Click on Saved Messages in user B's account (no confirmation needed)
  await page
    .getByRole('dialog')
    .locator('.chat-list-item')
    .filter({ hasText: 'Saved Messages' })
    .click()

  // Click on Saved Messages in the main chat list to verify the message
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: 'Saved Messages' })
    .click()

  // Verify the message is there (it should show as forwarded)
  await expect(
    page.locator('.message').filter({ hasText: messageText })
  ).toBeVisible()
})

test('forward message with file attachment', async () => {
  const userA = getUser(0, existingProfiles)
  const userB = getUser(1, existingProfiles)

  // Switch to user A and go to chat with user B
  await switchToProfile(page, userA.id)
  // Go to Saved Messages and send a message there
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: 'Saved Messages' })
    .click()

  // Add a webxdc app from the picker
  await page.getByTestId('open-attachment-menu').click()
  await page.getByTestId('open-app-picker').click()
  const apps = page.locator('.styles_module_appPickerList button').first()
  await apps.waitFor({ state: 'visible' })

  // Search for an app to add
  await page.locator('.styles_module_searchInput').fill('Cal')
  const appName = 'Calendar'
  const calendarApp = page
    .locator('.styles_module_appPickerList button')
    .getByText(appName)
    .first()
  await expect(calendarApp).toBeVisible()
  await calendarApp.click()

  // Confirm adding the app
  const appInfoDialog = page.locator('.styles_module_dialogContent')
  await expect(appInfoDialog).toBeVisible()
  await page.getByTestId('add-app-to-chat').click()

  // Verify the app appears in the draft
  const appDraft = page.locator('.attachment-quote-section .text-part')
  await expect(appDraft).toContainText(appName)

  // Send the app
  await page.locator('button.send-button').click()

  // Wait for the webxdc message to appear
  const webxdcMessage = page.locator('.msg-body .webxdc').last()
  await expect(webxdcMessage).toContainText(appName)

  // Right-click on the webxdc message and forward it
  const messageWithWebxdc = page
    .locator('.message')
    .filter({ has: webxdcMessage })
  await messageWithWebxdc.click({ button: 'right' })
  await page.locator('[role="menuitem"]').filter({ hasText: 'Forward' }).click()

  // Wait for the SelectChat dialog to appear
  await expect(page.getByRole('dialog')).toContainText('Forward to')

  // Click the switch account button
  await page.getByTestId('switch-account-button').click()

  // Wait for the SelectAccountDialog to appear
  await expect(page.getByTestId('select-account-dialog')).toBeVisible()

  // Click on user B's account
  await page.getByTestId(`account-select-${userB.id}`).click()

  // The SelectChat dialog should now show user B's chats
  // Wait for the dialog to update (it should still be visible)
  await expect(page.getByRole('dialog')).toContainText('Forward to')

  // Forward to Saved Messages (no confirmation needed for self-chat)
  await page
    .getByRole('dialog')
    .locator('.chat-list-item')
    .filter({ hasText: 'Saved Messages' })
    .click()

  // Navigate to Saved Messages to verify the webxdc app was forwarded
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: 'Saved Messages' })
    .click()

  // Verify the forwarded webxdc app is visible in Saved Messages
  const forwardedWebxdcMessage = page.locator('.msg-body .webxdc').last()
  await expect(forwardedWebxdcMessage).toContainText(appName)

  // Verify it's marked as forwarded
  const forwardedMessage = page
    .locator('.message')
    .filter({ has: forwardedWebxdcMessage })
  await expect(forwardedMessage).toContainText('Forwarded')

  // Now test forwarding a zip file attachment
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByTestId('open-attachment-menu').click()
  await page.getByRole('menuitem', { name: 'File' }).click()

  // Upload the zip file
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(zipPath)

  // Wait for the file to appear in the draft
  const attachmentDraftPreview = page.locator(
    '.attachment-quote-section .message-attachment-generic'
  )
  await expect(attachmentDraftPreview).toBeVisible()
  await expect(attachmentDraftPreview).toContainText('test.zip')

  // Add a message text
  await page
    .locator('textarea.create-or-edit-message-input')
    .fill('Test file for forwarding')

  // Send the message to Saved messages
  await page.locator('button.send-button').click()

  // Verify the file message appears in the chat
  const fileMessage = page.locator('.message.outgoing').last()
  await expect(fileMessage).toBeVisible()
  await expect(fileMessage.locator('.msg-body')).toContainText('test.zip')

  // Right-click on the file message and forward it
  await fileMessage.click({ button: 'right' })
  await page.locator('[role="menuitem"]').filter({ hasText: 'Forward' }).click()

  // Wait for the SelectChat dialog to appear
  await expect(page.getByRole('dialog')).toContainText('Forward to')

  // Click the switch account button to forward to another account
  await page.getByTestId('switch-account-button').click()
  await expect(page.getByTestId('select-account-dialog')).toBeVisible()

  // Click on user A's account (forward back to original account)
  await page.getByTestId(`account-select-${userA.id}`).click()
  await expect(page.getByRole('dialog')).toContainText('Forward to')

  // Forward to Saved Messages
  await page
    .getByRole('dialog')
    .locator('.chat-list-item')
    .filter({ hasText: 'Saved Messages' })
    .click()

  // Verify the forwarded file message is visible
  const forwardedFileMessage = page.locator('.message').last()
  await expect(forwardedFileMessage).toBeVisible()
  await expect(forwardedFileMessage.locator('.msg-body')).toContainText(
    'test.zip'
  )
  await expect(forwardedFileMessage.locator('.msg-body .text')).toContainText(
    'Test file for forwarding'
  )
  // Verify it's marked as forwarded
  await expect(forwardedFileMessage).toContainText('Forwarded')
})
