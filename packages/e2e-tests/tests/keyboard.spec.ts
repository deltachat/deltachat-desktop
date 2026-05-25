import { expect, type Page } from '@playwright/test'

import {
  createProfiles,
  User,
  loadExistingProfiles,
  deleteAllProfiles,
  reloadPage,
  test,
} from '../playwright-helper'

test.describe.configure({
  mode: 'serial',
})

expect.configure({ timeout: 5_000 })

let existingProfiles: User[] = []

const numberOfProfiles = 1

// https://playwright.dev/docs/next/test-retries#reuse-single-page-between-tests
let page: Page

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

  // Shortcuts don't seem to work otherwise. Maybe a Playwright issue.
  await page.locator('body').click()
})

test.afterEach(async () => {
  // Pressing Escape a bunch of times should reset the UI state,
  // so there is no need to reload the page.
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

test.describe('keyboard shortcuts', () => {
  test("don't work when a dialog is open", async () => {
    const dialogs = page.getByRole('dialog')

    // Ensure that normally it opens
    await expect(dialogs).toHaveCount(0)
    await page.keyboard.press('ControlOrMeta+N')
    await expect(dialogs).toHaveCount(1)
    await page.keyboard.press('ControlOrMeta+N')
    await expect(dialogs).toHaveCount(1)
    await page.keyboard.press('Escape')
    await expect(dialogs).toHaveCount(0)

    await page.getByRole('button', { name: 'Settings' }).click()
    await expect(dialogs).toHaveCount(1)
    await page.keyboard.press('ControlOrMeta+N')
    await expect(dialogs).toHaveCount(1)
  })
  test("don't work when a context menu is open", async () => {
    const dialogs = page.getByRole('dialog')

    await expect(page.getByRole('menu')).not.toBeVisible()
    await page
      .getByLabel('Chats')
      .getByRole('tab')
      .first()
      .click({ button: 'right' })
    await expect(page.getByRole('menu')).toBeVisible()

    await expect(dialogs).toHaveCount(0)
    await page.keyboard.press('ControlOrMeta+N')
    await expect(dialogs).toHaveCount(0)
    await page.keyboard.press('ControlOrMeta+N')

    await page.keyboard.press('Escape')
    await expect(page.getByRole('menu')).not.toBeVisible()
    await page.keyboard.press('ControlOrMeta+N')
    await expect(dialogs).toHaveCount(1)

    await page.keyboard.press('Escape')
  })
})
