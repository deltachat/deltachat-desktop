import { expect, type Locator, type Page } from '@playwright/test'

import {
  createProfiles,
  switchToProfile,
  User,
  loadExistingProfiles,
  deleteAllProfiles,
  reloadPage,
  clickThroughTestIds,
  test,
  openReactionsBar,
  selectChat,
  sendMessage,
} from '../playwright-helper.js'

test.describe.configure({
  mode: 'serial',
})

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

const channelName = 'TestChannel'

test('create channel and add members', async ({ browserName }) => {
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  }
  const userA = existingProfiles[0]
  const userB = existingProfiles[1]

  await switchToProfile(page, userA.id)

  // Create a channel
  await page.locator('#new-chat-button').click()
  await page.locator('#newbroadcastlist button').click()
  await page.getByPlaceholder('Channel Name').fill(channelName)
  await page.getByRole('button', { name: 'Create' }).click()

  const channelChatItem = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: channelName })
  await expect(channelChatItem).toBeVisible()

  // Copy channel invite link from the channel profile
  await page.getByTestId('chat-info-button').click()
  await page.locator('#showqrcode button').click()
  await clickThroughTestIds(page, [
    'copy-qr-code',
    'confirm-qr-code',
    'view-group-dialog-header-close',
  ])

  // Subscribe userB by pasting the invite link
  await switchToProfile(page, userB.id)
  await clickThroughTestIds(page, ['qr-scan-button', 'show-qr-scan', 'paste'])

  const confirmDialog = page.getByTestId('confirm-join-channel')
  await expect(confirmDialog).toBeVisible()
  await expect(confirmDialog).toContainText(channelName)
  await confirmDialog.getByTestId('confirm').click()

  const channelChatItemB = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: channelName })
  await expect(channelChatItemB).toBeVisible()

  // Wait for the securejoin handshake while userB is still selected,
  // otherwise this message counts as a second unread one for the badge below.
  await expect(
    page
      .getByRole('list', { name: 'Messages' })
      .getByRole('listitem')
      .filter({ hasText: 'You joined the channel.' })
  ).toBeVisible()

  // userA posts a message to the channel
  await switchToProfile(page, userA.id)
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: channelName })
    .click()

  // Wait until userA's core has processed userB's subscription request
  // (header subtitle changes from "0 subscriber" to "1 subscriber")
  await expect(page.locator('.navbar-chat-subtitle')).toContainText(
    '1 subscriber'
  )

  const channelMsg = 'Hello channel!' + Math.random()
  await page.locator('textarea.create-or-edit-message-input').fill(channelMsg)
  await page.locator('button.send-button').click()
  const msg = page.locator('#message-list li.message-wrapper').last()
  await expect(msg).toContainText(channelMsg)

  const viewCount = msg.getByRole('status').filter({ hasText: '👁️' })
  await expect(viewCount).toHaveText('👁️0')

  // userB has 1 new notification now
  const badge = page
    .getByTestId(`account-item-${userB.id}`)
    .locator('.styles_module_accountBadgeIcon')
    .getByText('1')
  await expect(badge).toBeVisible()

  // userB sees the posted message
  await switchToProfile(page, userB.id)
  await channelChatItemB.click()
  await expect(
    page
      .locator('#message-list li.message-wrapper')
      .filter({ hasText: channelMsg })
  ).toBeVisible()

  await switchToProfile(page, userA.id)
  await expect(viewCount).toHaveText('👁️1')
})

test('accept or decline channel invite', async ({ browserName }) => {
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  }
  const userA = existingProfiles[0]
  const userC = existingProfiles[2]

  // Copy fresh invite link from userA's channel
  await switchToProfile(page, userA.id)
  const channelChatItem = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: channelName })
  await expect(channelChatItem).toBeVisible()
  await channelChatItem.click()
  await page.getByTestId('chat-info-button').click()
  await page.locator('#showqrcode button').click()
  await clickThroughTestIds(page, [
    'copy-qr-code',
    'confirm-qr-code',
    'view-group-dialog-header-close',
  ])

  // Switch to userC and DECLINE the invite
  await switchToProfile(page, userC.id)
  await clickThroughTestIds(page, ['qr-scan-button', 'show-qr-scan', 'paste'])

  const confirmDialog = page.getByTestId('confirm-join-channel')
  await expect(confirmDialog).toBeVisible()
  await expect(confirmDialog).toContainText(channelName)
  await confirmDialog.getByTestId('cancel').click()

  // Channel should NOT be in userC's chat list after declining
  const channelChatItemC = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: channelName })
  await expect(channelChatItemC).not.toBeVisible({ timeout: 1 })

  // Paste again and this time ACCEPT the invite
  await clickThroughTestIds(page, ['qr-scan-button', 'show-qr-scan', 'paste'])

  const confirmDialogAgain = page.getByTestId('confirm-join-channel')
  await expect(confirmDialogAgain).toBeVisible()
  await expect(confirmDialogAgain).toContainText(channelName)
  await confirmDialogAgain.getByTestId('confirm').click()

  // Channel should now be in userC's chat list
  await expect(channelChatItemC).toBeVisible()
})

test('add channel description and verify subscriber sees it', async () => {
  const userA = existingProfiles[0]
  const userB = existingProfiles[1]
  const channelDescription = 'This is a test channel description'

  // userA (owner) adds a description to the channel
  await switchToProfile(page, userA.id)
  const channelChatItem = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: channelName })
  await expect(channelChatItem).toBeVisible()
  await channelChatItem.click()

  await page.getByTestId('chat-info-button').click()
  await page.getByTestId('view-group-menu').click()
  await page.getByTestId('view-group-edit').click()

  await page.locator('#description').fill(channelDescription)
  await page.getByTestId('ok').click()

  // Description should be visible in the channel profile
  const descriptionDiv = page.getByTestId('profile-description')
  await expect(descriptionDiv).toBeVisible()
  await expect(descriptionDiv).toHaveText(channelDescription)

  await page.getByTestId('view-group-dialog-header-close').click()

  // Verify system message for the owner
  await expect(
    page
      .getByRole('list', { name: 'Messages' })
      .getByRole('listitem')
      .filter({ hasText: 'You changed the chat description.' })
  ).toBeVisible()

  // Verify subscriber (userB) sees the description change message
  await switchToProfile(page, userB.id)
  const channelChatItemB = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: channelName })
  await expect(channelChatItemB).toBeVisible()
  await channelChatItemB.click()

  // Wait for the description change to be received by userB before opening profile
  await expect(
    page
      .getByRole('list', { name: 'Messages' })
      .getByRole('listitem')
      .filter({ hasText: 'Chat description changed by' })
  ).toBeVisible()

  await page.getByTestId('chat-info-button').click()
  await expect(page.getByTestId('profile-description')).toBeVisible()
  await expect(page.getByTestId('profile-description')).toHaveText(
    channelDescription
  )
  await page.keyboard.press('Escape')
})

/** Opens the reactions dialog of `message` */
async function openReactionsDialog(page: Page, message: Locator) {
  await message.getByRole('button', { name: 'More Info' }).click()
  return page.getByRole('dialog')
}

test.describe('channel reactions', () => {
  let userA = existingProfiles[0]!
  let userB = existingProfiles[1]!
  const chatListItem = () =>
    page.getByLabel('Chats').getByRole('tab', { name: channelName })
  const messageText = 'My post 123.\nLike and subscribe.'
  const message = () =>
    page
      .getByRole('list', { name: 'Messages' })
      .getByRole('listitem')
      .filter({ hasText: messageText })
      .locator('.message') // Just the bubble and not the whole row

  test.beforeAll(async () => {
    userA = existingProfiles[0]!
    userB = existingProfiles[1]!

    await switchToProfile(page, userA.id)
    await selectChat(page, channelName)
    await sendMessage(page, channelName, messageText)

    await expect(message()).toBeVisible()
    await expect(message()).not.toContainText('😂')
  })

  test('owner can unmute channel', async () => {
    await switchToProfile(page, userA.id)

    // Channels are muted by default
    await expect(chatListItem().getByLabel('Mute')).toBeVisible()
    await chatListItem().click({ button: 'right' })
    await page.getByRole('menuitem', { name: 'Unmute' }).click()
    await expect(chatListItem().getByLabel('Mute')).not.toBeVisible()

    await chatListItem().click({ button: 'right' })
    await page.getByRole('menuitem', { name: 'Mute Notifications' }).click()
    await page.getByRole('menuitem', { name: 'Mute forever' }).click()
  })

  test('react', async () => {
    await switchToProfile(page, userB.id)
    await selectChat(page, channelName)

    await expect(message()).toBeVisible()

    // Subscribers can react although they can't send messages
    await expect(
      page.locator('textarea.create-or-edit-message-input')
    ).toHaveCount(0)

    const reactionsBar = await openReactionsBar(page, message())

    await expect(reactionsBar.getByRole('menuitemradio')).toHaveText([
      '👍',
      '👎',
      '❤️',
      '😂',
      '🙁',
    ])

    // No "Arbitrary emoji" button
    await expect(reactionsBar.getByRole('menuitem')).not.toBeVisible()
    await expect(reactionsBar.locator('> *')).toHaveCount(5)

    await page.getByRole('menuitemradio', { name: '😂' }).click()
    await expect(message()).toContainText('😂')
  })

  test('subscriber only sees the accumulated reactions', async () => {
    await switchToProfile(page, userB.id)
    await selectChat(page, channelName)

    const dialog = await openReactionsDialog(page, message())

    await expect(dialog).toHaveText('1 reaction' + '😂 1')
    await expect(dialog.getByRole('menuitemradio')).toHaveText(['😂 1'])
    // Subscribers don't get to know who reacted with what, so the rows are
    // the accumulated counts and not the contacts, which would be clickable
    await expect(dialog.getByRole('button')).toHaveCount(1)
    await expect(dialog.getByRole('listitem')).not.toBeVisible()
  })

  test('owner sees the reaction', async () => {
    await switchToProfile(page, userA.id)
    await selectChat(page, channelName)

    await expect(message()).toContainText('😂')
  })

  test('owner sees who reacted', async () => {
    await switchToProfile(page, userA.id)
    await selectChat(page, channelName)

    const rows = (await openReactionsDialog(page, message())).getByRole(
      'listitem'
    )
    await expect(rows).toHaveCount(1)
    // The row is a button, it opens the profile of the contact that reacted
    await expect(rows.getByRole('button')).toHaveCount(1)
    await expect(rows.first()).toContainText(userB.name)
  })

  test('owner can only use the default reactions', async () => {
    await switchToProfile(page, userA.id)
    await selectChat(page, channelName)

    const reactionsBar = await openReactionsBar(page, message())
    await expect(reactionsBar.getByRole('menuitemradio')).toHaveCount(5)
    await expect(reactionsBar.getByRole('menuitem')).toHaveCount(0)
  })
})

test('channel profile three-dot menu shows encryption info', async () => {
  const userB = existingProfiles[1]

  // userB is a subscriber, so opening the channel
  // profile shows the MailingListProfile dialog
  await switchToProfile(page, userB.id)
  const channelChatItemB = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: channelName })
  await expect(channelChatItemB).toBeVisible()
  await channelChatItemB.click()

  await page.getByTestId('chat-info-button').click()

  // Open the three-dot menu and pick "Encryption Info"
  await page.getByTestId('mailing-list-profile-menu').click()
  await page.getByTestId('encryption-info').click({ force: true })

  const encryptionInfoDialog = page
    .getByRole('dialog')
    .filter({ hasText: 'Encryption Info' })
  await expect(encryptionInfoDialog).toBeVisible()

  await page.keyboard.press('Escape')
  await page.keyboard.press('Escape')
})

test('channel main view shows Leave Channel instead of Delete Chat', async () => {
  const userB = existingProfiles[1]

  await switchToProfile(page, userB.id)
  const channelChatItemB = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: channelName })
  await expect(channelChatItemB).toBeVisible()
  await channelChatItemB.click()

  await page.locator('#three-dot-menu-button').click()
  await expect(page.getByRole('menu')).toBeVisible()

  // Subscriber should see Leave Channel instead of Delete Chat
  await expect(
    page.getByRole('menuitem', { name: 'Leave Channel' })
  ).toBeVisible()
  await expect(
    page.getByRole('menuitem', { name: 'Delete Chat' })
  ).not.toBeVisible()

  await page.keyboard.press('Escape')
})

test('leave channel and remove from channel', async () => {
  const userA = existingProfiles[0]
  const userB = existingProfiles[1]
  const userC = existingProfiles[2]

  // userB leaves the channel via main view 3-dot menu
  await switchToProfile(page, userB.id)
  const channelChatItemB = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: channelName })
  await expect(channelChatItemB).toBeVisible()
  await channelChatItemB.click()
  await page.locator('#three-dot-menu-button').click()
  await expect(page.getByRole('menu')).toBeVisible()
  await page.getByRole('menuitem', { name: 'Leave Channel' }).click()
  const leaveDialog = page.getByRole('dialog')
  await expect(leaveDialog).toContainText('Are you sure you want to leave?')
  await leaveDialog.getByRole('button', { name: 'Leave Channel' }).click()

  // userA removes userC from the channel via the channel profile
  await switchToProfile(page, userA.id)
  const channelChatItemA = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: channelName })
  await expect(channelChatItemA).toBeVisible()
  await channelChatItemA.click()
  await page.getByTestId('chat-info-button').click()

  const userCRow = page
    .locator('.group-member-contact-list-wrapper .contact-list-item')
    .filter({ hasText: userC.name })
    .first()
  await userCRow.locator('button.btn-remove').click()
  await page
    .getByTestId('remove-group-member-dialog')
    .getByTestId('confirm')
    .click()

  // userC should no longer appear in the recipients list
  await expect(
    page
      .locator('.group-member-contact-list-wrapper .contact-list-item')
      .filter({ hasText: userC.name })
  ).not.toBeVisible()

  await page.getByTestId('view-group-dialog-header-close').click()
})
