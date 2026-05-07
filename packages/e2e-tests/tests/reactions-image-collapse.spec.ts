import { expect, type Page } from '@playwright/test'
import path from 'path'

import {
  createProfiles,
  User,
  loadExistingProfiles,
  deleteAllProfiles,
  reloadPage,
  test,
  switchToProfile,
  getUser,
  createChat,
  selectChat,
} from '../playwright-helper'

/**
 * Regression test for https://github.com/deltachat/deltachat-desktop/issues/5858
 *
 * The test reproduces the race condition by delaying /blobs/** responses so the
 * initial measurement needs to be updated after the image loaded.
 */

test.describe.configure({ mode: 'serial' })
test.setTimeout(120_000)

let existingProfiles: User[] = []
const numberOfProfiles = 3
let page: Page

const fixturesPath = path.join(import.meta.dirname, '..', 'fixtures')
const imagePath = path.join(fixturesPath, 'Deltachat-Logo.png')
const testGroupName = 'Reactions Collapse Test Group'

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
  const userC = getUser(2, existingProfiles)

  // Establish contacts so userA can invite userB and userC to a group
  await createChat(userA, userB, setupPage, browser.browserType().name())
  await createChat(userA, userC, setupPage, browser.browserType().name())

  // Create group with all three users
  await switchToProfile(setupPage, userA.id)
  await setupPage.locator('#new-chat-button').click()
  await setupPage.locator('#newgroup button').click()
  await setupPage.locator('.group-name-input').fill(testGroupName)
  await setupPage.locator('#addmember button').click()
  const addMemberDialog = setupPage.getByTestId('add-member-dialog')
  await setupPage
    .locator('.contact-list-item')
    .filter({ hasText: userB.name })
    .click()
  await setupPage
    .locator('.contact-list-item')
    .filter({ hasText: userC.name })
    .click()
  await addMemberDialog.getByTestId('ok').click()
  await setupPage.getByTestId('group-create-button').click()
  await expect(
    setupPage
      .locator('.chat-list .chat-list-item')
      .filter({ hasText: testGroupName })
  ).toBeVisible()

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

test('reactions on image messages are not collapsed after image loads', async () => {
  const userA = getUser(0, existingProfiles)
  const userB = getUser(1, existingProfiles)
  const userC = getUser(2, existingProfiles)

  // userA sends an image to the group
  await switchToProfile(page, userA.id)
  await selectChat(page, testGroupName)

  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByTestId('open-attachment-menu').click()
  await page.getByRole('menuitem', { name: 'Image' }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(imagePath)
  await expect(
    page.locator(
      '.attachment-quote-section .message-attachment-media .attachment-content'
    )
  ).toBeVisible()
  await page.locator('button.send-button').click()

  const sentMessage = page.locator('.message.outgoing').last()
  await expect(
    sentMessage.locator('.msg-body img.attachment-content')
  ).toBeVisible()

  // userA reacts with ❤️
  await sentMessage.click({ button: 'right' })
  await page.getByRole('menu').getByRole('menuitem', { name: 'React' }).click()
  await page.getByRole('menuitemradio', { name: '❤️' }).click()
  await expect(sentMessage.getByText('❤️')).toBeVisible()

  // userB reacts with 👍
  await switchToProfile(page, userB.id)
  await selectChat(page, testGroupName)
  const receivedB = page.locator('.message.incoming').last()
  await expect(
    receivedB.locator('.msg-body img.attachment-content')
  ).toBeVisible()
  await receivedB.click({ button: 'right' })
  await page.getByRole('menu').getByRole('menuitem', { name: 'React' }).click()
  await page.getByRole('menuitemradio', { name: '👍' }).click()
  await expect(receivedB.getByText('👍')).toBeVisible()

  // userC reacts with 😂
  await switchToProfile(page, userC.id)
  await selectChat(page, testGroupName)
  const receivedC = page.locator('.message.incoming').last()
  await expect(
    receivedC.locator('.msg-body img.attachment-content')
  ).toBeVisible()
  await receivedC.click({ button: 'right' })
  await page.getByRole('menu').getByRole('menuitem', { name: 'React' }).click()
  await page.getByRole('menuitemradio', { name: '😂' }).click()
  await expect(receivedC.getByText('😂')).toBeVisible()

  // Back to userA: wait for all three reactions to arrive
  await switchToProfile(page, userA.id)
  await selectChat(page, testGroupName)
  await expect(sentMessage.getByText('👍')).toBeVisible()
  await expect(sentMessage.getByText('😂')).toBeVisible()

  // Intercept blob image requests with a delay so that the React useEffect
  // width measurement runs before the image finishes loading.
  await page.route('/blobs/**', async route => {
    await new Promise<void>(resolve => setTimeout(resolve, 1000))
    await route.continue()
  })

  await reloadPage(page)
  await switchToProfile(page, userA.id)
  await selectChat(page, testGroupName)

  const reloadedMessage = page.locator('.message.outgoing').last()
  const imgLocator = reloadedMessage.locator('.msg-body img.attachment-content')

  // Confirm the route delay is actually holding the image back
  await expect(
    imgLocator,
    'image should not be loaded yet due to route delay'
  ).toHaveJSProperty('naturalWidth', 0, { timeout: 200 })

  // While the image is still loading the container width is unknown, so the
  // reactions should be in their initial collapsed state — not all three
  // individual emojis should be visible at the same time.
  await expect(
    reloadedMessage.getByText(/\+\d+/),
    'reactions should be collapsed while image has not loaded yet'
  ).toBeVisible({ timeout: 200 })

  // Wait for the image to finish loading (naturalWidth > 0 means the browser
  // has decoded the image dimensions and the container has its final width)
  await expect(
    imgLocator,
    'image should become visible after the delayed load'
  ).toBeVisible({ timeout: 15_000 })

  await page.waitForFunction(
    () => {
      const imgs = document.querySelectorAll<HTMLImageElement>(
        '.message.outgoing .msg-body img.attachment-content'
      )
      if (imgs.length === 0) return false
      const img = imgs[imgs.length - 1]
      return img.complete && img.naturalWidth > 0
    },
    undefined,
    { timeout: 15_000 }
  )

  await page.unroute('/blobs/**')

  await expect(
    reloadedMessage.getByText(/\+\d+/),
    'reactions must not be collapsed after image loads'
  ).not.toBeVisible()
  await expect(reloadedMessage.getByText('❤️')).toBeVisible()
  await expect(reloadedMessage.getByText('👍')).toBeVisible()
  await expect(reloadedMessage.getByText('😂')).toBeVisible()
})
