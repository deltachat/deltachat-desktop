import { app, BrowserWindow, protocol, ipcMain, session } from 'electron/main'
import type DeltaChatController from './controller'
import SplitOut from './splitout'
import { getLogger } from '../../shared/logger'
const log = getLogger('main/deltachat/webxdc')
import Mime from 'mime-types'
import { Menu, nativeImage, shell } from 'electron'
import { join } from 'path'
import { readdir, stat, rmdir, writeFile } from 'fs/promises'
import { getConfigPath } from '../application-constants'
import UrlParser from 'url-parse'
import type { Message } from 'deltachat-node'
import { truncateText } from '../../shared/util'
import { platform } from 'os'
import { tx } from '../load-translations'
import { DcOpenWebxdcParameters } from '../../shared/shared-types'

const open_apps: {
  [instanceId: string]: {
    win: BrowserWindow
    msg_obj: Message
    msgId: number
    accountId: number
  }
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
        const [account, message] = request.url.substr(12).split('.')
        const context = this.accounts.accountContext(Number(account))
        const msg = context.getMessage(Number(message))
        if (!msg || !msg.webxdcInfo) {
          log.error('message not found or not a webxdc message:', message)
          return callback({ statusCode: 404 })
        }
        const icon = msg.webxdcInfo.icon
        const blob = context.getWebxdcBlob(msg, icon)
        if (!blob) {
          log.error('getWebxdcBlob returned null instead of an icon')
          return callback({ statusCode: 404 })
        }
        callback({
          mimeType: Mime.lookup(icon) || '',
          data: blob,
        })
        context.unref()
      })
    })

    // actual webxdc instances
    ipcMain.handle('open-webxdc', (_ev, msg_id, p: DcOpenWebxdcParameters) => {
      const { webxdcInfo, chatName, displayname, addr, accountId } = p
      if (open_apps[`${accountId}.${msg_id}`]) {
        log.warn(
          'webxdc instance for this app is already open, trying to focus it',
          { msg_id }
        )
        open_apps[`${accountId}.${msg_id}`].win.focus()
        return
      }

      const dc_context = this.accounts.accountContext(accountId)

      log.info('opening new webxdc instance', { msg_id })

      const webxdc_message_ref = dc_context.getMessage(msg_id)
      if (!webxdc_message_ref) {
        log.error('message not found')
        return
      }

      const icon = webxdcInfo.icon
      const icon_blob = dc_context.getWebxdcBlob(webxdc_message_ref, icon)

      const ses = sessionFromAccountId(accountId)
      const appURL = `webxdc://${accountId}.${msg_id}.webxdc`

      // TODO intercept / deny network access - CSP should probably be disabled for testing

      if (!accounts_sessions.includes(accountId)) {
        accounts_sessions.push(accountId)
        ses.protocol.registerBufferProtocol(
          'webxdc',
          async (request, callback) => {
            const url = UrlParser(request.url)
            const [account, msg] = url.hostname.split('.')
            const id = `${account}.${msg}`

            if (!open_apps[id]) {
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
                displayname || addr || 'unknown'
              ).toString('base64')
              const seflAddr = Buffer.from(addr || 'unknown@unknown').toString(
                'base64'
              )

              // initializes the preload script, the actual implementation of `window.webxdc` is found there: static/webxdc-preload.js
              callback({
                mimeType: Mime.lookup(filename) || '',
                data: Buffer.from(
                  `window.webxdc_internal.setup("${seflAddr}","${displayName}")`
                ),
              })
            } else {
              const blob = dc_context.getWebxdcBlob(
                open_apps[id].msg_obj,
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
          partition: partitionFromAccountId(accountId),
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
        title: `${
          webxdcInfo.document
            ? truncateText(webxdcInfo.document, 32) + ' - '
            : ''
        }${truncateText(webxdcInfo.name, 42)} – ${chatName}`,
        icon: app_icon || undefined,
        width: 375,
        height: 667,
      })
      open_apps[`${accountId}.${msg_id}`] = {
        win: webxdc_windows,
        msg_obj: webxdc_message_ref,
        accountId,
        msgId: msg_id,
      }

      if (platform() !== 'darwin') {
        webxdc_windows.setMenu(
          Menu.buildFromTemplate([
            {
              label: tx('global_menu_file_desktop'),
              submenu: [
                {
                  label: tx('global_menu_file_quit_desktop'),
                  click: () => {
                    webxdc_windows.close()
                  },
                },
              ],
            },
            { role: 'viewMenu' },
            {
              label: tx('menu_help'),
              submenu: [
                {
                  label: tx('source_code'),
                  enabled: !!webxdcInfo.sourceCodeUrl,
                  icon: app_icon?.resize({ width: 24 }) || undefined,
                  click: () =>
                    webxdcInfo.sourceCodeUrl &&
                    shell.openExternal(webxdcInfo.sourceCodeUrl),
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
        )
      }

      webxdc_windows.once('closed', () => {
        delete open_apps[`${accountId}.${msg_id}`]
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

    ipcMain.handle('webxdc.exitFullscreen', async event => {
      const key = Object.keys(open_apps).find(
        key => open_apps[key].win.webContents === event.sender
      )
      if (key) open_apps[key].win.setFullScreen(false)
    })

    ipcMain.handle('webxdc.getAllUpdates', async (event, serial = 0) => {
      const key = Object.keys(open_apps).find(
        key => open_apps[key].win.webContents === event.sender
      )
      if (!key) {
        log.error(
          'webxdc.getAllUpdates failed, app not found in list of open ones'
        )
        return []
      }
      const context = this.accounts.accountContext(open_apps[key].accountId)
      const result = context.getWebxdcStatusUpdates<any>(
        open_apps[key].msgId,
        serial
      )
      context.unref()
      return result
    })

    ipcMain.handle('webxdc.sendUpdate', async (event, update, description) => {
      const key = Object.keys(open_apps).find(
        key => open_apps[key].win.webContents === event.sender
      )
      if (!key) {
        log.error(
          'webxdc.sendUpdate failed, app not found in list of open ones'
        )
        return
      }
      const context = this.accounts.accountContext(open_apps[key].accountId)
      context.sendWebxdcStatusUpdate(open_apps[key].msgId, update, description)
      context.unref()
    })

    ipcMain.handle('close-all-webxdc', () => {
      this._closeAll()
    })

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
      'webxdc:instance-deleted',
      (_ev, accountId: number, instanceId: number) => {
        const instance = open_apps[`${accountId}.${instanceId}`]
        if (instance) {
          instance.win.close()
        }
        const s = sessionFromAccountId(accountId)
        const appURL = `webxdc://${accountId}.${instanceId}.webxdc`
        s.clearStorageData({ origin: appURL })
        s.clearCodeCaches({ urls: [appURL] })
        s.clearCache()
      }
    )
  }

  _closeAll() {
    for (const open_app of Object.keys(open_apps)) {
      open_apps[open_app].win.close()
    }
  }
}

function partitionFromAccountId(accountId: number) {
  return `persist:webxdc_${accountId}`
}

function sessionFromAccountId(accountId: number) {
  return session.fromPartition(partitionFromAccountId(accountId), {
    cache: false,
  })
}

ipcMain.handle('webxdc.clearWebxdcDOMStorage', (_, accountId: number) => {
  sessionFromAccountId(accountId).clearStorageData()
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

ipcMain.handle('delete_webxdc_account_data', async (_ev, accountId: number) => {
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
})
