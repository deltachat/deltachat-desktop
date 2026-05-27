import { expect, type BrowserContext, type Page } from '@playwright/test'

import {
  deleteSelectedProfile,
  importDummyProfileFromBackup,
  openInstancePage,
  reloadPage,
  test,
} from '../playwright-helper'

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

test('add a second device', async ({ browserName }) => {
  await pageB.getByRole('button', { name: 'I Already Have a Profile' }).click()
  await pageB.getByRole('button', { name: 'Add as Second Device' }).click()

  await pageA.getByRole('button', { name: 'Settings' }).click()
  await pageA.getByRole('button', { name: 'Add Second Device' }).click()
  await pageA
    .getByRole('dialog')
    .getByRole('button', { name: 'Continue' })
    .click()
  await expect(pageA.getByRole('dialog').getByRole('img')).toBeVisible()
  await pageA.getByRole('dialog').getByRole('button', { name: 'More' }).click()
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await pageA.context().grantPermissions(['clipboard-write'])
  }
  await pageA.getByRole('menuitem', { name: 'Copy' }).click()
  await pageA.getByRole('dialog').getByRole('button', { name: 'Ok' }).click()

  await pageB
    .getByRole('dialog')
    .getByRole('button', { name: 'Settings' })
    .click()
  if (browserName.toLowerCase().indexOf('chrom') > -1) {
    await pageB.context().grantPermissions(['clipboard-read'])
  }
  await pageB.getByRole('menuitem', { name: 'Paste from Clipboard' }).click()

  await expect(pageB.getByRole('dialog')).toHaveCount(0)
  await expect(
    pageB.getByLabel('Chats').getByRole('tab', { name: 'Saved Messages' })
  ).toBeVisible()
  await expect(
    pageA.getByLabel('Chats').getByRole('tab', { name: 'Device Messages' })
  ).toContainText('Profile transferred to your second device')
})
