import { expect, type Page } from '@playwright/test'

import {
  createProfiles,
  User,
  loadExistingProfiles,
  deleteAllProfiles,
  reloadPage,
  test,
  createDummyChat,
  selectChat,
} from '../playwright-helper'

test.describe.configure({
  mode: 'serial',
})

// As of writing we use the same code for managing multiselect
// in both the message list and the chat list.
// These tests have mostly been copy-pasted from `chat-list-multiselet.spec.ts`.

expect.configure({ timeout: 5_000 })
test.setTimeout(30_000)

let existingProfiles: User[] = []

const numberOfProfiles = 1

// https://playwright.dev/docs/next/test-retries#reuse-single-page-between-tests
let page: Page
const textarea = () => page.locator('textarea.create-or-edit-message-input')
function getMessageText(i: number) {
  return `Some message ${i}`
}
const makeMessageRegex = (messageNum: number) =>
  new RegExp(`Some message ${messageNum}(?!\\d)`)
const getMessage = (messageNum: number) =>
  page
    .getByRole('list', { name: 'Messages' })
    .getByRole('listitem')
    .getByText(new RegExp(`Some message ${messageNum}(?!\\d)`))
const expectSelectedMessages = async (messageNums: number[]) => {
  await expect(
    page
      .getByRole('list', { name: 'Messages' })
      .getByRole('listitem')
      .locator('[aria-selected="true"]')
  ).toHaveText(messageNums.map(n => makeMessageRegex(n)))
}
const expectMessages = async (messageNums: number[]) => {
  await expect(
    page
      .getByRole('list', { name: 'Messages' })
      .getByRole('listitem')
      .filter({ hasText: 'Some message' })
  ).toHaveText(messageNums.map(n => makeMessageRegex(n)))
}

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

  await contextForProfileCreation.close()
  page = await browser.newPage()
  await reloadPage(page)

  await createDummyChat(page, 'Some chat')
  await selectChat(page, 'Some chat')

  for (let i = 1; i <= 9; i++) {
    await textarea().fill(getMessageText(i))
    await textarea().press('ControlOrMeta+Enter')
    await expect(textarea()).toBeEmpty()
  }
  await expectMessages([1, 2, 3, 4, 5, 6, 7, 8, 9])
})

test.afterAll(async ({ browser }) => {
  await page?.close()

  const context = await browser.newContext()
  const pageForProfileDeletion = await context.newPage()
  await reloadPage(pageForProfileDeletion)
  await deleteAllProfiles(pageForProfileDeletion, existingProfiles)
  await context.close()
})

test.describe('Ctrl + Click', () => {
  test('add messages to selection', async () => {
    await getMessage(8).click()
    await expectSelectedMessages([])
    await getMessage(5).click({
      modifiers: ['ControlOrMeta'],
    })
    await expectSelectedMessages([5])
    await getMessage(3).click({
      modifiers: ['ControlOrMeta'],
    })
    await getMessage(1).click({
      modifiers: ['ControlOrMeta'],
    })
    await expectSelectedMessages([1, 3, 5])
  })

  test('remove messages from selection', async () => {
    await getMessage(5).click({
      modifiers: ['ControlOrMeta'],
    })
    await expectSelectedMessages([1, 3])
    await getMessage(3).click({
      modifiers: ['ControlOrMeta'],
    })
    await expectSelectedMessages([1])
    await getMessage(1).click({
      modifiers: ['ControlOrMeta'],
    })
    await expectSelectedMessages([])
  })

  test('Ctrl + Space', async () => {
    await expectSelectedMessages([])

    await getMessage(4).click()
    await page.keyboard.press('ControlOrMeta+Space')
    await expectSelectedMessages([4])

    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ControlOrMeta+Space')
    await expectSelectedMessages([4, 5])
    await page.keyboard.press('ControlOrMeta+Space')
    await expectSelectedMessages([4])
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ControlOrMeta+Space')
    await expectSelectedMessages([4, 6])
  })
})

test('Click on dead space', async () => {
  await getMessage(5).click()
  await expectSelectedMessages([])

  await getMessage(5).click({
    modifiers: ['ControlOrMeta'],
  })
  await expectSelectedMessages([5])

  // Space between message bubbles.
  const deadSpace = page
    .getByRole('list', { name: 'Messages' })
    .filter({ has: page.getByText(makeMessageRegex(5)) })
  await deadSpace.click({ modifiers: ['ControlOrMeta'] })
  await expectSelectedMessages([5])
  await deadSpace.click({ modifiers: ['Shift'] })
  await expectSelectedMessages([5])
  await deadSpace.click({ modifiers: [] })
  await expectSelectedMessages([])
})

test('delete several', async () => {
  await getMessage(7).click()
  await getMessage(5).click({
    modifiers: ['Shift'],
  })
  await getMessage(2).click({
    modifiers: ['ControlOrMeta'],
  })
  await expectSelectedMessages([2, 5, 6, 7])

  await getMessage(6).click({
    button: 'right',
  })
  await page.getByRole('menuitem', { name: 'Delete' }).click()

  await expect(page.getByRole('dialog')).toContainText('Delete 4 messages?')
  await expect(page.getByRole('dialog').getByRole('button')).toHaveText([
    'Cancel',
    'Delete for Me',
    'Delete for Everyone',
  ])
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Delete for Everyone' })
    .click()
  await expectMessages([1, 3, 4, 8, 9])
  await expectSelectedMessages([])
})
