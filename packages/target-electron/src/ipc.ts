import { copyFile, writeFile, mkdir, rm } from 'fs/promises'
import {
  app as rawApp,
  clipboard,
  dialog,
  ipcMain,
  nativeImage,
  shell,
} from 'electron'
import path, { basename, extname, join, posix, sep, dirname } from 'path'
import { inspect } from 'util'
import { platform } from 'os'
import { existsSync } from 'fs'
import mimeTypes from 'mime-types'
import { versions } from 'process'
import { fileURLToPath } from 'url'

import { getLogger } from '../../shared/logger.js'
import { getDraftTempDir, getLogsPath } from './application-constants.js'
import { LogHandler } from './log-handler.js'
import { ExtendedAppMainProcess } from './types.js'
import * as mainWindow from './windows/main.js'
import { openHelpWindow } from './windows/help.js'
import { DesktopSettings } from './desktop_settings.js'
import { getConfigPath } from './application-constants.js'
import { DesktopSettingsType, RuntimeInfo } from '../../shared/shared-types.js'
import { set_has_unread, updateTrayIcon } from './tray.js'
import { openHtmlEmailWindow } from './windows/html_email.js'
import { appx, mapPackagePath } from './isAppx.js'
import DeltaChatController from './deltachat/controller.js'
import { BuildInfo } from './get-build-info.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const log = getLogger('main/ipc')

const app = rawApp as ExtendedAppMainProcess

let dcController: typeof DeltaChatController.prototype
export function getDCJsonrpcClient() {
  return dcController.jsonrpcRemote.rpc
}

/** returns shutdown function */
export async function init(cwd: string, logHandler: LogHandler) {
  const main = mainWindow
  dcController = new DeltaChatController(cwd)

  try {
    await dcController.init()
  } catch (error) {
    log.critical(
      "Fatal: The DeltaChat Module couldn't be loaded. Please check if all dependencies for deltachat-core are installed!",
      error,
      dcController.rpcServerPath
    )
    /* ignore-console-log */
    console.error(
      "Fatal: The DeltaChat Module couldn't be loaded. Please check if all dependencies for deltachat-core are installed!",
      error,
      dcController.rpcServerPath
    )
    dialog.showErrorBox(
      'Fatal Error',
      `The DeltaChat Module couldn't be loaded.
Please check if all dependencies for deltachat-core are installed!
The Log file is located in this folder: ${getLogsPath()}\n
${dcController.rpcServerPath}\n
${error instanceof Error ? error.message : inspect(error, { depth: null })}`
    )
    rawApp.exit(1)
  }

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

  ipcMain.on('help', async (_ev, locale, anchor?: string) => {
    await openHelpWindow(locale, anchor)
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
      isAppx: appx,
      versions: [
        { label: 'electron', value: versions.electron },
        { label: 'node', value: versions.node },
      ],
      runningUnderARM64Translation: app.runningUnderARM64Translation,
      rpcServerPath: dcController.rpcServerPath,
      buildInfo: BuildInfo,
    }
    ev.returnValue = info
  })

  ipcMain.on('app-get-path', (ev, arg) => {
    ev.returnValue = app.getPath(arg)
  })

  ipcMain.handle('fileChooser', async (_ev, options) => {
    if (!mainWindow.window) {
      throw new Error('window does not exist, this should never happen')
    }
    const returnValue = await dialog.showOpenDialog(mainWindow.window, options)
    mainWindow.window.filePathWhiteList.push(...returnValue.filePaths)
    return returnValue
  })

  let lastSaveDialogLocation: string | undefined = undefined
  ipcMain.handle(
    'saveFile',
    async (_ev, pathToSource: string, filename: string) => {
      if (!mainWindow.window) {
        throw new Error('window does not exist, this should never happen')
      }

      let base_path = lastSaveDialogLocation || app.getPath('downloads')

      if (!existsSync(base_path)) {
        base_path = app.getPath('downloads')
      }

      const { canceled, filePath } = await dialog.showSaveDialog(
        mainWindow.window,
        {
          defaultPath: join(base_path, filename),
        }
      )

      if (!canceled && filePath) {
        try {
          await copyFile(pathToSource, filePath)
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
        lastSaveDialogLocation = path.dirname(filePath)
      }
    }
  )

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
  ipcMain.handle('app.writeTempFileFromBase64', (_ev, name, content) =>
    writeTempFileFromBase64(name, content)
  )
  ipcMain.handle('app.writeTempFile', (_ev, name, content) =>
    writeTempFile(name, content)
  )
  ipcMain.handle('app.removeTempFile', (_ev, path) => removeTempFile(path))

  ipcMain.handle('electron.shell.openExternal', (_ev, url) =>
    shell.openExternal(url)
  )
  ipcMain.handle('electron.shell.openPath', (_ev, path) => {
    // map sandbox path if on Windows
    shell.openPath(mapPackagePath(path))
  })
  ipcMain.handle('electron.clipboard.readText', () => {
    return clipboard.readText()
  })
  ipcMain.handle('electron.clipboard.readImage', () => {
    const image = clipboard.readImage()

    // Electron just returns an empty base64 string (for example
    // 'data:image/png;base64,' when no image was in the clipboard),
    // we check that here and more conveniently return null instead
    if (image.isEmpty()) {
      return null
    }

    return image.toDataURL()
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
      accountId: number,
      isContactRequest: boolean,
      subject: string,
      sender: string,
      receiveTime: string,
      content: string
    ) => {
      openHtmlEmailWindow(
        window_id,
        accountId,
        isContactRequest,
        subject,
        sender,
        receiveTime,
        content
      )
    }
  )

  return () => {
    // the shutdown function
    dcController.jsonrpcRemote.rpc.stopIoForAllAccounts()
  }
}

async function writeClipboardToTempFile(): Promise<string> {
  await mkdir(getDraftTempDir(), { recursive: true })
  const formats = clipboard.availableFormats().sort()
  log.debug('Clipboard available formats:', formats)
  if (formats.length <= 0) {
    throw new Error('No files to write')
  }
  const pathToFile = join(
    getDraftTempDir(),
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

export async function writeTempFileFromBase64(
  name: string,
  content: string
): Promise<string> {
  await mkdir(getDraftTempDir(), { recursive: true })
  const pathToFile = join(getDraftTempDir(), basename(name))
  log.debug(`Writing base64 encoded file ${pathToFile}`)
  await writeFile(pathToFile, Buffer.from(content, 'base64'), 'binary')
  return pathToFile
}

/**
 * this function is only needed to temporarily
 * save a VCard to attach it to a draft message
 * should be removed once composer uses draft
 * message id and set_draft_vcard can be used
 * see https://github.com/deltachat/deltachat-core-rust/pull/5677
 */
export async function writeTempFile(
  name: string,
  content: string
): Promise<string> {
  await mkdir(getDraftTempDir(), { recursive: true })
  const pathToFile = join(getDraftTempDir(), basename(name))
  log.debug(`Writing tmp file ${pathToFile}`)
  await writeFile(pathToFile, Buffer.from(content, 'utf8'), 'binary')
  return pathToFile
}

async function removeTempFile(path: string) {
  if (
    path.indexOf(rawApp.getPath('temp')) === -1 ||
    path.indexOf('..') !== -1
  ) {
    log.error(
      'removeTempFile was called with a path that is outside of the temp dir: ',
      path
    )
    throw new Error('Path is outside of the temp folder')
  }
  await rm(path)
}
