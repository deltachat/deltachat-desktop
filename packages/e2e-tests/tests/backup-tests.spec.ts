import { expect, type Page } from '@playwright/test'

import {
  clickThroughTestIds,
  createProfiles,
  deleteAllProfiles,
  getUser,
  loadExistingProfiles,
  reloadPage,
  switchToProfile,
  test,
  User,
} from '../playwright-helper'

test.describe.configure({ mode: 'serial' })

let existingProfiles: User[] = []
const numberOfProfiles = 1
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

  await sendBackupDialog.getByRole('button', { name: 'Copy' }).click()
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

  await sendBackupDialog.getByRole('button', { name: 'Cancel' }).click()
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
