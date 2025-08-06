import { test, expect, type Page } from '@playwright/test'

import {
  createProfiles,
  User,
  loadExistingProfiles,
  deleteAllProfiles,
  switchToProfile,
  reloadPage,
} from '../playwright-helper'

test.describe.configure({ mode: 'serial' })

let existingProfiles: User[] = []

const numberOfProfiles = 4

// https://playwright.dev/docs/next/test-retries#reuse-single-page-between-tests
let page: Page

test.beforeAll(async ({ browser }) => {
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
    contextForProfileCreation,
    browser.browserType().name(),
    false // useChatmail = false
  )

  await contextForProfileCreation.close()
  page = await pageForTestsP
  await reloadPage(page)
})

test.afterAll(async ({ browser }) => {
  await page.close()

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

  await expect(page.getByRole('button', { name: 'New Group' })).toBeVisible()

  // Since we're on a Chatmail server, this button is supposed to be shown.
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
