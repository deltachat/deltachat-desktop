import { expect, type Page } from '@playwright/test'

import {
  reloadPage,
  test,
  importDummyProfileFromBackup,
  deleteSelectedProfile,
} from '../playwright-helper'

test.describe.configure({
  mode: 'serial',
})

expect.configure({ timeout: 5_000 })

// https://playwright.dev/docs/next/test-retries#reuse-single-page-between-tests
let page: Page

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
  await reloadPage(page)
  await importDummyProfileFromBackup(page)

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
  await deleteSelectedProfile(pageForProfileDeletion)
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
