import { expect, type Page } from '@playwright/test'

import {
  reloadPage,
  test,
  importDummyProfileFromBackup,
  deleteSelectedProfile,
} from '../playwright-helper.js'

test.describe.configure({
  mode: 'serial',
})

expect.configure({ timeout: 5_000 })

// Why so many? Mainly for the "switch account" shortcuts.
const numberOfProfiles = 4

// https://playwright.dev/docs/next/test-retries#reuse-single-page-between-tests
let page: Page

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
  await reloadPage(page)

  let i = 0
  await importDummyProfileFromBackup(page)
  i++
  for (; i < numberOfProfiles; i++) {
    await page.getByRole('button', { name: 'Add Profile' }).click()
    await importDummyProfileFromBackup(page)
  }

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
  for (let i = 0; i < numberOfProfiles; i++) {
    await pageForProfileDeletion
      .getByLabel('Switch Profile')
      .getByRole('tab')
      .last()
      .click()
    await deleteSelectedProfile(pageForProfileDeletion)
  }
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

test('Ctrl + Alt + PageUp/PageDown to switch accounts', async () => {
  const accs = page.getByLabel('Switch Profile').getByRole('tab')
  async function expectSelected(ind: number) {
    await expect(accs.nth(ind)).toHaveAttribute('aria-selected', 'true')
  }

  await accs.first().click()
  await expectSelected(0)

  await page.keyboard.press('ControlOrMeta+Alt+PageDown')
  await expectSelected(1)
  await page.keyboard.press('ControlOrMeta+Alt+PageDown')
  await expectSelected(2)
  await page.keyboard.press('ControlOrMeta+Alt+PageDown')
  await expectSelected(3)
  await page.keyboard.press('ControlOrMeta+Alt+PageDown')
  await expectSelected(3)

  await page.keyboard.press('ControlOrMeta+Alt+PageUp')
  await expectSelected(2)
  await page.keyboard.press('ControlOrMeta+Alt+PageUp')
  await expectSelected(1)
  await page.keyboard.press('ControlOrMeta+Alt+PageUp')
  await expectSelected(0)
  await page.keyboard.press('ControlOrMeta+Alt+PageUp')
  await expectSelected(0)

  await page.keyboard.press('ControlOrMeta+Alt+PageDown')
  await expectSelected(1)
  // Having a dialog disables the shortcut.
  await page.keyboard.press('ControlOrMeta+N')
  await expect(page.getByRole('dialog')).toHaveCount(1)
  await page.keyboard.press('ControlOrMeta+Alt+PageDown')
  await expectSelected(1)
  await page.keyboard.press('ControlOrMeta+Alt+PageUp')
  await expectSelected(1)

  // Dialog closed, shortcut works again.
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.keyboard.press('ControlOrMeta+Alt+PageUp')
  await expectSelected(0)
})
