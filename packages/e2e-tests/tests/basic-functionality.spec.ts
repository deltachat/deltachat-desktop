import { test, expect } from '@playwright/test'

import {
  createNewProfile,
  deleteProfile,
  switchToProfile,
  User,
  loadExistingProfiles,
} from '../playwright-helper'

test.describe.configure({ mode: 'serial' })

let existingProfiles: User[] = []

// uncomment to debug single steps
// existingProfiles = [
//   {
//     id: '1',
//     name: 'Alice',
//     address: 'pscoqguj0@nine.testrun.org',
//   },
//   {
//     id: '2',
//     name: 'Bob',
//     address: '5f6tjbd08@nine.testrun.org',
//   },
// ]

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto('https://localhost:3000/')

  existingProfiles = (await loadExistingProfiles(page)) ?? existingProfiles

  await context.close()
})

test.beforeEach(async ({ page }) => {
  await page.goto('https://localhost:3000/')
})

const userNames = ['Alice', 'Bob', 'Chris', 'Denis', 'Eve']

const getUser = (index: number) => {
  if (!existingProfiles || existingProfiles.length < index + 1) {
    throw new Error('Not enough profiles for test!')
  }
  if (existingProfiles.length < 2) {
    throw new Error('Not enough profiles for chat test!')
  }
  return existingProfiles[index]
}

/**
 * covers creating a profile with standard
 * chatmail server on first start or after
 */
test('create profiles', async ({ page }) => {
  if (existingProfiles.length > 0) {
    // this test should only run on a fresh start
    throw new Error(
      'Existing profiles found in create profiles test! Aborting!'
    )
  }

  const userA = await createNewProfile(page, userNames[0])

  expect(userA.id).toBeDefined()

  existingProfiles.push(userA)
  /* ignore-console-log */
  console.log(`User ${userA.name} wurde angelegt!`, userA)

  const userB = await createNewProfile(page, userNames[1])

  expect(userB.id).toBeDefined()

  existingProfiles.push(userB)
  /* ignore-console-log */
  console.log(`User ${userB.name} wurde angelegt!`, userB)
})

test('start chat with user', async ({ page, context, browserName }) => {
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  }
  const userA = getUser(0)
  const userB = getUser(1)
  await switchToProfile(page, userA.id)

  await page.getByTestId('qr-scan-button').click()
  await page.getByTestId('copy-qr-code').click()
  await page.getByTestId('qr-dialog').getByTestId('close').click()

  await switchToProfile(page, userB.id)

  await page.getByTestId('qr-scan-button').click()

  await page.getByTestId('show-qr-scan').click()

  await page.getByTestId('paste').click()

  const t = await page
    .locator('.styles_module_dialog')
    .last()
    .locator('.styles_module_dialogContent p')
    .textContent()

  expect(t).toContain(userA.name)

  await page
    .locator('.styles_module_dialog')
    .last() // 2 dialogs are open! data-testid can't be added to ConfirmationDialog so far!
    .getByTestId('confirm')
    .click()
  await expect(
    page.locator('.chat-list .chat-list-item').filter({ hasText: userA.name })
  ).toHaveCount(1)
  /* ignore-console-log */
  console.log(`Chat with ${userA.name} created!`)
})

test('send message', async ({ page }) => {
  const userA = getUser(0)
  const userB = getUser(1)
  // prepare last open chat for receiving user
  await switchToProfile(page, userB.id)
  // the chat that receives the message should not be selected
  // when profile is selected
  await page.locator('.chat-list .chat-list-item').last().click()
  await switchToProfile(page, userA.id)
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userB.name })
    .click()
  const messageText = `Hello ${userB.name}!`
  page.locator('#composer-textarea').fill(messageText)
  page.locator('.send-button-wrapper button').click()
  const badgeNumber = await page
    .getByTestId(`account-item-${userB.id}`)
    .locator('.styles_module_accountBadgeIcon')
    .textContent()
  expect(badgeNumber).toBe('1')
  const sentMessageText = await page
    .locator(`.message.outgoing`)
    .last()
    .locator('.msg-body .text')
    .textContent()
  expect(sentMessageText).toEqual(messageText)
  await switchToProfile(page, userB.id)
  const chatListItem = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userB.name })
  await expect(
    chatListItem.locator('.chat-list-item-message .text')
  ).toHaveText(messageText)
  await expect(
    chatListItem
      .locator('.chat-list-item-message')
      .locator('.fresh-message-counter')
  ).toHaveText('1')
  await chatListItem.click()
  const receivedMessageText = await page
    .locator(`.message.incoming`)
    .last()
    .locator(`.msg-body .text`)
    .textContent()
  expect(receivedMessageText).toEqual(messageText)
})

test.skip('add app from picker to chat', async ({ page }) => {
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
  expect(calendarApp).toBeVisible()
  calendarApp.click()
  const appInfoDialog = page.locator('.styles_module_dialogContent')
  await expect(appInfoDialog).toBeVisible()
  await page.getByTestId('add-app-to-chat').click()
  const appDraft = page.locator('.attachment-quote-section .text-part')
  await expect(appDraft).toContainText(appName)
  await page.locator('.send-button-wrapper button').click()
  const webxdcMessage = page.locator('.msg-body .webxdc')
  await webxdcMessage.isVisible()
  expect(webxdcMessage).toContainText(appName)
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
