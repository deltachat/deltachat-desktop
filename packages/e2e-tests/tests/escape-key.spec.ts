import { expect, type Page } from '@playwright/test'

import {
  importDummyProfileFromBackup,
  deleteSelectedProfile,
  reloadPage,
  test,
  createDummyChat,
  selectChat,
  openReactionsBar,
} from '../playwright-helper.js'

test.describe.configure({
  mode: 'serial',
})

expect.configure({ timeout: 5_000 })
test.setTimeout(30_000)

const chatName = 'Some chat'
const messageText = 'Some message'

// https://playwright.dev/docs/next/test-retries#reuse-single-page-between-tests
let page: Page
const textarea = () => page.locator('textarea.create-or-edit-message-input')
const selectedChat = () =>
  page.getByLabel('Chats').getByRole('tab', { selected: true })
const message = () =>
  page
    .getByRole('list', { name: 'Messages' })
    .getByRole('listitem')
    .locator('.message')
    .filter({ hasText: messageText })

const expectChatOpen = async () => {
  await expect(selectedChat()).toHaveCount(1)
  await expect(textarea()).toBeVisible()
}
const expectChatClosed = async () => {
  await expect(selectedChat()).toHaveCount(0)
  await expect(textarea()).not.toBeVisible()
}

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
  await reloadPage(page)
  await importDummyProfileFromBackup(page)

  await createDummyChat(page, chatName)
  await selectChat(page, chatName)
  await textarea().fill(messageText)
  await textarea().press('ControlOrMeta+Enter')
  await expect(message()).toBeVisible()
})

test.beforeEach(async () => {
  await selectChat(page, chatName)
  await expectChatOpen()
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
  await deleteSelectedProfile(pageForProfileDeletion)
  await context.close()
})

test('closes the chat when chat header is focused', async () => {
  await page.getByTestId('chat-info-button').focus()

  await page.keyboard.press('Escape')
  await expectChatClosed()
})

test('closes the chat when nothing is focused', async () => {
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur())

  await page.keyboard.press('Escape')
  await expectChatClosed()
})

test('closes the chat when focus is in the chat list', async () => {
  await page.getByRole('button', { name: 'New Chat' }).focus()

  await page.keyboard.press('Escape')
  await expectChatClosed()
})

test('closes the chat when an account in the sidebar is focused', async () => {
  await page.getByLabel('Switch Profile').getByRole('tab').first().focus()

  await page.keyboard.press('Escape')
  await expectChatClosed()
})

test('closes account context menu, then the chat', async () => {
  await page
    .getByLabel('Switch Profile')
    .getByRole('tab')
    .first()
    .click({ button: 'right' })
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(menu).not.toBeVisible()
  await expectChatOpen()

  await page.keyboard.press('Escape')
  await expectChatClosed()
})

test('closes settings dialog, then the chat', async () => {
  await page.getByRole('button', { name: 'Settings' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expectChatOpen()

  await page.keyboard.press('Escape')
  await expectChatClosed()
})

test('closes message actions menu, then the chat', async () => {
  await message().hover()
  await message().getByRole('button', { name: 'Message actions' }).click()
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(menu).not.toBeVisible()
  await expectChatOpen()

  await page.keyboard.press('Escape')
  await expectChatClosed()
})

test('closes reactions bar, then the chat', async () => {
  const reactionsBar = await openReactionsBar(page, message())
  await expect(reactionsBar.getByRole('menuitemradio').first()).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(reactionsBar).not.toBeVisible()
  await expectChatOpen()

  await page.keyboard.press('Escape')
  await expectChatClosed()
})

test('closes forward dialog, then the chat', async () => {
  await message().click({ button: 'right' })
  await page.getByRole('menuitem', { name: 'Forward' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('Forward to')

  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expectChatOpen()

  await page.keyboard.press('Escape')
  await expectChatClosed()
})
