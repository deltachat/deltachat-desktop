import { expect, type Page } from '@playwright/test'

import {
  createChat,
  createProfiles,
  deleteAllProfiles,
  getUser,
  loadExistingProfiles,
  reloadPage,
  selectChat,
  sendMessage,
  switchToProfile,
  test,
  User,
} from '../playwright-helper.js'

test.describe.configure({ mode: 'serial' })

let existingProfiles: User[] = []
const numberOfProfiles = 2
let page: Page

const firstMessage = 'first message to pin'
const secondMessage = 'second message to pin'

test.beforeAll(async ({ browser, isChatmail }) => {
  const ctx = await browser.newContext()
  const setupPage = await ctx.newPage()
  await reloadPage(setupPage)

  existingProfiles = (await loadExistingProfiles(setupPage)) ?? existingProfiles

  await createProfiles(
    numberOfProfiles,
    existingProfiles,
    setupPage,
    browser.browserType().name(),
    isChatmail
  )
  const userA = getUser(0, existingProfiles)
  const userB = getUser(1, existingProfiles)
  await createChat(userA, userB, setupPage, browser.browserType().name())

  await ctx.close()
  page = await browser.newPage()
  await reloadPage(page)
})

test.afterEach(async () => {
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Escape')
  }
})

test.afterAll(async ({ browser }) => {
  await page?.close()
  const ctx = await browser.newContext()
  const cleanupPage = await ctx.newPage()
  await reloadPage(cleanupPage)
  await deleteAllProfiles(cleanupPage, existingProfiles)
  await ctx.close()
})

function getMessage(page: Page, text: string) {
  return page
    .getByRole('list', { name: 'Messages' })
    .getByRole('listitem')
    .filter({ has: page.locator('.message'), hasText: text })
}

function getBanner(page: Page) {
  return page.getByRole('button', { name: /^Pinned/ })
}

async function clickContextMenuItem(page: Page, text: string, item: string) {
  await getMessage(page, text).locator('.message').click({ button: 'right' })
  await page.getByRole('menu').getByRole('menuitem', { name: item }).click()
}

test('pin a message and see it pinned on the other side', async () => {
  const userA = getUser(0, existingProfiles)
  const userB = getUser(1, existingProfiles)

  await switchToProfile(page, userA.id)
  await sendMessage(page, userB.name, firstMessage)
  await sendMessage(page, userB.name, secondMessage)

  await expect(getBanner(page)).not.toBeVisible()
  await clickContextMenuItem(page, firstMessage, 'Pin')

  await expect(
    page.locator('.info-message').filter({ hasText: 'You pinned a message.' })
  ).toBeVisible()
  await expect(getBanner(page)).toContainText(firstMessage)
  await expect(
    getMessage(page, firstMessage).getByLabel('Pinned', { exact: true })
  ).toBeVisible()
  await expect(
    getMessage(page, secondMessage).getByLabel('Pinned', { exact: true })
  ).not.toBeVisible()

  await switchToProfile(page, userB.id)
  await selectChat(page, userA.name)
  await expect(
    page
      .locator('.info-message')
      .filter({ hasText: `Message pinned by ${userA.name}.` })
  ).toBeVisible()
  await expect(getBanner(page)).toContainText(firstMessage)
  await expect(
    getMessage(page, firstMessage).getByLabel('Pinned', { exact: true })
  ).toBeVisible()
})

test('banner cycles through several pinned messages', async () => {
  const userA = getUser(0, existingProfiles)
  const userB = getUser(1, existingProfiles)

  await switchToProfile(page, userB.id)
  await selectChat(page, userA.name)
  await clickContextMenuItem(page, secondMessage, 'Pin')

  // The newly pinned message is shown first.
  const banner = getBanner(page)
  await expect(banner).toContainText(secondMessage)
  await expect(banner).toContainText('2/2')

  // Clicking jumps to the shown message and moves on to the older one…
  await banner.click()
  await expect(getMessage(page, secondMessage)).toHaveClass(/highlight/)
  await expect(banner).toContainText(firstMessage)
  await expect(banner).toContainText('1/2')

  // …and wraps around to the newest one.
  await banner.click()
  await expect(getMessage(page, firstMessage)).toHaveClass(/highlight/)
  await expect(banner).toContainText(secondMessage)
  await expect(banner).toContainText('2/2')

  // The pin is synced to the other side.
  await switchToProfile(page, userA.id)
  await selectChat(page, userB.name)
  await expect(getBanner(page)).toContainText('2/2')
})

test('clicking the info message jumps to the pinned message', async () => {
  const userA = getUser(0, existingProfiles)
  const userB = getUser(1, existingProfiles)

  await switchToProfile(page, userB.id)
  await selectChat(page, userA.name)
  // Highlight the other pinned message first,
  // so that the jump below is actually observable.
  await getBanner(page).click()
  await expect(getMessage(page, secondMessage)).toHaveClass(/highlight/)

  await page
    .locator('.info-message')
    .filter({ hasText: `Message pinned by ${userA.name}.` })
    .getByRole('button')
    .click()
  await expect(getMessage(page, firstMessage)).toHaveClass(/highlight/)
  await expect(getMessage(page, secondMessage)).not.toHaveClass(/highlight/)
})

test('unpin a message', async () => {
  const userA = getUser(0, existingProfiles)
  const userB = getUser(1, existingProfiles)

  await switchToProfile(page, userA.id)
  await selectChat(page, userB.name)
  await clickContextMenuItem(page, secondMessage, 'Unpin')

  const banner = getBanner(page)
  await expect(banner).toContainText(firstMessage)
  await expect(banner).not.toContainText('/2')
  await expect(
    getMessage(page, secondMessage).getByLabel('Pinned', { exact: true })
  ).not.toBeVisible()

  await switchToProfile(page, userB.id)
  await selectChat(page, userA.name)
  await expect(getBanner(page)).toContainText(firstMessage)
  await expect(getBanner(page)).not.toContainText('/2')

  await clickContextMenuItem(page, firstMessage, 'Unpin')
  await expect(getBanner(page)).not.toBeVisible()

  await switchToProfile(page, userA.id)
  await selectChat(page, userB.name)
  await expect(getBanner(page)).not.toBeVisible()
})

test('banner shows a start button for a pinned webxdc app', async () => {
  const userA = getUser(0, existingProfiles)
  const userB = getUser(1, existingProfiles)

  await switchToProfile(page, userA.id)
  await selectChat(page, userB.name)

  await page.getByTestId('open-attachment-menu').click()
  await page.getByTestId('open-app-picker').click()
  await page.locator('.styles_module_searchInput').fill('Cal')
  const appName = 'Calendar'
  await page
    .locator('.styles_module_appPickerList button')
    .getByText(appName)
    .first()
    .click()
  await page.getByTestId('add-app-to-chat').click()
  await expect(
    page.locator('.attachment-quote-section .text-part')
  ).toContainText(appName)
  await page.locator('button.send-button').click()
  await expect(page.locator('.msg-body .webxdc').last()).toContainText(appName)

  await clickContextMenuItem(page, appName, 'Pin')
  await expect(getBanner(page)).toContainText(appName)
  await expect(
    getBanner(page).locator('..').getByRole('button', { name: 'Start…' })
  ).toBeVisible()
})
