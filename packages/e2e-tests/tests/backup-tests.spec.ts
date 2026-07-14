import { expect, type Page, type BrowserContext } from '@playwright/test'
import path from 'path'

import {
  clickThroughTestIds,
  createDummyChat,
  deleteAllProfiles,
  deleteSelectedProfile,
  getUser,
  importDummyProfileFromBackup,
  loadExistingProfiles,
  openInstancePage,
  reloadPage,
  switchToProfile,
  test,
  User,
} from '../playwright-helper.js'

test.describe.configure({
  mode: 'serial',
})

let existingProfiles: User[] = []
let page: Page

const fixturesPath = path.join(import.meta.dirname, '..', 'fixtures')

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
  await reloadPage(page)

  existingProfiles = (await loadExistingProfiles(page)) ?? existingProfiles
})

test.afterEach(async () => {
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Escape')
  }
  existingProfiles = await loadExistingProfiles(page)
})

test.afterAll(async ({ browser }) => {
  await page?.close()

  const context = await browser.newContext()
  const pageForProfileDeletion = await context.newPage()
  await reloadPage(pageForProfileDeletion)
  await deleteAllProfiles(pageForProfileDeletion, existingProfiles)
  await context.close()
})

test('import backup from file', async () => {
  const profileButtons = page
    .getByRole('navigation', { name: /Profiles?/ })
    .getByRole('tab')

  await page.getByRole('button', { name: 'I Already Have a Profile' }).click()
  await expect(profileButtons.last()).toContainText('?')

  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Restore from Backup' }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(
    path.join(fixturesPath, 'dummy-account-backup.tar')
  )

  await expect(profileButtons.last()).toContainText('Alice'[0])
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'New Chat' })).toBeVisible()
})

test.describe('export then import backup', () => {
  // let contextA: BrowserContext
  let contextB: BrowserContext
  let pageA: Page
  let pageB: Page
  let backupPath: Promise<string>

  test.beforeAll(async ({ browser }) => {
    pageA = page
    ;({ context: contextB, page: pageB } = await openInstancePage(browser, 1))

    await pageA.getByRole('button', { name: 'Add Profile' }).click()
    await importDummyProfileFromBackup(pageA)
    await createDummyChat(pageA, "I'm a chat, backup me!")
  })
  test.afterAll(async () => {
    await Promise.all(
      [pageA, pageB].map(async page => {
        await reloadPage(page)
        await deleteSelectedProfile(page)
      })
    )
    // await contextA.close()
    await contextB.close()
  })

  test('export', async () => {
    await pageA.getByRole('button', { name: 'Settings' }).click()
    await pageA.getByRole('button', { name: 'Chats' }).click()
    await pageA.getByRole('button', { name: 'Export Backup' }).click()

    await expect(pageA.getByRole('dialog').last()).toContainText(
      'Keep the backup file in a safe place or delete it as soon as possible'
    )
    await expect(
      pageA.getByRole('dialog').last().getByRole('button')
    ).toHaveText(['Cancel', 'Start Backup'])

    // In Electron we would show a directory picker dialog,
    // but in the browser version it's a download.
    const downloadPromise = pageA.waitForEvent('download')
    await pageA.getByRole('button', { name: 'Start Backup' }).click()
    // This dialog is also not present on Electron.
    await pageA
      .getByRole('dialog')
      .filter({ hasText: 'Backup written successfully' })
      .getByRole('button', { name: 'Open' })
      .click()
    const download = await downloadPromise
    backupPath = download.path()

    await expect(
      pageA.getByRole('button', { name: 'Start Backup' })
    ).not.toBeVisible()
  })

  test('import', async () => {
    await pageB
      .getByRole('button', { name: 'I Already Have a Profile' })
      .click()

    const fileChooserPromise = pageB.waitForEvent('filechooser')
    await pageB.getByRole('button', { name: 'Restore from Backup' }).click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(await backupPath)

    await expect(
      pageB
        .getByLabel('Chats')
        .getByRole('tab', { name: "I'm a chat, backup me!" })
    ).toBeVisible()
    await expect(pageB.getByRole('dialog')).toHaveCount(0)
  })
})

test('shows warning when scanning backups that are newer than supported', async ({
  browserName,
}) => {
  if (browserName.toLowerCase().includes('chrom')) {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  }

  const user = getUser(0, existingProfiles)
  await switchToProfile(page, user.id)

  await page.getByTestId('open-settings-button').click()

  const settingsDialog = page.getByTestId('settings-dialog')
  await expect(settingsDialog).toBeVisible()

  await settingsDialog
    .getByRole('button', { name: 'Add Second Device' })
    .click()

  const sendBackupDialog = page
    .locator('dialog')
    .filter({ hasText: 'Add Second Device' })
  await expect(sendBackupDialog).toBeVisible()

  await sendBackupDialog.getByRole('button', { name: 'Continue' }).click()

  // The "Copy" button will not appear in the context menu
  // if we don't wait for the QR to appear.
  await expect(sendBackupDialog.locator('img')).toBeVisible()

  await sendBackupDialog.getByTestId('dialog-header-context-menu').click()
  await page.getByRole('menuitem', { name: 'Copy' }).click()
  await page.getByTestId('alert-ok').click()

  const clipboardContent = await page.evaluate(async () => {
    return navigator.clipboard.readText()
  })
  expect(clipboardContent).toMatch(/^DCBACKUP\d+:/)

  const mutatedContent = clipboardContent.replace(
    /^DCBACKUP(\d+):/,
    (_match, version) => `DCBACKUP${Number(version) + 1}:`
  )

  await page.evaluate(async text => {
    await navigator.clipboard.writeText(text)
  }, mutatedContent)

  await sendBackupDialog.getByRole('button', { name: 'Close' }).click()
  // Confirm cancellation
  await page.getByTestId('confirm-dialog').getByTestId('confirm').click()

  await clickThroughTestIds(page, [
    'add-account-button',
    'have-account-button',
    'second-device-button',
    'qr-reader-settings',
    'paste-from-clipboard',
  ])

  const tooNewDialog = page.getByTestId('backup-too-new')
  await expect(tooNewDialog).toBeVisible()
  await page.getByTestId('alert-ok').click()

  const onboardingDialog = page.getByTestId('onboarding-dialog')
  await onboardingDialog.getByTestId('dialog-header-close').click()
  await expect(onboardingDialog).not.toBeVisible()
})
