import {
  app,
  BrowserWindow,
  protocol,
  ipcMain,
  session,
  screen,
} from 'electron/main'
import Mime from 'mime-types'
import {
  Menu,
  nativeImage,
  shell,
  MenuItemConstructorOptions,
  dialog,
  clipboard,
  IpcMainInvokeEvent,
} from 'electron'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { platform } from 'os'
import { readdir, stat, rmdir, writeFile, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import type DeltaChatController from './controller.js'
import { getLogger } from '../../../shared/logger.js'
import { getConfigPath, htmlDistDir } from '../application-constants.js'
import { truncateText } from '@deltachat-desktop/shared/util.js'
import { tx } from '../load-translations.js'
import { Bounds, DcOpenWebxdcParameters } from '../../../shared/shared-types.js'
import { DesktopSettings } from '../desktop_settings.js'
import { window as main_window } from '../windows/main.js'
import { writeTempFileFromBase64 } from '../ipc.js'
import {
  getAppMenu,
  getEditMenu,
  getFileMenu,
  refresh as refreshTitleMenu,
} from '../menu.js'
import { T } from '@deltachat/jsonrpc-client'
import type * as Jsonrpc from '@deltachat/jsonrpc-client'
import { setContentProtection } from '../content-protection.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const log = getLogger('main/deltachat/webxdc')

type AppInstance = {
  win: BrowserWindow
  msgId: number
  accountId: number
  internet_access: boolean
  selfAddr: string
  displayName: string
  sendUpdateInterval: number
  sendUpdateMaxSize: number
}
const open_apps: {
  [instanceId: string]: AppInstance
} = {}

// holds all accounts which have a session with webxdc scheme registered
const accounts_sessions: number[] = []

// TODO:
// 2. on message deletion close webxdc if open and remove its DOMStorage data

const CSP =
  "default-src 'self';\
  style-src 'self' 'unsafe-inline' blob: ;\
  font-src 'self' data: blob: ;\
  script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: ;\
  connect-src 'self' data: blob: ;\
  img-src 'self' data: blob: ;\
  media-src 'self' data: blob: ;\
  webrtc 'block'"

/**
 * Allowed permissions for webxdc applications.
 * https://www.electronjs.org/docs/latest/api/session#sessetpermissioncheckhandlerhandler
 * https://www.electronjs.org/docs/latest/api/session#sessetpermissionrequesthandlerhandler
 */
const ALLOWED_PERMISSIONS: string[] = [
  // Games might lock the pointer
  'pointerLock',
  // Games might do that too
  'fullscreen',
]

const WRAPPER_PATH = 'webxdc-wrapper.45870014933640136498.html'

const BOUNDS_UI_CONFIG_PREFIX = 'ui.desktop.webxdcBounds'

type Size = { width: number; height: number }

const DEFAULT_SIZE_WEBXDC: Size = {
  width: 375,
  height: 667,
}
const DEFAULT_SIZE_MAP: Size = {
  width: 1000,
  height: 800,
}

export default class DCWebxdc {
  constructor(private readonly controller: DeltaChatController) {
    // icon protocol
    app.whenReady().then(() => {
      protocol.handle('webxdc-icon', async request => {
        const [a, m] = request.url.substring(12).split('.')
        const [accountId, messageId] = [Number(a), Number(m)]
        try {
          const { icon } = await this.rpc.getWebxdcInfo(accountId, messageId)
          const blob = Buffer.from(
            await this.rpc.getWebxdcBlob(accountId, messageId, icon),
            'base64'
          )
          return new Response(blob, {
            headers: { 'content-type': Mime.lookup(icon) || '' },
          })
        } catch (error) {
          log.error('failed to load webxdc icon for:', error)
          return new Response('', { status: 404 })
        }
      })
    })

    /**
     * ipcMain handler for 'open-webxdc' event invoked by the renderer
     */
    const openWebxdc = async (
      _ev: IpcMainInvokeEvent,
      msg_id: number,
      p: DcOpenWebxdcParameters,
      defaultSize: Size = DEFAULT_SIZE_WEBXDC
    ) => {
      const { webxdcInfo, chatName, accountId, href } = p
      let base64EncodedHref = ''
      const appURL = `webxdc://${accountId}.${msg_id}.webxdc`
      if (href && href !== '') {
        // href is user provided content, so we want to be sure it's relative
        // relative href needs a base to construct URL
        const url = new URL(href, 'http://dummy')
        const relativeUrl = url.pathname + url.search + url.hash
        // make href eval safe
        base64EncodedHref = Buffer.from(appURL + relativeUrl).toString('base64')
      }
      if (open_apps[`${accountId}.${msg_id}`]) {
        log.warn(
          'webxdc instance for this app is already open, trying to focus it',
          { msg_id }
        )
        const window = open_apps[`${accountId}.${msg_id}`].win
        if (window.isMinimized()) {
          window.restore()
        }
        if (base64EncodedHref !== '') {
          // passed from a WebxdcInfoMessage
          window.webContents.executeJavaScript(
            `window.webxdc_internal.setLocationUrl("${base64EncodedHref}")`
          )
        }
        window.focus()
        return
      }

      log.info('opening new webxdc instance', { msg_id })

      const icon = webxdcInfo.icon
      const icon_blob = Buffer.from(
        await this.rpc.getWebxdcBlob(accountId, msg_id, icon),
        'base64'
      )

      // TODO intercept / deny network access - CSP should probably be disabled for testing

      if (!accounts_sessions.includes(accountId)) {
        const ses = sessionFromAccountId(accountId)
        accounts_sessions.push(accountId)
        ses.protocol.handle('webxdc', (...args) =>
          webxdcProtocolHandler(this.rpc, ...args)
        )
      }

      const app_icon = icon_blob && nativeImage?.createFromBuffer(icon_blob)

      const webxdcWindow = new BrowserWindow({
        webPreferences: {
          partition: partitionFromAccountId(accountId),
          sandbox: true,
          contextIsolation: true,
          webSecurity: true,
          nodeIntegration: false,
          navigateOnDragDrop: false,
          devTools: DesktopSettings.state.enableWebxdcDevTools,
          javascript: true,
          preload: join(htmlDistDir(), 'webxdc-preload.js'),
        },
        title: makeTitle(webxdcInfo, chatName),
        icon: app_icon || undefined,
        alwaysOnTop: main_window?.isAlwaysOnTop(),
        show: false,
      })
      setContentProtection(webxdcWindow)

      // reposition the window to last position (or default)
      const lastBounds: Bounds | null = await this.getLastBounds(
        accountId,
        msg_id
      )
      const size: Size = adjustSize(lastBounds || defaultSize)
      const bounds: Partial<Bounds> = { ...(lastBounds || {}), ...size }
      webxdcWindow.setBounds(bounds, true)

      // show after repositioning to avoid blinking
      webxdcWindow.show()
      open_apps[`${accountId}.${msg_id}`] = {
        win: webxdcWindow,
        accountId,
        msgId: msg_id,
        internet_access: webxdcInfo['internetAccess'],
        selfAddr: webxdcInfo.selfAddr || 'unknown@unknown',
        displayName: p.displayname || webxdcInfo.selfAddr || 'unknown',
        sendUpdateInterval: webxdcInfo.sendUpdateInterval,
        sendUpdateMaxSize: webxdcInfo.sendUpdateMaxSize,
      }

      const isMac = platform() === 'darwin'

      const makeMenu = () => {
        return Menu.buildFromTemplate([
          ...(isMac ? [getAppMenu(webxdcWindow)] : []),
          getFileMenu(webxdcWindow, isMac),
          getEditMenu(),
          {
            label: tx('global_menu_view_desktop'),
            submenu: [
              ...(DesktopSettings.state.enableWebxdcDevTools
                ? [
                    {
                      label: tx('global_menu_view_developer_tools_desktop'),
                      role: 'toggleDevTools',
                    } as MenuItemConstructorOptions,
                  ]
                : []),
              { type: 'separator' },
              { role: 'resetZoom' },
              { role: 'zoomIn' },
              { role: 'zoomOut' },
              { type: 'separator' },
              {
                label: tx('global_menu_view_floatontop_desktop'),
                type: 'checkbox',
                checked: webxdcWindow.isAlwaysOnTop(),
                click: () => {
                  webxdcWindow.setAlwaysOnTop(!webxdcWindow.isAlwaysOnTop())
                  if (platform() !== 'darwin') {
                    webxdcWindow.setMenu(makeMenu())
                  } else {
                    // change to webxdc menu
                    Menu.setApplicationMenu(makeMenu())
                  }
                },
              },
              { role: 'togglefullscreen' },
            ],
          },
          {
            label: tx('menu_help'),
            submenu: [
              {
                label: tx('source_code'),
                enabled: !!webxdcInfo.sourceCodeUrl,
                icon: app_icon?.resize({ width: 24 }) || undefined,
                click: () => {
                  if (
                    webxdcInfo.sourceCodeUrl?.startsWith('https:') ||
                    webxdcInfo.sourceCodeUrl?.startsWith('http:')
                  ) {
                    shell.openExternal(webxdcInfo.sourceCodeUrl)
                  } else if (webxdcInfo.sourceCodeUrl) {
                    const url = webxdcInfo.sourceCodeUrl
                    dialog
                      .showMessageBox(webxdcWindow, {
                        buttons: [tx('no'), tx('menu_copy_link_to_clipboard')],
                        message: tx(
                          'ask_copy_unopenable_link_to_clipboard',
                          url
                        ),
                      })
                      .then(({ response }) => {
                        if (response == 1) {
                          clipboard.writeText(url)
                        }
                      })
                  }
                },
              },
              {
                type: 'separator',
              },
              {
                label: tx('what_is_webxdc'),
                click: () => shell.openExternal('https://webxdc.org'),
              },
            ],
          },
        ])
      }

      if (!isMac) {
        webxdcWindow.setMenu(makeMenu())
      }

      webxdcWindow.on('focus', () => {
        if (isMac) {
          // change to webxdc menu
          Menu.setApplicationMenu(makeMenu())
        }
      })
      webxdcWindow.on('blur', () => {
        if (isMac) {
          // change back to main-window menu
          refreshTitleMenu()
        }
      })

      webxdcWindow.once('closed', () => {
        delete open_apps[`${accountId}.${msg_id}`]
      })

      webxdcWindow.once('close', () => {
        const lastBounds = webxdcWindow.getBounds()
        this.setLastBounds(accountId, msg_id, lastBounds)
      })

      webxdcWindow.once('ready-to-show', () => {
        if (base64EncodedHref !== '') {
          // passed from a WebxdcInfoMessage
          webxdcWindow.webContents.executeJavaScript(
            `window.webxdc_internal.setLocationUrl("${base64EncodedHref}")`
          )
        }
      })

      webxdcWindow.webContents.loadURL(appURL + '/' + WRAPPER_PATH, {
        extraHeaders: 'Content-Security-Policy: ' + CSP,
      })

      // prevent reload and navigation of wrapper page
      webxdcWindow.webContents.on('will-navigate', ev => {
        ev.preventDefault()
      })

      let denyPreventUnload = false
      // Otherwise the app can make itself uncloseable.
      // See https://github.com/deltachat/deltachat-desktop/issues/4726
      // The code is taken from
      // https://www.electronjs.org/docs/latest/api/web-contents#event-will-prevent-unload
      webxdcWindow.webContents.on('will-prevent-unload', ev => {
        if (denyPreventUnload) {
          ev.preventDefault()
        }
        // This `setTimeout` is a workaround for the fact
        // that some webxdc apps, as a result of
        // https://github.com/deltachat/deltachat-desktop/issues/3321,
        // came to rely on `beforeunload` in a not so nice way:
        // They `preventDefault()` the `beforeunload` event,
        // and `setTimeout(() => window.close())`,
        // which is supposed to simply delay the closing of the window.
        // See e.g. this code, which, in turn, is used by the Editor app.
        // https://codeberg.org/webxdc/y-webxdc/src/commit/0b3cfe1196b1e4c1af4a14fc82b818310e4a67b3/index.mjs#L72-L96
        // While that code used to work fine back in the day,
        // with the introduction of this `will-prevent-unload` listener
        // things changed: now Delta Chat works more similarly
        // to actual browsers, i.e. it will pop up this "confirm close"
        // dialog. But while the dialog is open,
        // the app is not able to execute any code,
        // thus it cannot close itself and the dialog, which results
        // in the user always having to interact with the dialog.
        //
        // So, what we do with the `setTimeout` is we let the app
        // close itself first, after it cancels the initial `beforeunload`.
        //
        // webxdc apps should stop using that hack, then we can remove
        // this `setTimeout` (revert the commit that introduced it).
        // Instead (besides us fixing the actual bug with `visibilitychange`),
        // apps should `window.top.addEventListener('visibilitychange'...`
        // (note the `.top`) instead of attaching the listener to just `window`.
        // See
        // https://github.com/deltachat/deltachat-desktop/issues/3321#issuecomment-1821024467.
        setTimeout(() => {
          if (webxdcWindow.isDestroyed()) {
            return
          }

          // Note that this will block this (main!) thread
          // until the user has closed the dialog.
          // The main app will be unresponsive until then,
          // which is probably not nice in case e.g. the user pressed "close"
          // on the webxdc app, but then left their PC
          // without interacting with the dialog.
          // However, this is pretty much in line with what regular browsers do,
          // except they also don't let you interact
          // with the rest of the browser until you close the dialog.
          //
          // We could use the async version (`showMessageBox()`),
          // but this would let the app execute its code.
          // If the app is actually malicious, it could try to do nasty stuff,
          // e.g. something like preventing the user from interacting
          // with the dialog, by entering fullscreen or something.
          // So, let's probably just stay in line with regular browsers.
          const choice = dialog.showMessageBoxSync(webxdcWindow, {
            type: 'question',
            // Chromium shows "Close" and "Cancel",
            // Gecko (Firefox) shows "Leave page" and "Stay on page".
            buttons: [tx('close_window'), tx('cancel')],
            title: tx('webxdc_beforeunload_dialog_title'),
            message: tx('webxdc_beforeunload_dialog_message'),
            defaultId: 0,
            cancelId: 1,
          })
          const close = choice === 0
          if (close) {
            // `ev.preventDefault()` doesn't work here because
            // here is not the top level of the event listener.

            denyPreventUnload = true
            // Yes, this will fire another `beforeunload` event
            // inside the app. If this is a problem,
            // consider `webxdcWindow.destroy()` instead.
            // However, this shouldn't be too problematic,
            // because this is practically equivalent
            // to the user first picking "Stay on page",
            // and then closing the app again and picking "Leave" this time.
            webxdcWindow.close()
          }
        }, 150)
      })

      // we would like to make `mailto:`-links work,
      // but https://github.com/electron/electron/pull/34418 is not merged yet.

      // prevent webxdc content from setting the window title
      webxdcWindow.on('page-title-updated', ev => {
        ev.preventDefault()
      })

      const loggedPermissionRequests = new Set<string>()

      const permission_handler = (permission: string) => {
        const isAllowed: boolean = ALLOWED_PERMISSIONS.includes(permission)

        // Prevent webxdcs from spamming the log
        if (!loggedPermissionRequests.has(permission)) {
          loggedPermissionRequests.add(permission)
          if (isAllowed) {
            log.info(
              `ALLOWED permission '${permission}' to webxdc '${webxdcInfo.name}'`
            )
          } else {
            log.info(
              `DENIED permission '${permission}' to webxdc '${webxdcInfo.name}'. If you think that's a bug and you need that permission, then please open an issue on github.`
            )
          }
        }

        return isAllowed
      }

      webxdcWindow.webContents.session.setPermissionCheckHandler(
        (_wc, permission) => {
          return permission_handler(permission)
        }
      )
      webxdcWindow.webContents.session.setPermissionRequestHandler(
        (_wc, permission, callback) => {
          callback(permission_handler(permission))
        }
      )

      webxdcWindow.webContents.on('before-input-event', (event, input) => {
        if (input.code === 'F12') {
          if (DesktopSettings.state.enableWebxdcDevTools) {
            webxdcWindow.webContents.toggleDevTools()
            event.preventDefault()
          }
        }
      })
    }

    // actual webxdc instances
    ipcMain.handle('open-webxdc', openWebxdc)

    ipcMain.handle('webxdc.exitFullscreen', async event => {
      const app = lookupAppFromEvent(event)
      // On Linux Electron hides the menu bar if we call
      // `setFullScreen(false)` and we're not already in full-screen,
      // so let's check for this.
      if (app && app.win.isFullScreen()) {
        app.win.setFullScreen(false)
      }
    })

    ipcMain.handle('webxdc.exit', async event => {
      const app = lookupAppFromEvent(event)
      if (app) {
        app.win.loadURL('about:blank')
        app.win.close()
      }
    })

    ipcMain.handle('webxdc.getAllUpdates', async (event, serial = 0) => {
      const app = lookupAppFromEvent(event)
      if (!app) {
        log.error(
          'webxdc.getAllUpdates failed, app not found in list of open ones'
        )
        return []
      }

      return await this.rpc.getWebxdcStatusUpdates(
        app.accountId,
        app.msgId,
        serial
      )
    })

    ipcMain.handle('webxdc.sendUpdate', async (event, update) => {
      const app = lookupAppFromEvent(event)
      if (!app) {
        log.error(
          'webxdc.sendUpdate failed, app not found in list of open ones'
        )
        return
      }
      try {
        return await this.rpc.sendWebxdcStatusUpdate(
          app.accountId,
          app.msgId,
          update,
          ''
        )
      } catch (error) {
        log.error('webxdc.sendUpdate failed:', error)
        throw error
      }
    })

    ipcMain.handle(
      'webxdc.sendRealtimeData',
      async (event, update: number[]) => {
        const app = lookupAppFromEvent(event)
        if (!app) {
          log.error(
            'webxdc.sendRealtimeData failed, app not found in list of open ones'
          )
          return
        }
        try {
          return await this.rpc.sendWebxdcRealtimeData(
            app.accountId,
            app.msgId,
            update
          )
        } catch (error) {
          log.error('webxdc.sendWebxdcRealtimeData failed:', error)
          throw error
        }
      }
    )

    ipcMain.handle('webxdc.sendRealtimeAdvertisement', async event => {
      const app = lookupAppFromEvent(event)
      if (!app) {
        log.error(
          'webxdc.sendRealtimeAdvertisement failed, app not found in list of open ones'
        )
        return
      }
      await this.rpc.sendWebxdcRealtimeAdvertisement(app.accountId, app.msgId)
    })

    ipcMain.handle('webxdc.leaveRealtimeChannel', async event => {
      const app = lookupAppFromEvent(event)
      if (!app) {
        log.error(
          'webxdc.leaveRealtimeChannel, app not found in list of open ones'
        )
        return
      }
      this.rpc.leaveWebxdcRealtime(app.accountId, app.msgId)
    })

    ipcMain.handle(
      'webxdc.sendToChat',
      (
        event,
        file: { file_name: string; file_content: string } | null,
        text: string | null
      ) => {
        const app = lookupAppFromEvent(event)
        if (!app) {
          log.error(
            'webxdc.sendToChat failed, app not found in list of open ones'
          )
          return
        }
        // forward to main window
        main_window?.webContents.send(
          'webxdc.sendToChat',
          file,
          text,
          app.accountId
        )
        main_window?.focus()
      }
    )

    ipcMain.handle('close-all-webxdc', () => {
      this._closeAll()
    })

    ipcMain.handle(
      'webxdc:custom:drag-file-out',
      async (
        event,
        file_name: string,
        base64_content: string,
        icon_data_url?: string
      ) => {
        const path = await writeTempFileFromBase64(file_name, base64_content)
        let icon: string | Electron.NativeImage = join(
          htmlDistDir(),
          'images/electron-file-drag-out.png'
        )
        if (icon_data_url) {
          icon = nativeImage.createFromDataURL(icon_data_url)
        }
        // if xdc extract icon?
        event.sender.startDrag({
          file: path,
          icon,
        })
      }
    )

    ipcMain.handle(
      'webxdc:status-update',
      (_ev, accountId: number, instanceId: number) => {
        const instance = open_apps[`${accountId}.${instanceId}`]
        if (instance) {
          instance.win.webContents.send('webxdc.statusUpdate')
        }
      }
    )

    ipcMain.handle(
      'webxdc:realtime-data',
      async (_ev, accountId: number, instanceId: number, payload: number[]) => {
        const instance = open_apps[`${accountId}.${instanceId}`]
        if (instance) {
          instance.win.webContents.send('webxdc.realtimeData', payload)
        } else {
          this.rpc.leaveWebxdcRealtime(accountId, instanceId)
        }
      }
    )

    ipcMain.handle(
      'webxdc:message-changed',
      async (_ev, accountId: number, instanceId: number) => {
        const instance = open_apps[`${accountId}.${instanceId}`]
        if (instance) {
          const { chatId, webxdcInfo } = await this.rpc.getMessage(
            accountId,
            instanceId
          )
          const { name } = await this.rpc.getBasicChatInfo(accountId, chatId)
          if (instance.win && webxdcInfo) {
            instance.win.title = makeTitle(webxdcInfo, name)
          }
        }
      }
    )

    ipcMain.handle(
      'webxdc:instance-deleted',
      (_ev, accountId: number, instanceId: number) => {
        const webxdcId = `${accountId}.${instanceId}`
        const instance = open_apps[webxdcId]
        if (instance) {
          instance.win.close()
        }
        this.removeLastBounds(accountId, instanceId)
        const s = sessionFromAccountId(accountId)
        const appURL = `webxdc://${webxdcId}.webxdc`
        s.clearStorageData({ origin: appURL })
        s.clearData({ origins: [appURL] })
        s.clearCodeCaches({ urls: [appURL] })
        s.clearCache()
      }
    )

    ipcMain.handle(
      'open-maps-webxdc',
      async (evt, accountId: number, chatId?: number) => {
        let msgId = await this.rpc.initWebxdcIntegration(
          accountId,
          chatId ?? null
        )
        if (!msgId) {
          // after packaging all files are in asar dir
          // core needs real path
          const path = htmlDistDir().replace('app.asar', 'app.asar.unpacked')
          await this.rpc.setWebxdcIntegration(
            accountId,
            join(path, '/xdcs/maps.xdc')
          )
          msgId = await this.rpc.initWebxdcIntegration(
            accountId,
            chatId ?? null
          )
        }
        if (msgId) {
          let chatName = tx('menu_show_global_map')
          if (chatId) {
            const relatedChatInfo = await this.rpc.getBasicChatInfo(
              accountId,
              chatId
            )
            chatName = tx('locations') + ' - ' + relatedChatInfo.name
          } else {
            const accountInfo = await this.rpc.getAccountInfo(accountId)
            if (
              'displayName' in accountInfo &&
              accountInfo.displayName !== null
            ) {
              chatName =
                tx('menu_show_global_map') + ' - ' + accountInfo.displayName
            }
          }
          // if map is already (or still) open, close it
          const key = `${accountId}.${msgId}`
          if (open_apps[key] !== undefined) {
            open_apps[key].win.loadURL('about:blank')
            open_apps[key].win.close()
          }
          const messageWithMap = await this.rpc.getMessage(accountId, msgId)
          if (messageWithMap && messageWithMap.webxdcInfo) {
            openWebxdc(
              evt,
              msgId,
              {
                accountId,
                displayname: '',
                chatName,
                webxdcInfo: messageWithMap.webxdcInfo,
                href: '',
              },
              // special behaviour for the map dc integration,
              // (in this case bigger landscape window)
              DEFAULT_SIZE_MAP
            )
          }
        }
      }
    )
  } // end of DeltaChatController constructor

  get rpc() {
    return this.controller.jsonrpcRemote.rpc
  }

  async getLastBounds(
    accountId: number,
    msgId: number
  ): Promise<Bounds | null> {
    try {
      const raw = await this.rpc.getConfig(
        accountId,
        `${BOUNDS_UI_CONFIG_PREFIX}.${msgId}`
      )
      if (raw) {
        return JSON.parse(raw)
      }
    } catch (error) {
      log.debug('failed to retrieve bounds for webxdc', error)
    }
    return null
  }

  setLastBounds(accountId: number, msgId: number, bounds: Bounds) {
    return this.rpc.setConfig(
      accountId,
      `${BOUNDS_UI_CONFIG_PREFIX}.${msgId}`,
      JSON.stringify(bounds)
    )
  }

  removeLastBounds(accountId: number, msgId: number) {
    return this.rpc.setConfig(
      accountId,
      `${BOUNDS_UI_CONFIG_PREFIX}.${msgId}`,
      null
    )
  }

  _closeAll() {
    for (const open_app of Object.keys(open_apps)) {
      open_apps[open_app].win.close()
    }
  }
}

async function webxdcProtocolHandler(
  rpc: Jsonrpc.RawClient,
  request: GlobalRequest
): Promise<GlobalResponse> {
  /**
   * Make sure to only `return makeResponse()` because it sets headers
   * that are important for security, namely `Content-Security-Policy`.
   * Failing to set CSP might result in the app being able to create
   * an <iframe> with no CSP, e.g. `<iframe src="/no_such_file.lol">`
   * within which they can then do whatever
   * through the parent frame, see
   * "XDC-01-002 WP1: Full CSP bypass via desktop app webxdc.js"
   * https://public.opentech.fund/documents/XDC-01-report_2_1.pdf
   */
  const makeResponse = (
    body: BodyInit,
    responseInit: Omit<ResponseInit, 'headers'>,
    mime_type?: undefined | string
  ) => {
    const headers = new Headers()
    if (!open_apps[id].internet_access) {
      headers.append('Content-Security-Policy', CSP)
    }
    // Ensure that the client doesn't try to interpret a file as
    // one with 'application/pdf' mime type and therefore open it
    // in the PDF viewer, see
    // "XDC-01-005 WP1: Full CSP bypass via desktop app PDF embed"
    // https://public.opentech.fund/documents/XDC-01-report_2_1.pdf
    headers.append('X-Content-Type-Options', 'nosniff')
    if (mime_type) {
      headers.append('content-type', mime_type)
    }
    return new Response(body, {
      ...responseInit,
      headers,
    })
  }

  const url = new URL(request.url)
  const [account, msg] = url.hostname.split('.')
  const id = `${account}.${msg}`

  if (!open_apps[id]) {
    return makeResponse('', { status: 500 })
  }

  let filename = url.pathname
  // remove leading / trailing "/"
  if (filename.endsWith('/')) {
    filename = filename.substring(0, filename.length - 1)
  }
  if (filename.startsWith('/')) {
    filename = filename.substring(1)
  }

  let mimeType: string | undefined = Mime.lookup(filename) || ''
  // Make sure that the browser doesn't open files in the PDF viewer.
  // TODO is this the only mime type that opens the PDF viewer?
  // TODO consider a mime type whitelist instead.
  if (mimeType === 'application/pdf') {
    // TODO make sure that `callback` won't internally set mime type back
    // to 'application/pdf' (at the time of writing it's not the case).
    // Otherwise consider explicitly setting it as a header.
    mimeType = undefined
  }

  if (filename === WRAPPER_PATH) {
    return makeResponse(
      await readFile(join(htmlDistDir(), '/webxdc_wrapper.html')),
      {},
      mimeType
    )
  } else if (filename === 'webxdc.js') {
    const displayName = Buffer.from(open_apps[id].displayName).toString(
      'base64'
    )
    const selfAddr = Buffer.from(open_apps[id].selfAddr).toString('base64')
    // initializes the preload script, the actual implementation of `window.webxdc` is found there: static/webxdc-preload.js
    return makeResponse(
      Buffer.from(
        `window.parent.webxdc_internal.setup("${selfAddr}","${displayName}", ${Number(
          open_apps[id].sendUpdateInterval
        )}, ${Number(open_apps[id].sendUpdateMaxSize)})
        window.webxdc = window.parent.webxdc
        window.webxdc_custom = window.parent.webxdc_custom`
      ),
      {},
      mimeType
    )
  } else {
    try {
      const blob = Buffer.from(
        await rpc.getWebxdcBlob(
          open_apps[id].accountId,
          open_apps[id].msgId,
          filename
        ),
        'base64'
      )
      return makeResponse(blob, {}, mimeType)
    } catch (error) {
      log.error('webxdc: load blob:', error)
      return makeResponse('', { status: 404 })
    }
  }
}

function lookupAppFromEvent(event: IpcMainInvokeEvent): AppInstance | null {
  for (const key of Object.keys(open_apps)) {
    const app = open_apps[key]
    if (app.win.webContents === event.sender) {
      return app
    }
  }
  return null
}

function makeTitle(webxdcInfo: T.WebxdcMessageInfo, chatName: string): string {
  return `${
    webxdcInfo.document ? truncateText(webxdcInfo.document, 32) + ' - ' : ''
  }${truncateText(webxdcInfo.name, 42)} – ${chatName}`
}

function partitionFromAccountId(accountId: number) {
  return `persist:webxdc_${accountId}`
}

function sessionFromAccountId(accountId: number) {
  return session.fromPartition(partitionFromAccountId(accountId), {
    cache: false,
  })
}

ipcMain.handle('webxdc.clearWebxdcDOMStorage', async (_, accountId: number) => {
  const session = sessionFromAccountId(accountId)
  await session.clearStorageData()
  await session.clearData()
})

ipcMain.handle('webxdc.getWebxdcDiskUsage', async (_, accountId: number) => {
  const ses = sessionFromAccountId(accountId)
  if (!ses.storagePath) {
    throw new Error('session has no storagePath set')
  }
  const [cache_size, real_total_size] = await Promise.all([
    ses.getCacheSize(),
    get_recursive_folder_size(ses.storagePath, [
      'GPUCache',
      'QuotaManager',
      'Code Cache',
      'LOG',
      'LOG.old',
      'LOCK',
      '.DS_Store',
      'Cookies-journal',
      'Databases.db-journal',
      'Preferences',
      'QuotaManager-journal',
      '000003.log',
      'MANIFEST-000001',
    ]),
  ])
  const empty_size = 49 * 1024 // ~ size of an empty session/partition

  let total_size = real_total_size - empty_size
  let data_size = total_size - cache_size
  if (total_size < 0) {
    total_size = 0
    data_size = 0
  }
  return {
    cache_size,
    total_size,
    data_size,
  }
})

async function get_recursive_folder_size(
  path: string,
  exclude_list: string[] = []
) {
  let size = 0
  for (const item of await readdir(path)) {
    const item_path = join(path, item)
    const stats = await stat(item_path)
    if (exclude_list.includes(item)) {
      continue
    }
    if (stats.isDirectory()) {
      size += await get_recursive_folder_size(item_path, exclude_list)
    } else {
      size += stats.size
    }
  }
  return size
}

export async function webxdcStartUpCleanup() {
  try {
    const partitions_dir = join(getConfigPath(), 'Partitions')
    if (!existsSync(partitions_dir)) {
      return
    }
    const folders = await readdir(partitions_dir)
    for (const folder of folders) {
      if (!folder.startsWith('webxdc')) {
        continue
      }
      try {
        await stat(join(partitions_dir, folder, 'webxdc-cleanup'))
        await rmdir(join(partitions_dir, folder), { recursive: true })
        log.info('webxdc cleanup: deleted ', folder)
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          throw error
        }
      }
    }
  } catch (error) {
    log.warn('webxdc cleanup failed', error)
  }
}

/**
 * Make sure a size doesn't extend the primary display work area.
 */
function adjustSize(size: Size): Size {
  const { height: screenHeight, width: screenWidth } =
    screen.getPrimaryDisplay().workAreaSize
  return {
    width: Math.min(size.width, screenWidth),
    height: Math.min(size.height, screenHeight),
  }
}

ipcMain.handle('delete_webxdc_account_data', async (_ev, accountId: number) => {
  // we can not delete the directory as it might still be used and that would be a problem on windows
  // so the second next best thing we can do is telling electron to clear the data, even though it won't delete everything
  const s = session.fromPartition(`persist:webxdc_${accountId}`, {
    cache: false,
  })
  await s.clearStorageData()
  await s.clearData()

  // mark the folder for deletion on next startup
  if (s.storagePath) {
    await writeFile(join(s.storagePath, 'webxdc-cleanup'), '-', 'utf-8')
  } else {
    throw new Error('session has no storagePath set')
  }
})
