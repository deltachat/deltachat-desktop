/**
 * Helpers to drive the real Electron app (as opposed to the browser target
 * used by `tests/`). Use these for features that only exist in Electron:
 * webxdc windows, calls, native dialogs, IPC/security boundaries.
 *
 * Every BrowserWindow the app opens (main window, webxdc apps, call windows,
 * help, html email) is a Playwright `Page` in `app.windows()`.
 *
 * Prerequisite: `pnpm -w build:electron` (the tests launch the built app).
 */
import {
  _electron,
  expect,
  test,
  type ElectronApplication,
  type Locator,
  type Page,
  type TestInfo,
} from '@playwright/test'
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { crc32 } from 'node:zlib'

export const TARGET_ELECTRON = join(
  import.meta.dirname,
  '..',
  'target-electron'
)

export type LaunchOptions = {
  /** Used for the profile dir name and in attached logs. */
  name?: string
  extraArgs?: string[]
}

export class DeltaChatElectron {
  private constructor(
    public readonly name: string,
    public readonly app: ElectronApplication,
    public readonly mainWindow: Page,
    public readonly profileDir: string
  ) {}

  /**
   * Start the app with a fresh, isolated profile directory.
   * Several instances can run at the same time.
   */
  static async launch({
    name = 'dc',
    extraArgs = [],
  }: LaunchOptions = {}): Promise<DeltaChatElectron> {
    // DC_TEST_DIR makes the app use its own config dir instead of the
    // developer's real one, and disables the single-instance lock.
    const profileDir = mkdtempSync(join(tmpdir(), `dc-e2e-${name}-`))
    const env = { ...process.env } as Record<string, string>
    // Set by e.g. VS Code extension hosts. Electron would start as plain
    // Node.js and fail to import from 'electron/main'.
    delete env.ELECTRON_RUN_AS_NODE
    const app = await _electron.launch({
      cwd: TARGET_ELECTRON,
      args: [
        '.',
        // Required on Linux distributions that restrict unprivileged user
        // namespaces (e.g. Ubuntu 24.04+) unless the AppArmor profile from
        // bin/setup-apparmor-dev.sh is installed. Also needed in most CI
        // containers. Other platforms keep the sandbox so it is tested there.
        ...(process.platform === 'linux' ? ['--no-sandbox'] : []),
        '--disable-http-cache',
        '--lang=en-US',
        // Synthetic camera/microphone and auto-accepted permission prompts,
        // so calls work without real devices.
        '--use-fake-device-for-media-stream',
        '--use-fake-ui-for-media-stream',
        ...extraArgs,
      ],
      env: {
        ...env,
        DC_TEST_DIR: profileDir,
        LANG: 'en_US.UTF-8',
        LANGUAGE: 'en_US',
      },
    })
    const mainWindow = await app.firstWindow()
    await mainWindow.waitForLoadState('domcontentloaded')
    return new DeltaChatElectron(name, app, mainWindow, profileDir)
  }

  /**
   * Make all following native "open file" dialogs return `filePaths`
   * without showing a dialog, until the app is closed or this is called again.
   * (`runtime.showOpenFileDialog` asks the main process via IPC,
   * which calls the `dialog.showOpenDialog` mocked here.)
   */

  async mockOpenDialog(filePaths: string[]) {
    await this.app.evaluate(({ dialog }, filePaths) => {
      dialog.showOpenDialog = (async () => ({
        canceled: false,
        filePaths,
      })) as unknown as typeof dialog.showOpenDialog
    }, filePaths)
  }

  /**
   * `navigator.clipboard` in the renderer is not available to tests
   * (the main window blocks `page.evaluate`), so write via the main process.
   */
  async setClipboard(text: string) {
    await this.app.evaluate(({ clipboard }, text) => {
      clipboard.writeText(text)
    }, text)
  }

  async readClipboard(): Promise<string> {
    return this.app.evaluate(({ clipboard }) => clipboard.readText())
  }

  /**
   * Evaluate an expression in the main window's page world.
   * `page.evaluate` does not work there, because the app blocks
   * `window.eval` (avoid-eval.js), which Playwright relies on.
   * By opening a CDP (Chrome Developer Tools Protocol) session to
   * the main window, we can evaluate code in the
   * page world despite the `window.eval` restriction.
   */
  async evalInMainWorld<T = unknown>(expression: string): Promise<T> {
    const cdp = await this.mainWindow.context().newCDPSession(this.mainWindow)
    const { result, exceptionDetails } = await cdp.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
    if (exceptionDetails) {
      throw new Error(
        exceptionDetails.exception?.description ?? exceptionDetails.text
      )
    }
    return result.value as T
  }

  /**
   * Wait until a window whose URL matches `url` is open and return it.
   * Windows are often created before their URL is loaded, so this polls
   * instead of only listening to the `window` event.
   * Throws if more than one window matches.
   */
  async waitForWindow(
    url: RegExp,
    { timeout = 30_000 }: { timeout?: number } = {}
  ): Promise<Page> {
    const matching = () => this.app.windows().filter(p => url.test(p.url()))
    await expect
      .poll(() => matching().length, {
        timeout,
        message: `no window with url matching ${url}`,
      })
      .toBeGreaterThan(0)
    const found = matching()
    if (found.length > 1) {
      throw new Error(
        `${found.length} windows match ${url}, narrow it down:\n  ` +
          found.map(p => p.url()).join('\n  ')
      )
    }
    await found[0]!.waitForLoadState('domcontentloaded')
    return found[0]!
  }

  /**
   * The window of a webxdc app. Pass `msgId` (and `accountId` if several
   * profiles are used) when more than one app can be open,
   * or use {@link openWebxdc}.
   */
  webxdcWindow({
    msgId,
    accountId,
    timeout,
  }: { msgId?: number; accountId?: number; timeout?: number } = {}) {
    // see `appURL` in packages/target-electron/src/deltachat/webxdc.ts
    const account = accountId ?? '\\d+'
    const msg = msgId ?? '\\d+'
    return this.waitForWindow(
      new RegExp(`^webxdc://${account}\\.${msg}\\.webxdc(/|$)`),
      { timeout }
    )
  }

  /**
   * Click "Start" on a webxdc message in the main window
   * and return the window of exactly that app.
   * @param message the message's `listitem` in the message list
   */
  async openWebxdc(
    message: Locator,
    options?: { accountId?: number; timeout?: number }
  ): Promise<Page> {
    // MessageWrapper renders the message id as the `id` of its `<li>`
    const msgId = Number(await message.getAttribute('id'))
    if (!Number.isInteger(msgId)) {
      throw new Error('message locator must point to a message list item')
    }
    await message.getByRole('button', { name: 'Start' }).click()
    return this.webxdcWindow({ msgId, ...options })
  }

  callWindow(options?: { timeout?: number }) {
    return this.waitForWindow(/^calls-webapp-scheme:\/\//, options)
  }

  /**
   * Attach the newest app log (includes core and main process logs)
   * to the test report. See also {@link attachLogsOnFailure}.
   */
  async attachLogs(testInfo: TestInfo) {
    const logDir = join(this.profileDir, 'logs')
    let files: string[] = []
    try {
      files = readdirSync(logDir).sort()
    } catch {
      return
    }
    const newest = files.at(-1)
    const name = `${this.name}-${newest}`
    if (newest && !testInfo.attachments.some(a => a.name === name)) {
      await testInfo.attach(name, {
        body: readFileSync(join(logDir, newest)),
        contentType: 'text/plain',
      })
    }
  }

  async close() {
    await this.app.close().catch(() => {})
    rmSync(this.profileDir, { recursive: true, force: true })
  }
}

/**
 * Call in `afterEach` (failed tests) and `afterAll` (failed setup hooks)
 * to add the logs of the given instances to the report.
 */
export async function attachLogsOnFailure(
  ...instances: (DeltaChatElectron | undefined)[]
) {
  const testInfo = test.info()
  if (testInfo.status === testInfo.expectedStatus) {
    return
  }
  for (const dc of instances) {
    await dc?.attachLogs(testInfo)
  }
}

/**
 * Pack a directory of files into a .xdc (an uncompressed zip archive)
 * and return the path of the written file.
 * By default it is written to the current test's output directory,
 * which Playwright clears at the start of the next run.
 */
export function buildXdc(
  sourceDir: string,
  outDir = test.info().outputPath()
): string {
  mkdirSync(outDir, { recursive: true })
  const entries = readdirSync(sourceDir).map(name => ({
    name: Buffer.from(name),
    data: readFileSync(join(sourceDir, name)),
  }))
  const localParts: Buffer[] = []
  const centralParts: Buffer[] = []
  let offset = 0
  for (const { name, data } of entries) {
    const crc = crc32(data)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4) // version needed
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(data.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(name.length, 26)
    localParts.push(local, name, data)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4) // version made by
    central.writeUInt16LE(20, 6) // version needed
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(data.length, 20)
    central.writeUInt32LE(data.length, 24)
    central.writeUInt16LE(name.length, 28)
    central.writeUInt32LE(offset, 42)
    centralParts.push(central, name)

    offset += local.length + name.length + data.length
  }
  const central = Buffer.concat(centralParts)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(central.length, 12)
  end.writeUInt32LE(offset, 16)

  const outPath = join(
    mkdtempSync(join(outDir, 'xdc-')),
    `${basename(sourceDir)}.xdc`
  )
  writeFileSync(outPath, Buffer.concat([...localParts, central, end]))
  return outPath
}
