import { app as rawApp, dialog, ipcMain } from 'electron'
import { readFile } from 'fs/promises'
import { basename } from 'path'
import { getLogger } from '@deltachat-desktop/shared/logger.js'
import { parseWebxdcUri } from '@deltachat-desktop/shared/webxdcUri.js'
import { supportedURISchemes } from './application-constants.js'
import { showDeltaChat } from './tray.js'
import { ExtendedAppMainProcess } from './types.js'
import { openWebxdcFromUri } from './ipc.js'
import { tx } from './load-translations.js'
import { send, showInactiveOnStartup, window } from './windows/main.js'
import { platform } from 'os'

const log = getLogger('main/open_url')
const app = rawApp as ExtendedAppMainProcess

// Define custom protocol handler. Deep linking works on packaged versions of the application!
// These calls are for mac and windows, on linux it uses the desktop file.
// The portable build skips this: it would write registry entries pointing
// to the temporary extraction directory, which is gone after the app exits.
if (platform() !== 'linux' && !process.env.PORTABLE_EXECUTABLE_DIR) {
  app.setAsDefaultProtocolClient('openpgp4fpr')
  app.setAsDefaultProtocolClient('OPENPGP4FPR')
  app.setAsDefaultProtocolClient('dcaccount')
  app.setAsDefaultProtocolClient('DCACCOUNT')
  app.setAsDefaultProtocolClient('dclogin')
  app.setAsDefaultProtocolClient('DCLOGIN')
  app.setAsDefaultProtocolClient('dcwebxdc')
  app.setAsDefaultProtocolClient('DCWEBXDC')
  // do not forcefully set DC as standard email handler to not annoy users
}

let frontend_ready = false
ipcMain.once('frontendReady', () => {
  frontend_ready = true
})

function sendToFrontend(url: string) {
  if (url.toUpperCase().startsWith('OPENPGP4FPR') && url.indexOf('#') === -1) {
    // workaround until core can also work with it: https://github.com/deltachat/deltachat-core-rust/issues/1969
    send('open-url', url.replace('%23', '#'))
  } else {
    send('open-url', url)
  }
}

export const open_url = function (url: string) {
  log.info('open_url was called')
  const sendOpenUrlEvent = () => {
    log.info('open-url: Sending url to frontend.')
    if (frontend_ready) {
      sendToFrontend(url)
    } else {
      ipcMain.once('frontendReady', () => {
        sendToFrontend(url)
      })
    }
  }
  log.debug('open-url: sending to frontend:', url)
  if (app.ipcReady) return sendOpenUrlEvent()

  log.debug('open-url: Waiting for ipc to be ready before opening url.')
  app.once('ipcReady' as any, () => {
    log.debug('open-url: IPC ready.')
    sendOpenUrlEvent()
  })
}

/**
 * Opens the webxdc app of a `dcwebxdc:` URI. Unlike other URIs this doesn't
 * bring up the main window, as that would take the focus from the webxdc app.
 */
async function openWebxdcUri({
  accountId,
  msgId,
}: {
  accountId: number
  msgId: number
}) {
  if (!frontend_ready) {
    // On startup, the main window is shown without focus and the webxdc
    // window only opens after it, otherwise the main window takes the focus.
    showInactiveOnStartup()
    await new Promise(res => ipcMain.once('frontendReady', res))
    const mainWindow = window
    if (mainWindow && !mainWindow.isVisible() && !app.rc['minimized']) {
      await new Promise<void>(res => mainWindow.once('show', () => res()))
    }
  }
  if (!(await openWebxdcFromUri(accountId, msgId))) {
    // without a parent window, so that it is also visible
    // when the main window is hidden in the tray
    dialog.showMessageBox({
      type: 'warning',
      message: tx('webxdc_app_not_found'),
    })
  }
}

app.on('open-url', (event, url) => {
  log.info('open url event')
  const webxdcUri = parseWebxdcUri(url)
  if (webxdcUri) {
    event?.preventDefault()
    openWebxdcUri(webxdcUri)
    return
  }
  if (event) {
    event.preventDefault()
    app.focus()
    window?.focus()
  }
  open_url(url)
})

async function handleWebxdcFileOpen(path: string) {
  log.info('open file', path)
  if (!path.endsWith('.xdc')) {
    log.info('handleWebxdcFileOpen, path does not contain .xdc', path)
    return
  }
  app.focus()
  window?.focus()

  // hacky code - abuses webxdc sendToChat
  // todo make this code nicer and maybe show even a custom dialog that shows what is being sent?
  const buffer = await readFile(path)
  if (!app.ipcReady) {
    await new Promise(res => app.once('ipcReady' as any, res))
  }
  if (!frontend_ready) {
    await new Promise(res => ipcMain.once('frontendReady', res))
  }
  send(
    'webxdc.sendToChat',
    { file_name: basename(path), file_content: buffer.toString('base64') },
    null
  )
}

app.on('open-file', async (event, path) => {
  if (event) {
    event.preventDefault()
  }
  handleWebxdcFileOpen(path)
})

/**
 * Iterate over arguments and look out for uris and webxdc file paths
 * @returns whether a `dcwebxdc:` URI was opened, see `openWebxdcUri`
 */
export function openUrlsAndFilesFromArgv(argv: string[]): boolean {
  let openedWebxdcUri = false
  args_loop: for (let i = 1; i < argv.length; i++) {
    const arg = argv[i]

    if (arg.endsWith('.xdc')) {
      log.debug(
        'open-url: process something that looks like it could be a webxc file:',
        arg
      )
      handleWebxdcFileOpen(arg)
      continue
    }

    if (!arg.includes(':')) {
      continue
    }

    log.debug(
      'open-url: process something that looks like it could be a scheme:',
      arg
    )
    for (const expectedScheme of supportedURISchemes) {
      if (
        arg.startsWith(expectedScheme.toUpperCase()) ||
        arg.startsWith(expectedScheme.toLowerCase())
      ) {
        log.debug('open-url: Detected URI: ', arg)
        const webxdcUri = parseWebxdcUri(arg)
        if (webxdcUri) {
          openWebxdcUri(webxdcUri)
          openedWebxdcUri = true
        } else {
          open_url(arg)
        }
        continue args_loop
      }
    }
  }
  return openedWebxdcUri
}

app.on('second-instance', (_event, argv) => {
  log.debug('Someone tried to run a second instance')
  const openedWebxdcUri = openUrlsAndFilesFromArgv(argv)
  // open file from argv
  if (window && !openedWebxdcUri) {
    showDeltaChat()
  }
})
