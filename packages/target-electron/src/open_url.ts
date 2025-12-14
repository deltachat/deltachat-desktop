import { app as rawApp, ipcMain } from 'electron'
import { readFile } from 'fs/promises'
import { basename } from 'path'
import { getLogger } from '../../shared/logger.js'
import { supportedURISchemes } from './application-constants.js'
import { showDeltaChat } from './tray.js'
import { ExtendedAppMainProcess } from './types.js'
import { send, window } from './windows/main.js'
import { platform } from 'os'

const log = getLogger('main/open_url')
const app = rawApp as ExtendedAppMainProcess

// Define custom protocol handler. Deep linking works on packaged versions of the application!
// These calls are for mac and windows, on linux it uses the desktop file.
if (platform() !== 'linux') {
  app.setAsDefaultProtocolClient('openpgp4fpr')
  app.setAsDefaultProtocolClient('OPENPGP4FPR')
  app.setAsDefaultProtocolClient('dcaccount')
  app.setAsDefaultProtocolClient('DCACCOUNT')
  app.setAsDefaultProtocolClient('dclogin')
  app.setAsDefaultProtocolClient('DCLOGIN')
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

app.on('open-url', (event, url) => {
  log.info('open url event')
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
  window?.webContents.send(
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

// Iterate over arguments and look out for uris and webxdc file paths
export function openUrlsAndFilesFromArgv(argv: string[]) {
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
        open_url(arg)
        continue args_loop
      }
    }
  }
}

app.on('second-instance', (_event, argv) => {
  log.debug('Someone tried to run a second instance')
  openUrlsAndFilesFromArgv(argv)
  // open file from argv
  if (window) {
    showDeltaChat()
  }
})
