/**
 * Webxdc apps open in their own Electron window, so this can only be
 * tested against the Electron target.
 *
 * Works offline: the profile is restored from a backup and the app is
 * sent to a group without other members.
 */
import { test, expect, type Page } from '@playwright/test'
import { join } from 'node:path'

import { DeltaChatElectron, attachLogsOnFailure } from '../electron-helper.js'
import { createDummyChat } from '../playwright-helper.js'

const fixturesPath = join(import.meta.dirname, '..', 'fixtures')

test.describe.configure({ mode: 'serial' })

let dc: DeltaChatElectron
let page: Page
let xdcWindow: Page

test.beforeAll(async () => {
  dc = await DeltaChatElectron.launch({ name: 'webxdc' })
  page = dc.mainWindow

  await dc.mockOpenDialog([join(fixturesPath, 'dummy-account-backup.tar')])
  await page.getByRole('button', { name: 'I Already Have a Profile' }).click()
  await page.getByRole('button', { name: 'Restore from Backup' }).click()
  await expect(page.getByRole('button', { name: 'New Chat' })).toBeVisible()
})

test.afterEach(() => attachLogsOnFailure(dc))

test.afterAll(async () => {
  await attachLogsOnFailure(dc)
  await dc?.close()
})

function webxdcMessages() {
  return page
    .getByRole('list', { name: 'Messages' })
    .getByRole('listitem')
    .filter({ hasText: 'E2E Test App' })
}

function webxdcWindows() {
  return dc.app.windows().filter(w => w.url().startsWith('webxdc:'))
}

async function sendTestApp() {
  await dc.mockOpenDialog([join(fixturesPath, 'webxdc-test-app.xdc')])
  await page.getByRole('button', { name: 'Add Attachment' }).click()
  await page.getByRole('menuitem', { name: 'File' }).click()
  await page.getByRole('button', { name: 'Send' }).click()
}

test('send and start a webxdc app', async () => {
  await createDummyChat(page, 'Webxdc group')
  await sendTestApp()

  xdcWindow = await dc.openWebxdc(webxdcMessages().first())
  await expect(xdcWindow).toHaveTitle(/E2E Test App/)
  await expect(xdcWindow.locator('#self-name')).toHaveText('Alice')
})

test('status updates round-trip through core and reach the chat', async () => {
  await xdcWindow.getByRole('button', { name: 'Send update' }).click()
  await expect(
    xdcWindow.getByRole('list', { name: 'Received updates' })
  ).toContainText('update 1 from Alice')

  // the summary is rendered in the main window's message bubble
  await expect(webxdcMessages().first()).toContainText('1 updates sent')
})

test('apps without internet access cannot reach the network', async () => {
  const result = await xdcWindow.evaluate(() =>
    fetch('https://delta.chat/').then(
      () => 'reachable',
      () => 'blocked'
    )
  )
  expect(result).toBe('blocked')
})

test('starting an already open app reuses its window', async () => {
  const again = await dc.openWebxdc(webxdcMessages().first())
  expect(again).toBe(xdcWindow)
  await expect.poll(() => webxdcWindows()).toHaveLength(1)
})

test('several apps open at the same time get separate windows', async () => {
  await sendTestApp()
  await expect(webxdcMessages()).toHaveCount(2)

  const secondWindow = await dc.openWebxdc(webxdcMessages().last())
  expect(secondWindow).not.toBe(xdcWindow)
  await expect.poll(() => webxdcWindows()).toHaveLength(2)

  // without a message id the window is ambiguous
  await expect(dc.webxdcWindow()).rejects.toThrow(/2 windows match/)

  // each app instance has its own state
  await secondWindow.getByRole('button', { name: 'Send update' }).click()
  await expect(
    secondWindow.getByRole('list', { name: 'Received updates' })
  ).toHaveText('update 1 from Alice')
  await expect(webxdcMessages().last()).toContainText('1 updates sent')
  await expect(
    xdcWindow
      .getByRole('list', { name: 'Received updates' })
      .getByRole('listitem')
  ).toHaveCount(1)
})
