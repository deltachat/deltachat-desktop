/**
 * Backup export writes into a directory picked in a native dialog,
 * which only exists in the Electron target (the browser target downloads
 * every backup separately instead).
 *
 * Works offline: the profiles are restored from a backup.
 */
import { test, expect, type Page } from '@playwright/test'
import { mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { DeltaChatElectron, attachLogsOnFailure } from '../electron-helper.js'

const fixturesPath = join(import.meta.dirname, '..', 'fixtures')

test.describe.configure({ mode: 'serial' })

let dc: DeltaChatElectron
let page: Page
let backupDir: string

async function restoreProfileFromBackup() {
  await dc.mockOpenDialog([join(fixturesPath, 'dummy-account-backup.tar')])
  await page.getByRole('button', { name: 'I Already Have a Profile' }).click()
  await page.getByRole('button', { name: 'Restore from Backup' }).click()
  await expect(page.getByRole('button', { name: 'New Chat' })).toBeVisible()
}

test.beforeAll(async () => {
  // devmode for `exp.rpc`
  dc = await DeltaChatElectron.launch({
    name: 'backup',
    extraArgs: ['--devmode'],
  })
  page = dc.mainWindow
  backupDir = mkdtempSync(join(tmpdir(), 'dc-e2e-backups-'))

  await restoreProfileFromBackup()
  await page.getByRole('button', { name: 'Add Profile' }).click()
  await restoreProfileFromBackup()

  // Unconfigured profiles are not exported. Created via RPC, because
  // leaving the onboarding of a new profile in the UI deletes it again.
  await dc.evalInMainWorld('exp.rpc.addAccount()')
  expect(
    await dc.evalInMainWorld<string[]>(
      'exp.rpc.getAllAccounts().then(accounts => accounts.map(a => a.kind))'
    )
  ).toEqual(['Configured', 'Configured', 'Unconfigured'])
})

test.afterEach(() => attachLogsOnFailure(dc))

test.afterAll(async () => {
  await attachLogsOnFailure(dc)
  await dc?.close()
  rmSync(backupDir, { recursive: true, force: true })
})

test('export all profiles into the chosen directory', async () => {
  await dc.mockOpenDialog([backupDir])

  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByRole('button', { name: 'Chats' }).click()
  await page.getByRole('button', { name: 'Export Backup' }).click()
  await page.getByRole('button', { name: 'Export all 2 profiles' }).click()

  await expect(
    page.getByRole('dialog').filter({ hasText: 'Backup written successfully' })
  ).toContainText(backupDir)
  expect(
    readdirSync(backupDir).filter(file =>
      /^delta-chat-backup-.*\.tar$/.test(file)
    )
  ).toHaveLength(2)
})
