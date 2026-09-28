import { expect, type BrowserContext, type Page } from '@playwright/test'

import {
  deleteSelectedProfile,
  importDummyProfileFromBackup,
  openInstancePage,
  reloadPage,
  test,
} from '../playwright-helper.js'

test.describe.configure({
  mode: 'serial',
})

let contextA: BrowserContext
let contextB: BrowserContext
let pageA: Page
let pageB: Page

test.beforeAll(async ({ browser }) => {
  ;[{ context: contextA, page: pageA }, { context: contextB, page: pageB }] =
    await Promise.all([
      openInstancePage(browser, 0),
      openInstancePage(browser, 1),
    ])

  await importDummyProfileFromBackup(pageA)
})

test.afterAll(async () => {
  await Promise.all(
    [pageA, pageB].map(async page => {
      await reloadPage(page)
      await deleteSelectedProfile(page)
    })
  )
  await contextA.close()
  await contextB.close()
})

async function prepareAddSecondDevice(page: Page, browserName: string) {
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByRole('button', { name: 'Add Second Device' }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Continue' })
    .click()
  await expect(page.getByRole('dialog').getByRole('img')).toBeVisible()
  await page.getByRole('dialog').getByRole('button', { name: 'More' }).click()
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await page.context().grantPermissions(['clipboard-write'])
  }
  await page.getByRole('menuitem', { name: 'Copy' }).click()
  await expect(
    page.getByRole('status').getByText('Copied to clipboard')
  ).toBeVisible()
}

test('add a second device', async ({ browserName }) => {
  await pageB.getByRole('button', { name: 'I Already Have a Profile' }).click()
  await pageB.getByRole('button', { name: 'Add as Second Device' }).click()

  await prepareAddSecondDevice(pageA, browserName)

  await pageB
    .getByRole('dialog')
    .getByRole('button', { name: 'Settings' })
    .click()
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await pageB.context().grantPermissions(['clipboard-read'])
  }
  await pageB.getByRole('menuitem', { name: 'Paste from Clipboard' }).click()
  await pageB
    .getByRole('dialog')
    .filter({ hasText: 'Add as Second Device' })
    .filter({
      hasText: 'Copy the profile from the other device to this device?',
    })
    .filter({
      hasText: 'Make sure both devices are on the same Wi-Fi or network',
    })
    .getByRole('button', { name: 'Continue' })
    .click()

  await expect(pageB.getByRole('dialog')).toHaveCount(0)
  await expect(
    pageB.getByLabel('Chats').getByRole('tab', { name: 'Saved Messages' })
  ).toBeVisible()
  await expect(
    pageA.getByLabel('Chats').getByRole('tab', { name: 'Device Messages' })
  ).toContainText('Profile transferred to your second device')
})

test('add a second device from default QR scanner', async ({ browserName }) => {
  const pageBProfileButtons = pageB
    .getByRole('navigation', { name: /Profiles?/ })
    .getByRole('tab')
  // From previous test
  await expect(pageBProfileButtons).toHaveCount(1)

  await prepareAddSecondDevice(pageA, browserName)

  await pageB.getByRole('button', { name: 'Scan QR Code' }).click()
  await pageB
    .getByRole('dialog')
    .getByRole('button', { name: 'Scan QR Code' })
    .click()
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await pageB.context().grantPermissions(['clipboard-read'])
  }
  await pageB.getByRole('button', { name: 'Paste' }).click()
  await pageB
    .getByRole('dialog')
    .filter({ hasText: 'Add as Second Device' })
    .filter({
      hasText: 'Copy the profile from the other device to this device?',
    })
    .filter({
      hasText: 'Make sure both devices are on the same Wi-Fi or network',
    })
    .getByRole('button', { name: 'Continue' })
    .click()

  await expect(pageB.getByRole('dialog')).toHaveCount(0)
  await expect(pageBProfileButtons).toHaveCount(2)
  await expect(pageBProfileButtons.last()).toHaveAttribute(
    'aria-selected',
    'true'
  )
  await expect(
    pageB.getByLabel('Chats').getByRole('tab', { name: 'Saved Messages' })
  ).toBeVisible()

  // Clean up
  await deleteSelectedProfile(pageB)
})
