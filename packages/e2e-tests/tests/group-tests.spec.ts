import { test, expect } from '@playwright/test'

import {
  groupName,
  getUser,
  createProfiles,
  switchToProfile,
  User,
  loadExistingProfiles,
  deleteAllProfiles,
} from '../playwright-helper'

test.describe.configure({ mode: 'serial' })

let existingProfiles: User[] = []

const numberOfProfiles = 4

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto('https://localhost:3000/')

  existingProfiles = (await loadExistingProfiles(page)) ?? existingProfiles
  await createProfiles(
    numberOfProfiles,
    existingProfiles,
    page,
    context,
    browser.browserType().name()
  )

  await context.close()
})

test.beforeEach(async ({ page }) => {
  await page.goto('https://localhost:3000/')
})

test.afterAll(async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto('https://localhost:3000/')
  await deleteAllProfiles(page, existingProfiles)
  await context.close()
})

test('start chat with user', async ({ page, context, browserName }) => {
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  }
  const userA = getUser(0, existingProfiles)
  const userB = getUser(1, existingProfiles)
  await switchToProfile(page, userA.id)
  // copy invite link from user A
  await page.getByTestId('qr-scan-button').click()
  await page.getByTestId('copy-qr-code').click()
  await page.getByTestId('confirm-qr-code').click()

  await switchToProfile(page, userB.id)
  // paste invite link in account of userB
  await page.getByTestId('qr-scan-button').click()
  await page.getByTestId('show-qr-scan').click()
  await page.getByTestId('paste').click()
  const confirmDialog = page.getByTestId('confirm-start-chat')
  await expect(confirmDialog).toContainText(userA.name)

  await page.getByTestId('confirm-start-chat').getByTestId('confirm').click()
  await expect(
    page.locator('.chat-list .chat-list-item').filter({ hasText: userA.name })
  ).toHaveCount(1)
  /* ignore-console-log */
  console.log(`Chat with ${userA.name} created!`)
})

test('create group', async ({ page, context, browserName }) => {
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  }
  const userA = getUser(0, existingProfiles)
  const userB = getUser(1, existingProfiles)
  const userC = getUser(2, existingProfiles)
  await switchToProfile(page, userA.id)
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
  await page.locator('#composer-textarea').fill(`Hello group members!`)
  await page.locator('button.send-button').click()
  const badgeNumber = page
    .getByTestId(`account-item-${userB.id}`)
    .locator('.styles_module_accountBadgeIcon')
  await expect(badgeNumber).toHaveText('1')
  // copy group invite link
  await page.getByTestId('chat-info-button').click()
  await page.locator('#showqrcode button').click()
  await page.getByTestId('copy-qr-code').click()
  await page.getByTestId('confirm-qr-code').click()
  await page.getByTestId('view-group-dialog-header-close').click()
  // paste invite link in account of userC
  await switchToProfile(page, userC.id)
  await page.getByTestId('qr-scan-button').click()
  await page.getByTestId('show-qr-scan').click()
  await page.getByTestId('paste').click()
  const confirmDialog = page.getByTestId('confirm-join-group')
  await expect(confirmDialog).toBeVisible()
  // confirm dialog should contain group name
  await expect(confirmDialog).toContainText(groupName)
  await page.getByTestId('confirm-join-group').getByTestId('confirm').click()
  // userA invited you to group message
  await expect(page.locator('#message-list li').nth(1)).toContainText(
    userA.address
  )
  // verified chat after response from userA
  await expect(page.locator('.verified-icon-info-msg')).toBeVisible()
  // userB has 2 new notifications now
  const badge = page
    .getByTestId(`account-item-${userB.id}`)
    .locator('.styles_module_accountBadgeIcon')
    .getByText('2')

  await expect(badge).toBeVisible()
})
