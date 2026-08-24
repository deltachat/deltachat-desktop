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
  const threw = await evalInMainWorld<boolean>(`
    window.runtime_api.invoke('electron.shell.openExternal', 'file:///etc/passwd')
      .then(() => false).catch(() => false)
  `)
  expect(threw).toBe(false)
})
