import { app, BrowserWindow, protocol, ipcMain, session } from 'electron/main'
import type DeltaChatController from './controller'
import SplitOut from './splitout'
import { getLogger } from '../../shared/logger'
const log = getLogger('main/deltachat/webxdc')
import Mime from 'mime-types'
import { nativeImage } from 'electron'
import { join } from 'path'
import { readdir, stat, rmdir, writeFile } from 'fs/promises'
import { getConfigPath } from '../application-constants'
import UrlParser from 'url-parse'
import type { Message } from 'deltachat-node'

const open_apps: {
  [msgId: number]: { win: BrowserWindow; msg_obj: Message }
} = {}

// account sessions that have the webxdc scheme registered
const accounts_sessions: number[] = []

// TODO:
// 2. on message deletion close webxdc if open and remove its DOMStorage data

const CSP =
  "default-src 'self';\
  style-src 'self' 'unsafe-inline' blob: ;\
  font-src 'self' data: blob: ;\
  script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: ;\
  img-src 'self' data: blob: ;"

export default class DCWebxdc extends SplitOut {
  constructor(controller: DeltaChatController) {
    super(controller)

    // icon protocoll
    app.whenReady().then(() => {
      protocol.registerBufferProtocol('webxdc-icon', (request, callback) => {
        const url = request.url.substr(12)

        const msg = this.selectedAccountContext.getMessage(Number(url))
        if (!msg || !msg.webxdcInfo) {
          log.error('message not found or not a webxdc message:', url)
          return callback({ statusCode: 404 })
        }
        const icon = msg.webxdcInfo.icon
        const blob = this.selectedAccountContext.getWebxdcBlob(msg, icon)
        if (!blob) {
          log.error('getWebxdcBlob returned null instead of an icon')
          return callback({ statusCode: 404 })
        }
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
        open_apps[msg_id].win.focus()
        return
      }

      log.info('opening new webxdc instance', { msg_id })

      const webxdc_message = this.selectedAccountContext.getMessage(msg_id)
      if (!webxdc_message || !webxdc_message.webxdcInfo) {
        log.error('message not found or not a webxdc message')
        return
      }

      const icon = webxdc_message.webxdcInfo.icon
      const icon_blob = this.selectedAccountContext.getWebxdcBlob(
        webxdc_message,
        icon
      )

      const ses = this._currentSession
      const appURL = `webxdc://${msg_id}.webxdc`

      // TODO intercept / deny network access - CSP should probably be disabled for testing

      if (!this.selectedAccountId) {
        throw new Error('this.selectedAccountId is undefined')
      }

      if (!accounts_sessions.includes(this.selectedAccountId)) {
        accounts_sessions.push(this.selectedAccountId)
        ses.protocol.registerBufferProtocol(
          'webxdc',
          async (request, callback) => {
            const url = UrlParser(request.url)
            const msg_id = Number(url.hostname.split('.')[0])

            if (!open_apps[msg_id]) {
              return
            }

            let filename = url.pathname
            // remove leading / trailing "/"
            if (filename.endsWith('/')) {
              filename = filename.substr(0, filename.length - 1)
            }
            if (filename.startsWith('/')) {
              filename = filename.substr(1)
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
              const blob = this.selectedAccountContext.getWebxdcBlob(
                open_apps[msg_id].msg_obj,
                filename
              )
              if (blob) {
                callback({
                  mimeType: Mime.lookup(filename) || '',
                  data: blob,
                  headers: {
                    'Content-Security-Policy': CSP,
                  },
                })
              } else {
                callback({ statusCode: 404 })
              }
            }
          }
        )
      }

      const app_icon = icon_blob && nativeImage?.createFromBuffer(icon_blob)

      const webxdc_windows = new BrowserWindow({
        webPreferences: {
          partition: this._currentPartition,
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
        icon: app_icon || undefined,
        width: 375,
        height: 667,
      })
      open_apps[msg_id] = { win: webxdc_windows, msg_obj: webxdc_message }

      webxdc_windows.once('closed', () => {
        delete open_apps[msg_id]
      })

      webxdc_windows.once('ready-to-show', () => {})

      webxdc_windows.webContents.loadURL(appURL + '/index.html', {
        extraHeaders: 'Content-Security-Policy: ' + CSP,
      })

      // prevent webxdc content from setting the window title
      webxdc_windows.on('page-title-updated', ev => {
        ev.preventDefault()
      })

      type setPermissionRequestHandler = typeof webxdc_windows.webContents.session.setPermissionRequestHandler
      type permission_arg = Parameters<
        Exclude<Parameters<setPermissionRequestHandler>[0], null>
      >[1]
      const permission_handler = (permission: permission_arg) => {
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

    ipcMain.handle('webxdc.getAllUpdates', async (event, serial = 0) => {
      const key = Object.keys(open_apps).find(
        key => open_apps[Number(key)].win.webContents === event.sender
      )
      if (!key) {
        log.error(
          'webxdc.getAllUpdates failed, app not found in list of open ones'
        )
        return []
      }
      return this.selectedAccountContext.getWebxdcStatusUpdates(
        Number(key),
        serial
      )
    })

    ipcMain.handle('webxdc.sendUpdate', async (event, update, description) => {
      const key = Object.keys(open_apps).find(
        key => open_apps[Number(key)].win.webContents === event.sender
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
      (_ev: any, msg_id: number, _status_update_id: number) => {
        const instance = open_apps[msg_id]
        if (instance) {
          instance.win.webContents.send('webxdc.statusUpdate')
        }
      }
    )
  }

  closeAll() {
    for (const open_app of Object.keys(open_apps)) {
      open_apps[Number(open_app)].win.close()
    }
  }

  get _currentPartition() {
    return `persist:webxdc_${this.selectedAccountId}`
  }

  get _currentSession() {
    return session.fromPartition(this._currentPartition, { cache: false })
  }

  clearWebxdcDOMStorage() {
    return this._currentSession.clearStorageData()
  }

  async deleteWebxdcAccountData() {
    if (!this.selectedAccountId) {
      throw new Error('this.selectedAccountId is undefined')
    }
    await this._deleteWebxdcAccountData(this.selectedAccountId)
    app.relaunch()
    app.quit()
  }

  async _deleteWebxdcAccountData(accountId: number) {
    // we can not delete the directory as it might still be used and that would be a problem on windows
    // so the second next best thing we can do is telling electron to clear the data, even though it won't delete everything
    const s = session.fromPartition(`persist:webxdc_${accountId}`, {
      cache: false,
    })
    await s.clearStorageData()

    // mark the folder for deletion on next startup
    if (s.storagePath) {
      await writeFile(join(s.storagePath, 'webxdc-cleanup'), '-', 'utf-8')
    } else {
      throw new Error('session has no storagePath set')
    }
  }

  async getWebxdcDiskUsage() {
    const ses = this._currentSession
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
  }
}

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
