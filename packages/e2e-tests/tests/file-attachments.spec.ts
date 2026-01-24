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
} from '../playwright-helper'

/**
 * E2E tests for file attachments:
 * - Send image attachment
 * - Send file attachment (zip)
 * - Send contact as vCard
 */

test.describe.configure({
  mode: 'serial',
  retries: process.env.CI ? 3 : 0,
})

expect.configure({ timeout: 5_000 })
test.setTimeout(60_000)

let existingProfiles: User[] = []

const numberOfProfiles = 2

let page: Page

const fixturesPath = path.join(import.meta.dirname, '..', 'fixtures')
const imagePath = path.join(fixturesPath, 'Deltachat-Logo.png')
const zipPath = path.join(fixturesPath, 'test.zip')

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

  const userA = getUser(0, existingProfiles)
  const userB = getUser(1, existingProfiles)

  await createChat(
    userA,
    userB,
    pageForProfileCreation,
    browser.browserType().name()
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

test('send image attachment', async () => {
  const userA = getUser(0, existingProfiles)
  const userB = getUser(1, existingProfiles)

  await switchToProfile(page, userA.id)

  // Open chat with userB
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userB.name })
    .click()

  const fileChooserPromise = page.waitForEvent('filechooser')
  // Open attachment menu and select image
  await page.getByTestId('open-attachment-menu').click()
  await page.getByRole('menuitem', { name: 'Image' }).click()

  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(imagePath)

  // Wait for the attachment to appear in the draft/composer
  const attachmentDraftPreview = page.locator(
    '.attachment-quote-section .message-attachment-media .attachment-content'
  )
  await expect(attachmentDraftPreview).toBeVisible()
  // Send the message
  await page.locator('button.send-button').click()

  // Verify the image message appears in the chat
  const imageMessage = page.locator('.message.outgoing').last()
  await expect(imageMessage).toBeVisible()
  await expect(
    imageMessage.locator('.msg-body img.attachment-content')
  ).toBeVisible()

  // Verify userB receives the message
  await switchToProfile(page, userB.id)
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userA.name })
    .click()

  const receivedImageMessage = page.locator('.message.incoming').last()
  await expect(receivedImageMessage).toBeVisible()
  await expect(
    receivedImageMessage.locator('.msg-body img.attachment-content')
  ).toBeVisible()
})

test('send file attachment', async () => {
  const userA = getUser(0, existingProfiles)
  const userB = getUser(1, existingProfiles)

  await switchToProfile(page, userA.id)

  // Open chat with userB
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userB.name })
    .click()

  const fileChooserPromise = page.waitForEvent('filechooser')

  // Open attachment menu and select file
  await page.getByTestId('open-attachment-menu').click()
  await page.getByRole('menuitem', { name: 'File' }).click()

  // Upload the zip file
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(zipPath)

  // Wait for the file to appear in the draft/composer
  const attachmentDraftPreview = page.locator(
    '.attachment-quote-section .message-attachment-generic'
  )
  await expect(attachmentDraftPreview).toBeVisible()
  await expect(attachmentDraftPreview).toContainText('test.zip')

  // Optionally add a message
  await page
    .locator('textarea.create-or-edit-message-input')
    .fill('Here is the test file')

  // Send the message
  await page.locator('button.send-button').click()

  // Verify the file message appears in the chat
  const fileMessage = page.locator('.message.outgoing').last()
  await expect(fileMessage).toBeVisible()
  await expect(fileMessage.locator('.msg-body')).toContainText('test.zip')

  // Verify userB receives the message
  await switchToProfile(page, userB.id)
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userA.name })
    .click()

  const receivedFileMessage = page.locator('.message.incoming').last()
  await expect(receivedFileMessage).toBeVisible()
  await expect(receivedFileMessage.locator('.msg-body')).toContainText(
    'test.zip'
  )
  await expect(receivedFileMessage.locator('.msg-body .text')).toContainText(
    'Here is the test file'
  )
})

test('send contact as vCard', async () => {
  const userA = getUser(0, existingProfiles)
  const userB = getUser(1, existingProfiles)

  await switchToProfile(page, userA.id)

  // Open chat with userB
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userB.name })
    .click()

  // Open attachment menu and select contact
  await page.getByTestId('open-attachment-menu').click()
  await page.getByRole('menuitem', { name: 'Contact' }).click()

  // Select "Me" contact from the dialog
  const contactDialog = page.getByRole('dialog')
  await expect(contactDialog).toBeVisible()
  await contactDialog.getByRole('button', { name: 'Me' }).click()

  // Wait for the contact to appear in the draft/composer
  const composerSection = page.getByRole('region', { name: 'Write a message' })
  const attachmentPreview = composerSection.getByRole('region', {
    name: 'Attachment',
  })
  await expect(attachmentPreview).toBeVisible()
  await expect(attachmentPreview).toContainText(userA.name)

  // Send the message
  await page.locator('button.send-button').click()

  // Verify the contact message appears in the chat
  const contactMessage = page.locator('.message.outgoing').last()
  await expect(contactMessage).toBeVisible()
  await expect(contactMessage.locator('.msg-body')).toContainText(userA.name)

  // Verify userB receives the vCard
  await switchToProfile(page, userB.id)
  await page
    .locator('.chat-list .chat-list-item')
    .filter({ hasText: userA.name })
    .click()

  const receivedContactMessage = page.locator('.message.incoming').last()
  await expect(receivedContactMessage).toBeVisible()
  await expect(receivedContactMessage.locator('.msg-body')).toContainText(
    userA.name
  )
  await receivedContactMessage.click()
  await expect(page.getByRole('dialog')).toContainText(
    `Chat with ${userA.name}?`
  )
})
