import { expect, type Page } from '@playwright/test'

import {
  getUser,
  createProfiles,
  switchToProfile,
  User,
  loadExistingProfiles,
  deleteAllProfiles,
  reloadPage,
  clickThroughTestIds,
  sendMessage,
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
  await sendMessage(page, userB.name, messageText)

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
