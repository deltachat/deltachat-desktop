/**
 * Security regression test: the main window must run with context isolation,
 * so that page-world code (which is where an XSS payload would run) cannot
 * reach Electron/Node internals or the raw ipcRenderer.
 *
 * This guards against accidentally reverting `contextIsolation: true` in
 * packages/target-electron/src/windows/main.ts
 *
 * Prerequisite: the electron app must be built (`pnpm -w build:electron`).
 * Run with: `pnpm e2e:electron` from packages/e2e-tests.
 */
import { test, expect } from '@playwright/test'

import { DeltaChatElectron } from '../electron-helper.js'

let dc: DeltaChatElectron

test.beforeAll(async () => {
  dc = await DeltaChatElectron.launch({ name: 'ctxiso' })
})

test.afterAll(async () => {
  await dc?.close()
})

const evalInMainWorld = <T>(expression: string) =>
  dc.evalInMainWorld<T>(expression)

test('main world cannot see Electron/Node internals', async () => {
  const seen = await evalInMainWorld<Record<string, string>>(`
    JSON.stringify({
      require: typeof require,
      module: typeof module,
      ipcRenderer: typeof ipcRenderer,
    })
  `).then(s => JSON.parse(s as unknown as string))

  expect(seen.require).toBe('undefined')
  expect(seen.module).toBe('undefined')
  expect(seen.ipcRenderer).toBe('undefined')
})

test('runtime_api only exposes allowlisted IPC channels', async () => {
  const probe = await evalInMainWorld<string>(`
    (() => {
      const api = window.runtime_api
      if (!api || typeof api.invoke !== 'function') {
        return JSON.stringify({ bridgePresent: false })
      }
      let threw = false
      try {
        api.invoke('definitely-not-an-allowlisted-channel')
      } catch (_) {
        threw = true
      }
      return JSON.stringify({ bridgePresent: true, nonAllowlistedThrew: threw })
    })()
  `).then(s => JSON.parse(s as unknown as string))

  // The contextBridge surface must exist
  expect(probe.bridgePresent).toBe(true)
  // ...and it must reject channels outside the allowlist.
  expect(probe.nonAllowlistedThrew).toBe(true)
})

test('shell.openExternal refuses file:// (and other non-web protocols)', async () => {
  // Record the URLs instead of opening them. The IPC handler doesn't throw
  // for refused URLs, so the only observable effect is whether it calls
  // `shell.openExternal`.
  await dc.app.evaluate(({ shell }) => {
    const opened: string[] = []
    ;(globalThis as any).openedExternalUrls = opened
    shell.openExternal = async url => {
      opened.push(url)
    }
  })
  const openExternal = (url: string) =>
    evalInMainWorld(
      `window.runtime_api.invoke('electron.shell.openExternal', ${JSON.stringify(url)})`
    )

  await openExternal('file:///etc/passwd')
  await openExternal('smb://example.com/share')
  // proves that the stand-in is actually used
  await openExternal('https://delta.chat/')

  expect(
    await dc.app.evaluate(() => (globalThis as any).openedExternalUrls)
  ).toEqual(['https://delta.chat/'])
})
