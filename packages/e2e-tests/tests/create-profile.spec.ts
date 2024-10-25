import { test, expect } from '@playwright/test'

import {
  createNewProfile,
  getProfile,
  deleteProfile,
  switchToProfile,
  User,
} from '../playwright-helper'

const existingProfiles: User[] = []
// maybe use json file for existing profiles?
// const existingProfiles: User[] = [
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

const userNames = ['Alice', 'Bob', 'Chris', 'Denis', 'Eve']

test.beforeEach(async ({ page }) => {
  await page.goto('https://localhost:3000/')
  const accountList = page.locator('.styles_module_account')
  const existingAccountItems = await accountList.count()
  if (existingAccountItems > 0) {
    console.log('Existing accounts found:', existingAccountItems)
    if (existingAccountItems === 1) {
      const welcomeDialog = await page
        .locator('.styles_module_welcome')
        .isVisible()
      if (welcomeDialog) {
        // special case: when no account exists on app start a new empty
        // account is created but not yet persisted, so there are no
        // existing profiles in database yet
        return
      }
    }
    for (let i = 0; i < existingAccountItems; i++) {
      const account = accountList.nth(i)
      const id = await account.getAttribute('x-account-sidebar-account-id')
      if (id) {
        const p = await getProfile(page, id)
        existingProfiles.push(p)
      }
    }
    console.log(existingProfiles)
  }
})

/**
 * covers creating a profile with standard
 * chatmail server on first start or after
 */
test.skip('create profiles', async ({ page }) => {
  await page.goto('/')

  if (existingProfiles.length > 0) {
    // this test should only run on a fresh start
    throw new Error(
      'Existing profiles found in create profiles test! Aborting!'
    )
  }

  const userA = await createNewProfile(page, userNames[0])

  expect(userA.id).toBeDefined()

  console.log(`User ${userA.name} wurde angelegt!`, userA)

  const userB = await createNewProfile(page, userNames[1])

  expect(userB.id).toBeDefined()

  console.log(`User ${userB.name} wurde angelegt!`, userB)

  // userC = await createNewProfile(page, userC.name)

  // expect(userC.id).toBeDefined()

  // console.log(`User ${userC.name} wurde angelegt!`, userC)
})

test('start chat with user', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  if (existingProfiles.length < 2) {
    throw new Error('Not enough profiles for chat test!')
  }
  const userA = existingProfiles[0]
  const userB = existingProfiles[1]
  await switchToProfile(page, userA.id)

  await page.getByTestId('qr-scan-button').click()
  await page.getByTestId('copy-qr-code').click()
  await page.getByTestId('qr-dialog').getByTestId('close').click()
  // await page.locator('.styles_module_footerActions button').last().click()

  await switchToProfile(page, userB.id)

  await page.getByTestId('qr-scan-button').click()

  await page.getByTestId('show-qr-scan').click()

  await page.getByTestId('qr-reader-settings').click()

  const item = page.getByTestId('paste-from-clipboard')

  expect(await item.isVisible()).toBeTruthy()

  await item.click()

  const t = await page
    .locator('.styles_module_dialog')
    .last()
    .locator('.styles_module_dialogContent p')
    .textContent()

  console.log(t) // deactivate

  expect(t).toContain(userA.name)

  await page
    .locator('.styles_module_dialog')
    .last() // 2 dialogs are open! data-testid can't be added to ConfirmationDialog so far!
    .getByTestId('confirm')
    .click()
  expect(await page.locator('.navbar-chat-name').textContent()).toContain(
    userA.name
  )
  console.log(`Chat with ${userA.name} created!`)
})

test('send message', async ({ page }) => {
  if (existingProfiles.length < 2) {
    throw new Error('Not enough profiles for chat test!')
  }
  const userA = existingProfiles[0]
  const userB = existingProfiles[1]
  // prepare last open chat for receiving user
  await switchToProfile(page, userB.id)
  // the chat that receives the message should not be selected
  // when profile is selected
  await page.locator('.chat-list .chat-list-item').last().click()
  await switchToProfile(page, userA.id)
  const messageText = `Hello ${userB.name}!`
  page.locator('#composer-textarea').fill(messageText)
  page.locator('.send-button-wrapper button').click()
  const badgeNumber = await page
    .getByTestId(`account-item-${userB.id}`)
    .locator('.styles_module_accountBadgeIcon')
    .textContent()
  expect(badgeNumber).toBe('1')
  const sentMessageText = await page
    .locator(`.message.outgoing .msg-body .text`)
    .textContent()
  expect(sentMessageText).toEqual(messageText)
  page.getByTestId(`account-item-${userB.id}`).click()
  const chatListItem = page.locator('.chat-list .chat-list-item').first()
  expect(chatListItem).toHaveClass('has-unread')
  await expect(chatListItem.locator('.chat-list-item-message')).toHaveText(
    messageText
  )
  await expect(
    chatListItem
      .locator('.chat-list-item-message')
      .locator('.fresh-message-counter')
  ).toHaveText('1')
  await chatListItem.click()
  const receivedMessageText = await page
    .locator(`.message.incoming .msg-body .text`)
    .textContent()
  expect(receivedMessageText).toEqual(messageText)
})

test.skip('delete profiles', async ({ page }) => {
  await page.goto('/')
  if (existingProfiles.length < 1) {
    throw new Error('Not existing profiles to delete!')
  }
  for (let i = 0; i < existingProfiles.length; i++) {
    const profileToDelete = existingProfiles[i]
    const deleted = await deleteProfile(page, profileToDelete.id)
    expect(deleted).toContain(profileToDelete.name)
    if (deleted) {
      console.log(`User ${profileToDelete.name} wurde gelöscht!`)
    }
  }
})
