import { copyFile, mkdir, rm } from 'fs/promises'
import {
  app as rawApp,
  clipboard,
  dialog,
  ipcMain,
  nativeImage,
  shell,
} from 'electron'
import { getLogger } from '../shared/logger'
import { getLogsPath } from './application-constants'
import { LogHandler } from './log-handler'
import { ExtendedAppMainProcess } from './types'
import * as mainWindow from './windows/main'
import { openHelpWindow } from './windows/help'
import path, { basename, extname, join, posix, sep } from 'path'
import { DesktopSettings } from './desktop_settings'
import { getConfigPath } from './application-constants'
import { inspect } from 'util'
import { DesktopSettingsType, RuntimeInfo } from '../shared/shared-types'
import { platform } from 'os'
import { existsSync } from 'fs'
import { set_has_unread, updateTrayIcon } from './tray'
import mimeTypes from 'mime-types'
import { writeFile } from 'fs/promises'
import { openHtmlEmailWindow } from './windows/html_email'

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
      `The DeltaChat Module couldn't be loaded.
 Please check if all dependencies for deltachat-core are installed!
 The Log file is located in this folder: ${getLogsPath()}\n
 ${error instanceof Error ? error.message : inspect(error, { depth: null })}`
    )
  }
})()

const app = rawApp as ExtendedAppMainProcess

/** returns shutdown function */
export async function init(cwd: string, logHandler: LogHandler) {
  const main = mainWindow
  const dcController = new DeltaChatController(cwd)
  await dcController.init()

  ipcMain.once('ipcReady', _e => {
    app.ipcReady = true
    app.emit('ipcReady')
  })

  ipcMain.on('show', () => main.show())
  // ipcMain.on('setAllowNav', (e, ...args) => menu.setAllowNav(...args))

  ipcMain.on('handleLogMessage', (_e, channel, level, stacktrace, ...args) =>
    logHandler.log(channel, level, stacktrace, ...args)
  )

  ipcMain.on('ondragstart', (event, filePath) => {
    event.sender.startDrag({
      file: filePath,
      icon: join(__dirname, '../../images/electron-file-drag-out.png'),
    })
  })

  ipcMain.on('help', async (_ev, locale) => {
    await openHelpWindow(locale)
  })

  ipcMain.on('reload-main-window', () => {
    if (!mainWindow.window) {
      throw new Error('window does not exist, this should never happen')
    }
    mainWindow.window.webContents.reload()
  })

  ipcMain.on('get-log-path', ev => {
    ev.returnValue = logHandler.logFilePath()
  })

  ipcMain.on('get-config-path', ev => {
    ev.returnValue = getConfigPath().split(sep).join(posix.sep)
  })

  ipcMain.on('get-rc-config', ev => {
    ev.returnValue = app.rc
  })

  ipcMain.on('get-runtime-info', ev => {
    const info: RuntimeInfo = {
      isMac: platform() === 'darwin',
    }
    ev.returnValue = info
  })

  ipcMain.on('app-get-path', (ev, arg) => {
    ev.returnValue = app.getPath(arg)
  })

  ipcMain.handle('fileChooser', (_ev, options) => {
    if (!mainWindow.window) {
      throw new Error('window does not exist, this should never happen')
    }
    return dialog.showOpenDialog(mainWindow.window, options)
  })

  ipcMain.handle('saveFile', async (_ev, source) => {
    if (!mainWindow.window) {
      throw new Error('window does not exist, this should never happen')
    }

    let base_path = DesktopSettings.state.lastSaveDialogLocation
      ? DesktopSettings.state.lastSaveDialogLocation
      : app.getPath('downloads')

    if (!existsSync(base_path)) {
      base_path = app.getPath('downloads')
    }

    const { canceled, filePath } = await dialog.showSaveDialog(
      mainWindow.window,
      {
        defaultPath: join(base_path, basename(source)),
      }
    )

    if (!canceled && filePath) {
      try {
        await copyFile(source, filePath)
      } catch (error: any) {
        if (error.code == 'EACCES') {
          dialog.showErrorBox(
            'Permission Error',
            `Cannot write in this folder. You don't have write permission`
          )
        } else {
          dialog.showErrorBox(
            'Unhandled Error',
            `Cannot copy file. Error: ${error}`
          )
        }
      }
      DesktopSettings.update({
        lastSaveDialogLocation: path.dirname(filePath),
      })
    }
  })

  ipcMain.handle('get-desktop-settings', async _ev => {
    return DesktopSettings.state
  })

  ipcMain.handle(
    'set-desktop-setting',
    (
      _ev,
      key: keyof DesktopSettingsType,
      value: string | number | boolean | undefined
    ) => {
      DesktopSettings.update({ [key]: value })

      if (key === 'minimizeToTray') updateTrayIcon()

      return true
    }
  )

  ipcMain.handle(
    'app.setBadgeCountAndTrayIconIndicator',
    (_, count: number) => {
      app.setBadgeCount(count)
      set_has_unread(count !== 0)
    }
  )

  ipcMain.handle('app.writeClipboardToTempFile', () =>
    writeClipboardToTempFile()
  )

  ipcMain.handle('electron.shell.openExternal', (_ev, url) =>
    shell.openExternal(url)
  )
  ipcMain.handle('electron.shell.openPath', (_ev, path) => shell.openPath(path))
  ipcMain.handle('electron.clipboard.readText', _ev => {
    return clipboard.readText()
  })
  ipcMain.handle('electron.clipboard.writeText', (_ev, text) => {
    return clipboard.writeText(text)
  })
  ipcMain.handle('electron.clipboard.writeImage', (_ev, path) => {
    return clipboard.writeImage(nativeImage.createFromPath(path))
  })

  ipcMain.handle(
    'saveBackgroundImage',
    async (_ev, file: string, isDefaultPicture: boolean) => {
      const originalFilePath = !isDefaultPicture
        ? file
        : join(__dirname, '../../images/backgrounds/', file)

      const bgDir = join(getConfigPath(), 'background')
      await rm(bgDir, { recursive: true, force: true })
      await mkdir(bgDir, { recursive: true })
      const fileName = `background_${Date.now()}` + extname(originalFilePath)
      const newPath = join(getConfigPath(), 'background', fileName)
      try {
        await copyFile(originalFilePath, newPath)
      } catch (error) {
        log.error('BG-IMG Copy Failed', error)
        throw error
      }
      return `img: ${fileName.replace(/\\/g, '/')}`
    }
  )

  ipcMain.handle(
    'openMessageHTML',
    async (
      _ev,
      window_id: string,
      subject: string,
      sender: string,
      content: string
    ) => {
      openHtmlEmailWindow(window_id, subject, sender, content)
    }
  )

  return () => {
    // the shutdown function
    dcController._inner_account_manager?.stopIO()
  }
}

async function writeClipboardToTempFile(): Promise<string> {
  const formats = clipboard.availableFormats().sort()
  log.debug('Clipboard available formats:', formats)
  if (formats.length <= 0) {
    throw new Error('No files to write')
  }
  const pathToFile = join(
    rawApp.getPath('temp'),
    `paste.${mimeTypes.extension(formats[0]) || 'bin'}`
  )
  const buf =
    mimeTypes.extension(formats[0]) === 'png'
      ? clipboard.readImage().toPNG()
      : clipboard.readBuffer(formats[0])
  log.debug(`Writing clipboard ${formats[0]} to file ${pathToFile}`)
  await writeFile(pathToFile, buf, 'binary')
  return pathToFile
}
