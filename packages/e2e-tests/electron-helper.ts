/**
 * Helpers to drive the real Electron app (as opposed to the browser target
 * used by `tests/`).
 *
 * Every BrowserWindow the app opens (main window, webxdc apps, call windows,
 * help, html email) is a Playwright `Page` in `app.windows()`.
 *
 * Prerequisite: `pnpm -w build:electron` (the tests launch the built app).
 */
import {
  _electron,
  expect,
  type ElectronApplication,
  type Page,
} from '@playwright/test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export const TARGET_ELECTRON = join(
  import.meta.dirname,
  '..',
  'target-electron'
)

/** see `windowDefaults()` in packages/target-electron/src/application-constants.ts */
const MAIN_WINDOW_URL = /^file:\/\/.*\/html-dist\/main\.html$/

/**
 * Wait until a window whose URL matches `url` is open and return it.
 * Windows are often created before their URL is loaded, so this polls
 * instead of only listening to the `window` event.
 * Throws if more than one window matches.
 */
export async function waitForWindow(
  app: ElectronApplication,
  url: RegExp,
  { timeout = 30_000 }: { timeout?: number } = {}
): Promise<Page> {
  const matching = () => app.windows().filter(p => url.test(p.url()))
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
    // This is set by VS Code extension hosts. Electron would start as plain
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
        ...extraArgs,
      ],
      env: {
        ...env,
        DC_TEST_DIR: profileDir,
        LANG: 'en_US.UTF-8',
        LANGUAGE: 'en_US',
      },
    })
    // Not `app.firstWindow()`: with `--devmode` the DevTools window
    // can be the first one.
    const mainWindow = await waitForWindow(app, MAIN_WINDOW_URL)
    return new DeltaChatElectron(name, app, mainWindow, profileDir)
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

  /** See {@link waitForWindow}. */
  waitForWindow(url: RegExp, options?: { timeout?: number }): Promise<Page> {
    return waitForWindow(this.app, url, options)
  }

  /**
   * Quit the app and delete its profile.
   */
  async close() {
    await this.app.close().catch(() => {})
    rmSync(this.profileDir, { recursive: true, force: true })
  }
}
