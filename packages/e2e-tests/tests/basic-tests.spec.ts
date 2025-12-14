import { expect, type Page } from '@playwright/test'

import {
  getUser,
  createProfiles,
  deleteProfile,
  switchToProfile,
  User,
  loadExistingProfiles,
  clickThroughTestIds,
  reloadPage,
  sendMessage,
  test,
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

// https://playwright.dev/docs/next/test-retries#reuse-single-page-between-tests
let page: Page

test.beforeAll(async ({ browser, isChatmail }) => {
  console.log(
    `Running tests with ${isChatmail ? 'chatmail' : 'plain email'} profiles`
  )

  const contextForProfiles = await browser.newContext()
  const pageForProfiles = await contextForProfiles.newPage()

  await reloadPage(pageForProfiles)

  existingProfiles =
    (await loadExistingProfiles(pageForProfiles)) ?? existingProfiles

  await contextForProfiles.close()
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

test.afterAll(async () => {
  await page?.close()
})

test('create profiles', async ({ browserName, isChatmail }) => {
  test.setTimeout(120_000)
  await createProfiles(
    numberOfProfiles,
    existingProfiles,
    page,
    browserName,
    isChatmail
  )
  expect(existingProfiles.length).toBe(numberOfProfiles)
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
})

/**
 * user A sends two messages to user B
 */
test('send message', async () => {
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

test('message menu items presence', async () => {
  const userA = existingProfiles[0]
  const userB = existingProfiles[1]
  await switchToProfile(page, userA.id)
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userB.name })
    .click()

  const someRegularOutgoingMessage = page
    .getByLabel('Messages')
    .getByText('Hello')
    .first()
  await someRegularOutgoingMessage.click({ button: 'right' })
  await expect(page.getByRole('menu').getByRole('menuitem')).toHaveText([
    'Reply',
    'Forward',
    'Save Message',
    'React',
    'Edit',
    'Copy Text',
    'Resend',
    'Info',
    'Delete Message',
  ])
  await page.keyboard.press('Escape')

  const someInfoMessage = page
    .getByLabel('Messages')
    .getByText('Messages are end-to-end encrypted')
    .first()
  await someInfoMessage.click({ button: 'right' })
  await expect(page.getByRole('menu').getByRole('menuitem')).toHaveText([
    'Forward',
    'Copy Text',
    'Info',
    'Delete Message',
  ])
  await page.keyboard.press('Escape')
})

/**
 * user A deletes one message for himself
 */
test('delete message', async () => {
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
test('delete message for all', async () => {
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
test('edit message', async () => {
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

test('add app from picker to chat', async () => {
  const userA = existingProfiles[0]
  const userB = existingProfiles[1]
  await switchToProfile(page, userA.id)
  const chatListItem = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userB.name })
  await chatListItem.click()

  // Check initial number of app icons (if any exist)
  const initialAppIconsCount = await page
    .getByTestId('last-used-apps')
    .locator('img')
    .count()

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

  // Check if the new app icon appears in the AppIcons component in the navbar
  const appIconsContainer = page.getByTestId('last-used-apps')
  await expect(appIconsContainer).toBeVisible()

  // Check if the Calendar app icon is present in the navbar
  const calendarAppIcon = appIconsContainer.locator(
    'img[alt="' + appName + '"]'
  )
  await expect(calendarAppIcon).toBeVisible()

  // Verify that the number of app icons has increased
  const finalAppIconsCount = await page
    .getByTestId('last-used-apps')
    .locator('img')
    .count()
  expect(finalAppIconsCount).toBeGreaterThan(initialAppIconsCount)
})

test('focuses first visible item on arrow down key on input in create chat dialog', async () => {
  const userA = existingProfiles[0]
  await switchToProfile(page, userA.id)
  await page.locator('#new-chat-button').click()
  await page.locator('dialog *:focus').waitFor({ state: 'visible' })
  await page.locator('*:focus').press('ArrowDown')

  // check if moved the focus down
  await expect(page.locator('*:focus')).toContainText('New Contact')
})

test('correct handling of changed profile displaynames', async () => {
  const userA = existingProfiles[0]
  const userB = existingProfiles[1]
  const newDisplayName = 'Alice Wonderland'
  await switchToProfile(page, userA.id)
  // helper function to repeatedly edit the profile name
  const editProfileName = async (name: string) => {
    await clickThroughTestIds(page, [
      'open-settings-button',
      'edit-profile-button',
    ])
    await page.getByTestId('displayname-input').fill(name)
    await clickThroughTestIds(page, ['ok', 'settings-close'])

    // send a message to user B to trigger the update in his account
    await sendMessage(page, userB.name, 'I just changed my display name!')
  }
  await editProfileName(newDisplayName)

  // now user B should see the new display name of user A
  await switchToProfile(page, userB.id)
  await expect(
    page
      .locator('.chat-list .chat-list-item')
      .filter({ hasText: newDisplayName })
  ).toBeVisible()

  // now user B edits the contact name for user A
  const contactNameGivenByMe = 'Alice (my friend)'
  // open the chat with user A
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: newDisplayName })
    .click()
  const chatHeading = page.getByRole('heading', { name: 'Chat' })
  await expect(chatHeading).toContainText(newDisplayName)
  await page.getByTestId('chat-info-button').click()
  await page.locator('#view-profile-menu').click()
  await page.getByTestId('edit-contact-name').click()
  await page.getByTestId('edit-contact-name-input').fill(contactNameGivenByMe)
  await page.getByTestId('ok').click()
  await page.getByTestId('dialog-header-close').click()
  // profile shows the name I gave to the contact
  await expect(chatHeading).toContainText(contactNameGivenByMe)

  await switchToProfile(page, userA.id)
  await editProfileName('Alice Wonderland 2')
  // now user A changes the display name again
  await switchToProfile(page, userB.id)
  // but the name I gave to the contact should not be updated
  await expect(
    page
      .locator('.chat-list .chat-list-item')
      .filter({ hasText: contactNameGivenByMe })
  ).toBeVisible()
})

test('delete profiles', async () => {
  if (existingProfiles.length < 1) {
    throw new Error('Not existing profiles to delete!')
  }
  for (let i = 0; i < existingProfiles.length; i++) {
    const profileToDelete = existingProfiles[i]
    const deleted = await deleteProfile(page, profileToDelete.id)
    expect(deleted).toContain(profileToDelete.name)
    if (deleted) {
      console.log(`User ${profileToDelete.name} was deleted!`)
    }
  }
})
