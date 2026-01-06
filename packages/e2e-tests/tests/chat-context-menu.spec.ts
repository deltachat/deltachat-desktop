import { expect, type Page } from '@playwright/test'

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

/**
 * E2E tests for chat context menus used in 2 scenarios:
 * 1. Chat list items (right-click context menu)
 * 2. Main chat view (3-dot menu button)
 *
 * These tests verify that the context menu items are
 * correct andthat the menu items work as expected.
 */

test.describe.configure({ mode: 'serial' })

expect.configure({ timeout: 5_000 })
test.setTimeout(60_000)

let existingProfiles: User[] = []

const numberOfProfiles = 2

let page: Page

const groupName = 'Test Context Menu Group'

// Helper functions
const openMainViewThreeDotMenu = async (p: Page) => {
  await p.locator('#three-dot-menu-button').click()
  await expect(p.getByRole('menu')).toBeVisible()
}

const openChatListContextMenu = async (p: Page, chatName: string) => {
  await p
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: chatName })
    .click({ button: 'right' })
  await expect(p.getByRole('menu')).toBeVisible()
}

const getMenuItems = (p: Page) => p.getByRole('menu').getByRole('menuitem')

const closeMenu = async (p: Page) => {
  await p.keyboard.press('Escape')
  await expect(p.getByRole('menu')).not.toBeVisible()
}

test.beforeAll(async ({ browser, isChatmail }) => {
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
  // Pressing Escape a bunch of times should reset the UI state
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

test.describe('Setup', () => {
  test('start chat between users', async ({ browserName }) => {
    if (browserName.toLowerCase().indexOf('chrom') > -1) {
      await page
        .context()
        .grantPermissions(['clipboard-read', 'clipboard-write'])
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

    // Send a message from userB to userA so that userA learns userB's display name
    await page
      .locator('.chat-list .chat-list-item')
      .filter({ hasText: userA.name })
      .click()
    await page.locator('#composer-textarea').fill(`Hello ${userA.name}!`)
    await page.locator('button.send-button').click()
    await expect(
      page.locator('.message.outgoing').last().locator('.msg-body .text')
    ).toHaveText(`Hello ${userA.name}!`)
  })

  test('create group chat', async ({ browserName }) => {
    if (browserName.toLowerCase().indexOf('chrom') > -1) {
      await page
        .context()
        .grantPermissions(['clipboard-read', 'clipboard-write'])
    }
    const userA = existingProfiles[0]
    const userB = existingProfiles[1]

    await switchToProfile(page, userA.id)

    // Create group with userB
    await page.locator('#new-chat-button').click()
    await page.locator('#newgroup button').click()
    await page.locator('.group-name-input').fill(groupName)
    await page.locator('#addmember button').click()

    const addMemberDialog = page.getByTestId('add-member-dialog')
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

    // Send a message to make it an active group
    await page.locator('#composer-textarea').fill('Hello group!')
    await page.locator('button.send-button').click()
  })
})

test.describe('Main View - 3-Dot Menu', () => {
  test('shows correct menu items for DM chat', async () => {
    const userA = existingProfiles[0]
    const userB = existingProfiles[1]

    await switchToProfile(page, userA.id)
    await page
      .locator('.chat-list .chat-list-item')
      .filter({ hasText: userB.name })
      .click()

    await openMainViewThreeDotMenu(page)

    // Main view menu items for DM chat
    await expect(getMenuItems(page)).toHaveText([
      'Search in Chat',
      'Archive Chat',
      'Disappearing Messages',
      'Mute Notifications',
      'Block Contact',
      'Clear Chat',
      'Delete Chat',
    ])

    await closeMenu(page)
  })

  test('shows correct menu items for Group chat', async () => {
    const userA = existingProfiles[0]

    await switchToProfile(page, userA.id)
    await page
      .locator('.chat-list .chat-list-item')
      .filter({ hasText: groupName })
      .click()

    await openMainViewThreeDotMenu(page)

    // Main view menu items for group chat (encrypted, member)
    await expect(getMenuItems(page)).toHaveText([
      'Search in Chat',
      'Archive Chat',
      'Disappearing Messages',
      'Mute Notifications',
      'Clone Chat',
      'Leave Group',
      'Clear Chat',
      'Delete Chat',
    ])

    await closeMenu(page)
  })

  test('search in chat focuses search input', async () => {
    const userA = existingProfiles[0]
    const userB = existingProfiles[1]

    await switchToProfile(page, userA.id)
    await page
      .locator('.chat-list .chat-list-item')
      .filter({ hasText: userB.name })
      .click()

    await openMainViewThreeDotMenu(page)
    await page.getByRole('menuitem', { name: 'Search in Chat' }).click()

    // Verify search input is focused
    const searchInput = page.getByRole('textbox', { name: 'Search' })
    await expect(searchInput).toBeFocused()
  })

  test('archive and unarchive chat from main view', async () => {
    const userA = existingProfiles[0]
    const userB = existingProfiles[1]

    await switchToProfile(page, userA.id)
    await page
      .locator('.chat-list .chat-list-item')
      .filter({ hasText: userB.name })
      .click()

    // Archive the chat
    await openMainViewThreeDotMenu(page)
    await page.getByRole('menuitem', { name: 'Archive Chat' }).click()

    // Verify chat is no longer in main list
    await expect(
      page.locator('.chat-list .chat-list-item').filter({ hasText: userB.name })
    ).not.toBeVisible()

    // Open archived chats
    await page.getByRole('button', { name: 'Archived Chats' }).click()
    await expect(
      page.locator('.chat-list .chat-list-item').filter({ hasText: userB.name })
    ).toBeVisible()

    // Select archived chat and unarchive
    await page
      .locator('.chat-list .chat-list-item')
      .filter({ hasText: userB.name })
      .click()

    await openMainViewThreeDotMenu(page)
    await expect(
      page.getByRole('menuitem', { name: 'Unarchive Chat' })
    ).toBeVisible()
    await page.getByRole('menuitem', { name: 'Unarchive Chat' }).click()

    // Go back to main list using the back button
    await page.getByRole('button', { name: 'back' }).click()
    await expect(
      page.locator('.chat-list .chat-list-item').filter({ hasText: userB.name })
    ).toBeVisible()
  })

  test('mute and unmute chat from main view', async () => {
    const userA = existingProfiles[0]
    const userB = existingProfiles[1]

    await switchToProfile(page, userA.id)
    await page
      .locator('.chat-list .chat-list-item')
      .filter({ hasText: userB.name })
      .click()

    // Mute the chat
    await openMainViewThreeDotMenu(page)
    await page.getByRole('menuitem', { name: 'Mute Notifications' }).click()
    await page.getByRole('menuitem', { name: 'Mute for 1 hour' }).click()

    // Verify mute icon appears in chat list
    const chatListItem = page
      .locator('.chat-list .chat-list-item')
      .filter({ hasText: userB.name })
    await expect(chatListItem.getByLabel('Mute')).toBeVisible()

    // Unmute the chat
    await openMainViewThreeDotMenu(page)
    await expect(page.getByRole('menuitem', { name: 'Unmute' })).toBeVisible()
    await page.getByRole('menuitem', { name: 'Unmute' }).click()

    // Verify mute icon is gone
    await expect(chatListItem.getByLabel('Mute')).not.toBeVisible()
  })

  test('clear chat removes messages', async () => {
    const userA = existingProfiles[0]
    const userB = existingProfiles[1]

    await switchToProfile(page, userA.id)
    await page
      .locator('.chat-list .chat-list-item')
      .filter({ hasText: userB.name })
      .click()

    // Clear the chat
    await openMainViewThreeDotMenu(page)
    await page.getByRole('menuitem', { name: 'Clear Chat' }).click()

    // Confirm the dialog (2 messages since we have a system message and the test message)
    await expect(page.getByRole('dialog')).toContainText(
      'Delete 2 messages on all your devices?'
    )
    await page.getByRole('dialog').getByRole('button', { name: 'Yes' }).click()

    // Verify messages are cleared
    await expect(page.locator('.message')).toHaveCount(0)
  })
})

test.describe('Chat List Context Menu - Single Selection', () => {
  test('shows correct menu items for DM chat', async () => {
    const userA = existingProfiles[0]
    const userB = existingProfiles[1]

    await switchToProfile(page, userA.id)

    await openChatListContextMenu(page, userB.name)

    // Chat list menu items for DM chat
    await expect(getMenuItems(page)).toHaveText([
      'Pin Chat',
      'Archive Chat',
      'Mute Notifications',
      'View Profile',
      'Block Contact',
      'Delete Chat',
      'Encryption Info',
    ])

    await closeMenu(page)
  })

  test('shows correct menu items for Group chat', async () => {
    const userA = existingProfiles[0]

    await switchToProfile(page, userA.id)

    await openChatListContextMenu(page, groupName)

    // Chat list menu items for group chat
    await expect(getMenuItems(page)).toHaveText([
      'Pin Chat',
      'Archive Chat',
      'Mute Notifications',
      'View Profile',
      'Clone Chat',
      'Leave Group',
      'Delete Chat',
      'Encryption Info',
    ])

    await closeMenu(page)
  })

  test('shows Unpin Chat when chat is pinned', async () => {
    const userA = existingProfiles[0]
    const userB = existingProfiles[1]

    await switchToProfile(page, userA.id)

    // Pin the chat first
    await openChatListContextMenu(page, userB.name)
    await page.getByRole('menuitem', { name: 'Pin Chat' }).click()

    // Open context menu again and verify Unpin is shown as first item
    await openChatListContextMenu(page, userB.name)
    await expect(getMenuItems(page).first()).toHaveText('Unpin Chat')

    // Unpin to restore state
    await page.getByRole('menuitem', { name: 'Unpin Chat' }).click()

    // Verify Pin Chat is back
    await openChatListContextMenu(page, userB.name)
    await expect(getMenuItems(page).first()).toHaveText('Pin Chat')
    await closeMenu(page)
  })

  test('View Profile opens profile dialog', async () => {
    const userA = existingProfiles[0]
    const userB = existingProfiles[1]

    await switchToProfile(page, userA.id)

    await openChatListContextMenu(page, userB.name)
    await page.getByRole('menuitem', { name: 'View Profile' }).click()

    // Verify profile dialog opens
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('dialog')).toContainText(userB.name)

    await page.keyboard.press('Escape')
  })

  test('Encryption Info opens encryption dialog', async () => {
    const userA = existingProfiles[0]
    const userB = existingProfiles[1]

    await switchToProfile(page, userA.id)

    await openChatListContextMenu(page, userB.name)
    await page.getByRole('menuitem', { name: 'Encryption Info' }).click()

    // Verify encryption info dialog opens
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('dialog')).toContainText('Encryption')

    await page.keyboard.press('Escape')
  })

  test('Clone Chat option for groups', async () => {
    const userA = existingProfiles[0]

    await switchToProfile(page, userA.id)

    await openChatListContextMenu(page, groupName)
    await page.getByRole('menuitem', { name: 'Clone Chat' }).click()

    // Verify clone chat dialog opens
    await expect(page.getByRole('dialog')).toBeVisible()
    // The clone dialog should show create group interface
    await expect(page.locator('.group-name-input')).toBeVisible()

    await page.keyboard.press('Escape')
  })
})

test.describe('Removal actions', () => {
  test('delete chat from main view closes the chat', async () => {
    const userA = existingProfiles[0]

    await switchToProfile(page, userA.id)

    // Create a disposable chat to delete
    await page.locator('#new-chat-button').click()
    await page.getByRole('button', { name: 'New Group' }).click()
    await page
      .getByRole('textbox', { name: 'Group Name' })
      .fill('Chat to delete')
    await page.getByTestId('group-create-button').click()

    // Verify the chat is selected
    await expect(
      page
        .locator('.chat-list .chat-list-item')
        .filter({ hasText: 'Chat to delete' })
    ).toBeVisible()

    // Delete from main view
    await openMainViewThreeDotMenu(page)
    await page.getByRole('menuitem', { name: 'Delete Chat' }).click()

    // Confirm deletion
    await expect(page.getByRole('dialog')).toContainText('Delete')
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Delete' })
      .click()

    // Verify chat is deleted from list
    await expect(
      page
        .locator('.chat-list .chat-list-item')
        .filter({ hasText: 'Chat to delete' })
    ).not.toBeVisible()
  })

  test('block contact from main view', async () => {
    const userA = existingProfiles[0]
    const userB = existingProfiles[1]

    await switchToProfile(page, userA.id)

    // First, ensure we have a chat with userB by selecting it
    await page
      .locator('.chat-list .chat-list-item')
      .filter({ hasText: userB.name })
      .click()

    // Block contact
    await openMainViewThreeDotMenu(page)
    await page.getByRole('menuitem', { name: 'Block Contact' }).click()

    // Confirm blocking
    await expect(page.getByRole('dialog')).toContainText('Block')
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Block' })
      .click()

    // Verify chat is removed (blocked contacts' chats are archived)
    await expect(
      page.locator('.chat-list .chat-list-item').filter({ hasText: userB.name })
    ).not.toBeVisible()

    // Unblock the contact to restore state for other tests
    await clickThroughTestIds(page, ['open-settings-button'])
    await page.getByRole('button', { name: 'Chats and Media' }).click()
    await page.getByRole('button', { name: 'Blocked Contacts' }).click()

    // Find and unblock userB
    await page
      .locator('.contact-list-item')
      .filter({ hasText: userB.name })
      .getByRole('button', { name: userB.name })
      .click()

    await page.keyboard.press('Escape')
    await page.keyboard.press('Escape')
  })
})
