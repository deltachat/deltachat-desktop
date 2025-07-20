import { test, expect } from '@playwright/test'

import {
  createProfiles,
  User,
  loadExistingProfiles,
  deleteAllProfiles,
  reloadPage,
} from '../playwright-helper'

test.describe.configure({ mode: 'serial' })

let existingProfiles: User[] = []

const numberOfProfiles = 1

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()

  await reloadPage(page)

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
  await reloadPage(page)
})

test.afterAll(async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()
  await reloadPage(page)
  await deleteAllProfiles(page, existingProfiles)
  await context.close()
})

const emailSubject = 'some subjecttt'

test('check "New E-Mail" option presence', async ({ page }) => {
  await page.locator('#new-chat-button').click()

  await expect(page.getByRole('button', { name: 'New Group' })).toBeVisible()

  // Since we're on a Chatmail server, this button is not supposed to be shown.
  const newEmailButton = page.getByRole('button', { name: 'New E-Mail' })
  await expect(newEmailButton).not.toBeVisible()
  // Same button, but double-check, by ID.
  await expect(page.locator('#newemail')).not.toBeVisible({ timeout: 1 })
})

test('create unencrypted group (email)', async ({ page }) => {
  // But we can still test unencrypted group creation itself,
  // despite the fact that sending messages won't work.
  await page.locator('#new-chat-button').click()
  await page.evaluate(() => {
    ;(window as any).__testForceShowNewEmailButton(true)
  })

  await page.getByRole('button', { name: 'New E-Mail' }).click()
  const createChatDialog = page.getByTestId('create-chat-dialog')
  await expect(
    createChatDialog.getByRole('heading', { name: 'New E-Mail' })
  ).toBeVisible()
  await expect(
    createChatDialog.getByRole('button', { name: 'Change Group Image' })
  ).not.toBeVisible({ timeout: 1 })
  await expect(
    createChatDialog.getByTestId('group-image-edit-button')
  ).not.toBeVisible({
    timeout: 1,
  })

  await page.getByRole('textbox', { name: 'Subject' }).fill(emailSubject)

  await page.getByRole('button', { name: 'Add Recipients' }).click()
  const addMembersDialog = page.getByTestId('add-member-dialog')
  // TODO check that non-address-contacts are not visible,
  // and only address-contacts are.
  for (const addr of ['example@example.com', 'example2@example.com']) {
    await addMembersDialog.getByTestId('add-member-search').fill(addr)
    const item = addMembersDialog.locator('li', { hasText: addr })
    await expect(item).toHaveCount(1)
    await item.getByRole('checkbox').click()
  }

  await page.getByTestId('ok').click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(page.locator('.navbar-heading')).toContainText(emailSubject)
})

test('group dialog', async ({ page }) => {
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: emailSubject })
    .click()
  await page.getByTestId('chat-info-button').click()

  const dialog = page.getByTestId('view-group-dialog')
  await expect(dialog).toContainText(emailSubject)
  await expect(dialog).toContainText('3 members')
  // Unavailable for unencrypted groups.
  await expect(
    dialog.getByRole('button', { name: 'Add Members' })
  ).not.toBeVisible({ timeout: 1 })
  await expect(dialog.locator('#addmember')).not.toBeVisible({ timeout: 1 })
  await expect(
    dialog.getByTestId('view-group-dialog-header-edit')
  ).not.toBeVisible({ timeout: 1 })
  await expect(
    dialog.getByRole('button', { name: 'QR Invite Code' })
  ).not.toBeVisible({ timeout: 1 })
  await expect(dialog.locator('#showqrcode')).not.toBeVisible({ timeout: 1 })

  await page.getByTestId('view-group-dialog-header-close').click()
})

test('chat list item context menu', async ({ page }) => {
  const chatListItem = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: emailSubject })
  await chatListItem.click({
    button: 'right',
  })
  // "Leave Group" does not apply to unencrypted groups.
  await expect(
    page.getByRole('menuitem', { name: 'Delete Chat' })
  ).toBeVisible()
  await expect(
    page.getByRole('menuitem', { name: 'Leave Group' })
  ).not.toBeVisible()
  await expect(page.getByRole('menuitem')).toHaveCount(7)

  await page.getByRole('menuitem').first().press('Escape')
  await expect(page.getByRole('menuitem')).not.toBeVisible()
})

test('send message to unencrypted group', async ({ page }) => {
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: emailSubject })
    .click()

  const messageText = 'test unencrypted email messageee'
  await page.locator('#composer-textarea').fill(messageText)
  await page.locator('#composer-textarea').press('ControlOrMeta+Enter')
  const message = page.locator(`.message.outgoing`).last()
  await expect(message).toContainText(messageText)
  await expect(message.locator('.email-icon')).toBeVisible()
  // Again, on Chatmail sending an unencrypted message should not be possible.
  // This is basically our (unreliable) way of checking
  // that the created group really is unencrypted.
  //
  // When this is no longer the case, we might want to reuse the code
  // from regular group tests.
  await expect(
    message.getByRole('button', { name: 'Delivery status: Error' })
  ).toBeVisible()
})
