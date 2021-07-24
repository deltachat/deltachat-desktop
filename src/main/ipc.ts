import { app as rawApp, clipboard, dialog, ipcMain } from 'electron'
import { copyFile, writeFile, ensureFile } from 'fs-extra'
import { getLogger } from '../shared/logger'
import { getLogsPath } from './application-constants'
import { LogHandler } from './log-handler'
import { ExtendedAppMainProcess } from './types'
import * as mainWindow from './windows/main'
import { openHelpWindow } from './windows/help'
import { join } from 'path'

const log = getLogger('main/ipc')
const DeltaChatController: typeof import('./deltachat/controller').default = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('./deltachat/controller').default
  } catch (error) {
    log.critical(
      "Fatal: The DeltaChat Module couldn't be loaded. Please check if all dependencies for deltachat-core are installed!",
      error
    )
    dialog.showErrorBox(
      'Fatal Error',
      `The DeltaChat Module couldn't be loaded.\n Please check if all dependencies for deltachat-core are installed!\n The Log file is located in this folder: ${getLogsPath()}`
    )
  }
})()

const app = rawApp as ExtendedAppMainProcess

export function init(cwd: string, logHandler: LogHandler) {
  const main = mainWindow
  const dcController = new DeltaChatController(cwd)

  ipcMain.once('ipcReady', _e => {
    app.ipcReady = true
    app.emit('ipcReady')
  })

  ipcMain.on('all', (e, ...args: any[]) => {
    log.debug('Renderer event:', e, ...args)
  })

  ipcMain.on('show', () => main.show())
  // ipcMain.on('setAllowNav', (e, ...args) => menu.setAllowNav(...args))

  ipcMain.once('frontendReady', () => app.emit('frontendReady'))

  /* dispatch a method on DC core */
  ipcMain.on(
    'EVENT_DC_DISPATCH',
    (e: any, _identifier: number, methodName: string, args: any[]) => {
      if (!Array.isArray(args)) args = [args]
      log.debug('EVENT_DC_DISPATCH: ', methodName, args)
      dcController.callMethod(e, methodName, args)
    }
  )

  /* dispatch a method on DC core with result passed to callback */
  ipcMain.on(
    'EVENT_DC_DISPATCH_CB',
    async (e: any, identifier: number, methodName: string, args: any[]) => {
      if (!Array.isArray(args)) args = [args]
      log.debug(`EVENT_DC_DISPATCH_CB (${identifier}) : ${methodName} ${args}`)

      try {
        const returnValue = await dcController.callMethod(e, methodName, args)
        main.send(
          `EVENT_DD_DISPATCH_RETURN_${identifier}_${methodName}`,
          returnValue
        )
      } catch (err) {
        main.send(
          `EVENT_DD_DISPATCH_RETURN_ERR_${identifier}_${methodName}`,
          err.toString()
        )
      }
    }
  )

  ipcMain.on('handleLogMessage', (_e, channel, level, stacktrace, ...args) =>
    logHandler.log(channel, level, stacktrace, ...args)
  )

  ipcMain.on('ondragstart', (event, filePath) => {
    event.sender.startDrag({
      file: filePath,
      icon: join(__dirname, '../../images/electron-file-drag-out.png'),
    })
  })

  ipcMain.on('saveLastChatId', (_e, chatId) => {
    const { lastChats } = app.state.saved
    lastChats[dcController.credentials.addr] = chatId
    // don't save to disk, because this is already done on close and it might block
    // we can ignore the crash case, because a crash isn't supposed to happen
    // and it's not important data
  })

  ipcMain.on('getLastSelectedChatId', e => {
    const { lastChats } = app.state.saved
    e.returnValue = lastChats[dcController.credentials.addr]
  })

  ipcMain.on('help', async (_ev, locale) => {
    await openHelpWindow(locale)
  })

  ipcMain.on('reload-main-window', () => {
    mainWindow.window.webContents.reload()
  })

  ipcMain.on('get-log-path', ev => {
    ev.returnValue = logHandler.logFilePath()
  })

  ipcMain.on('get-rc-config', ev => {
    ev.returnValue = app.rc
  })

  ipcMain.on('app-get-path', (ev, arg) => {
    ev.returnValue = app.getPath(arg)
  })

  ipcMain.handle('fileChooser', (_ev, options) => {
    return dialog.showOpenDialog(mainWindow.window, options)
  })

  ipcMain.handle('saveFile', async (_ev, source, options) => {
    const { canceled, filePath } = await dialog.showSaveDialog(
      mainWindow.window,
      options
    )
    if (!canceled && filePath) {
      await copyFile(source, filePath)
    }
  })

  ipcMain.handle('writeClipboardToTempFile', async (_ev, pathToFile) => {
    const buf = clipboard.readImage()
    log.info('Writing clipboard to file ' + pathToFile, buf)
    await ensureFile(pathToFile)
    await writeFile(pathToFile, buf.toPNG(), 'binary')
  })

  ipcMain.handle('saveTmpFile', async (_ev, pathToFile, data) => {
    log.info('GOT DATA IN IPC MAIN', data)
    await ensureFile(pathToFile)
    await writeFile(pathToFile, data, 'binary')
  })
}
