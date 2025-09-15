import { expect, type Page } from '@playwright/test'

import {
  createProfiles,
  User,
  loadExistingProfiles,
  deleteAllProfiles,
  switchToProfile,
  reloadPage,
  test,
} from '../playwright-helper'

test.describe.configure({ mode: 'serial' })

let existingProfiles: User[] = []

const numberOfProfiles = 2

// https://playwright.dev/docs/next/test-retries#reuse-single-page-between-tests
let page: Page

test.beforeAll(async ({ browser, isChatmail }) => {
  if (isChatmail) {
    test.skip(true, 'This test is only relevant for non chatmail profiles')
  }

  const contextForProfileCreation = await browser.newContext()
  const pageForProfileCreation = await contextForProfileCreation.newPage()
  const pageForTestsP = browser.newPage()

  await reloadPage(pageForProfileCreation)

  existingProfiles =
    (await loadExistingProfiles(pageForProfileCreation)) ?? existingProfiles

  await createProfiles(
    numberOfProfiles,
    existingProfiles,
    pageForProfileCreation,
    browser.browserType().name(),
    isChatmail // is false here, otherwise the test would be skipped
  )

  await contextForProfileCreation.close()
  page = await pageForTestsP
  await reloadPage(page)
})

test.afterAll(async ({ browser }) => {
  await page?.close()

  const context = await browser.newContext()
  const pageForProfileDeletion = await context.newPage()
  await reloadPage(pageForProfileDeletion)
  await deleteAllProfiles(pageForProfileDeletion, existingProfiles)
  await context.close()
})

test('check "New E-Mail" option is shown and a chat can be created', async () => {
  const userA = existingProfiles[0]
  const userB = existingProfiles[1]
  const subject = 'Test Chat Subject'
  const emailUserB = userB.address
  // prepare last open chat for receiving user
  await switchToProfile(page, userA.id)
  await page.locator('#new-chat-button').click()

  // Since we're on a non-chatmail server, this button is supposed to be shown.
  const newEmailButton = page.getByRole('button', { name: 'New E-Mail' })
  await expect(newEmailButton).toBeVisible()

  await newEmailButton.click()

  await page.getByTestId('group-name-input').fill(subject)
  await page.locator('#addmember').click()

  await page.getByTestId('add-member-search').fill(emailUserB)

  const contact = page
    .locator('.styles_module_addMemberContactList li button')
    .filter({ hasText: emailUserB })
    .first()
  await contact.click()

  await page.getByTestId('ok').click()

  await page.getByTestId('group-create-button').click()

  const chatListItem = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: subject })
  await expect(chatListItem).toBeVisible()
})

test('group can be created but no non key contacts can be added', async () => {
  const userA = existingProfiles[0]
  const userB = existingProfiles[1]
  const subject = 'Test Chat Subject'
  const emailUserB = userB.address
  // prepare last open chat for receiving user
  await switchToProfile(page, userA.id)
  await page.locator('#new-chat-button').click()

  const createGroupButton = page.getByRole('button', { name: 'New Group' })

  await expect(createGroupButton).toBeVisible()

  await createGroupButton.click()

  await page.getByTestId('group-name-input').fill(subject)
  await page.locator('#addmember').click()

  await page.getByTestId('add-member-search').fill(emailUserB)

  const contactList = page.getByTestId('add-member-dialog').locator('li button')

  await expect(contactList).toHaveCount(0)

  await expect(page.getByTestId('ok')).toHaveAttribute('disabled')

  await page.getByTestId('cancel').click()

  await page.getByTestId('group-create-button').click()

  const chatListItem = page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: subject })
  await expect(chatListItem).toBeVisible()
})
