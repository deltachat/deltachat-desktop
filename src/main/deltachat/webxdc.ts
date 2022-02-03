import { app, BrowserWindow, protocol, ipcMain, session } from 'electron/main'
import type DeltaChatController from './controller'
import SplitOut from './splitout'
import { getLogger } from '../../shared/logger'
const log = getLogger('main/deltachat/webxdc')
import Mime from 'mime-types'
import { nativeImage } from 'electron'
import { join } from 'path'

const open_apps: { [msgId: number]: BrowserWindow } = {}

const CSP =
  "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data: ;"

export default class DCWebxdc extends SplitOut {
  constructor(controller: DeltaChatController) {
    super(controller)

    // icon protocoll
    app.whenReady().then(() => {
      protocol.registerBufferProtocol('webxdc-icon', (request, callback) => {
        const url = request.url.substr(12)

        const msg = this.selectedAccountContext.getMessage(Number(url))
        const icon = msg.webxdcInfo.icon
        const blob = this.selectedAccountContext.getWebxdcBlob(msg, icon)

        callback({
          mimeType: Mime.lookup(icon) || '',
          data: blob,
        })
      })
    })

    // actual webxdc instances
    ipcMain.handle('open-webxdc', (ev, msg_id) => {
      if (open_apps[msg_id]) {
        log.warn(
          'webxdc instance for this app is already open, trying to focus it',
          { msg_id }
        )
        open_apps[msg_id].focus()
        return
      }

      log.info('opening new webxdc instance', { msg_id })

      const webxdc_message = this.selectedAccountContext.getMessage(msg_id)
      const icon = webxdc_message.webxdcInfo.icon
      const icon_blob = this.selectedAccountContext.getWebxdcBlob(
        webxdc_message,
        icon
      )

      const partition = 'webxdc-temp-' + msg_id
      const ses = session.fromPartition(partition)

      // TODO intercept / deny network access - CSP should probably be disabled for testing

      ses.protocol.registerBufferProtocol(
        'webxdc',
        async (request, callback) => {
          let filename = request.url.substr(16)

          // remove trailing "/"
          if (filename[filename.length - 1] == '/') {
            filename = filename.substr(0, filename.length - 1)
          }

          if (filename === 'webxdc.js') {
            const displayName = Buffer.from(
              this.controller.settings.getConfig('displayname')
            ).toString('base64')
            const seflAddr = Buffer.from(
              this.controller.settings.getConfig('addr')
            ).toString('base64')

            // initializes the preload script, the actual implementation of `window.webxdc` is found there: static/webxdc-preload.js
            callback({
              mimeType: Mime.lookup(filename) || '',
              data: Buffer.from(
                `window.webxdc_internal.setup("${seflAddr}","${displayName}")`
              ),
            })
          } else {
            callback({
              mimeType: Mime.lookup(filename) || '',
              data: this.selectedAccountContext.getWebxdcBlob(
                webxdc_message,
                filename
              ),
              headers: {
                'Content-Security-Policy': CSP,
              },
            })
          }
        }
      )

      const app_icon = nativeImage?.createFromBuffer(icon_blob)

      const webxdc_windows = (open_apps[msg_id] = new BrowserWindow({
        webPreferences: {
          partition,
          sandbox: true,
          contextIsolation: true,
          webSecurity: true,
          nodeIntegration: false,
          navigateOnDragDrop: false,
          devTools: true,
          javascript: true,
          preload: join(
            __dirname,
            '..',
            '..',
            '..',
            'html-dist',
            'webxdc-preload.js'
          ),
        },
        title: `webxdc - ${webxdc_message.webxdcInfo.name}`,
        icon: app_icon,
        width: 375,
        height: 667,
      }))

      webxdc_windows.once('close', () => {
        webxdc_windows.webContents.session.clearStorageData({
          storages: ['indexdb', 'localstorage', 'cookies', 'serviceworkers'],
        })
      })

      webxdc_windows.once('closed', () => {
        delete open_apps[msg_id]
      })

      webxdc_windows.once('ready-to-show', () => {})

      webxdc_windows.webContents.loadURL('webxdc://webxdc/index.html', {
        extraHeaders: 'Content-Security-Policy: ' + CSP,
      })

      const permission_handler = (
        permission: Parameters<
          Parameters<
            typeof webxdc_windows.webContents.session.setPermissionRequestHandler
          >[0]
        >[1]
      ) => {
        if (permission == 'pointerLock') {
          log.info('allowed webxdc to lock the pointer')
          // because games might lock the pointer
          return true
        }
        if (permission == 'fullscreen') {
          log.info('allowed webxdc to go into fullscreen')
          // games might do that too
          return true
        }

        log.info(
          `webxdc requested "${permission}" permission, but we denied it.
If you think that's a bug and you need that permission, then please open an issue on github`
        )
        return false
      }

      webxdc_windows.webContents.session.setPermissionCheckHandler(
        (_wc, permission) => {
          return permission_handler(permission as any)
        }
      )
      webxdc_windows.webContents.session.setPermissionRequestHandler(
        (_wc, permission) => {
          return permission_handler(permission)
        }
      )
    })

    ipcMain.handle('webxdc.toggle_dev_tools', async event => {
      event.sender.toggleDevTools()
    })

    ipcMain.handle('webxdc.getAllUpdates', async event => {
      const key = Object.keys(open_apps).find(
        key => open_apps[Number(key)].webContents === event.sender
      )
      if (!key) {
        log.error(
          'webxdc.getAllUpdates failed, app not found in list of open ones'
        )
        return []
      }
      return this.selectedAccountContext.getWebxdcStatusUpdates(Number(key))
    })

    ipcMain.handle('webxdc.sendUpdate', async (event, update, description) => {
      const key = Object.keys(open_apps).find(
        key => open_apps[Number(key)].webContents === event.sender
      )
      if (!key) {
        log.error(
          'webxdc.sendUpdate failed, app not found in list of open ones'
        )
        return
      }
      return this.selectedAccountContext.sendWebxdcStatusUpdate(
        Number(key),
        update,
        description
      )
    })

    this.controller.addListener(
      'DC_EVENT_WEBXDC_STATUS_UPDATE',
      (_ev: any, msg_id: number, status_update_id: number) => {
        const instance = open_apps[msg_id]
        if (instance) {
          const status_update = this.selectedAccountContext.getWebxdcStatusUpdates(
            msg_id,
            status_update_id
          )
          instance.webContents.send('webxdc.statusUpdate', status_update[0])
        }
      }
    )
  }

  closeAll() {
    for (const open_app of Object.keys(open_apps)) {
      open_apps[Number(open_app)].close()
    }
  }
}
