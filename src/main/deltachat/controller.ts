import DeltaChat, { DeltaChat as DeltaChatNode } from 'deltachat-node'
import { app as rawApp, ipcMain } from 'electron'
import { EventEmitter } from 'events'
import { getLogger } from '../../shared/logger'
import * as mainWindow from '../windows/main'
import DCContext from './context'
import DCLoginController from './login'
import DCMessageList from './messagelist'
import DCStickers from './stickers'
import { ExtendedAppMainProcess } from '../types'
import { Context } from 'deltachat-node/node/dist/context'
import path, { join } from 'path'
import { existsSync, lstatSync } from 'fs'
import { stat, rename, readdir } from 'fs/promises'
import { getConfigPath } from '../application-constants'
import { rmdir } from 'fs/promises'
import { rm } from 'fs/promises'
import DCWebxdc from './webxdc'
import { DesktopSettings } from '../desktop_settings'
import { tx } from '../load-translations'

const app = rawApp as ExtendedAppMainProcess
const log = getLogger('main/deltachat')
const logCoreEvent = getLogger('core/event')
const logCoreEventM = getLogger('core/event/m')
const logMigrate = getLogger('main/migrate')

/**
 * DeltaChatController
 *
 * - proxy for a deltachat instance
 * - sends events to renderer
 * - handles events from renderer
 */
export default class DeltaChatController extends EventEmitter {
  /**
   * Created and owned by ipc on the backend
   */

  _inner_account_manager: DeltaChat | null = null
  get account_manager(): Readonly<DeltaChat> {
    if (!this._inner_account_manager) {
      throw new Error('account manager is not defined (yet?)')
    }
    return this._inner_account_manager
  }
  _inner_selectedAccountContext: Context | null = null
  get selectedAccountContext(): Readonly<Context> {
    if (!this._inner_selectedAccountContext) {
      throw new Error('selectedAccountContext is not defined (yet?)')
    }
    return this._inner_selectedAccountContext
  }
  selectedAccountId: number | null = null

  get accountDir() {
    return join(this.selectedAccountContext.getBlobdir(), '..')
  }

  ready = false // used for the about screen
  constructor(public cwd: string) {
    super()
    this.onAll = this.onAll.bind(this)
  }

  async init() {
    this._resetState()

    await this.migrateToAccountsApiIfNeeded()

    log.debug('Initiating DeltaChatNode')
    this._inner_account_manager = new DeltaChatNode(
      this.cwd,
      'deltachat-desktop'
    )

    this.account_manager.startJsonRpcHandler(response => {
      mainWindow.send('json-rpc-message', response)
      if (response.indexOf('event') !== -1)
        try {
          const { method, params } = JSON.parse(response)
          if (method === 'event') {
            const { contextId, event } = params
            if (event.type === 'Warning') {
              logCoreEvent.warn(contextId, event.msg)
            } else if (event === 'Info') {
              logCoreEvent.info(contextId, event.msg)
            } else if (event.startsWith('Error')) {
              logCoreEvent.error(contextId, event.msg)
            } else if (app.rc['log-debug']) {
              // in debug mode log all core events
              const event_clone = Object.assign({}, event) as Partial<
                typeof event
              >
              delete event_clone.type
              logCoreEvent.debug(event.type, contextId, event)
            }
          }
        } catch (error) {
          // ignore json parse errors
          return
        }
    })

    ipcMain.handle('json-rpc-request', (_ev, message) => {
      this.account_manager.jsonRpcRequest(message)
    })

    if (DesktopSettings.state.syncAllAccounts) {
      log.info('Ready, starting accounts io...')
      this.account_manager.startIO()
      log.info('Started accounts io.')
    }
  }

  async migrateToAccountsApiIfNeeded() {
    const new_accounts_format = existsSync(path.join(this.cwd, 'accounts.toml'))
    if (new_accounts_format) return

    logMigrate.debug(
      'accounts.toml not found, checking if there is previous data'
    )

    // findLegacyAccounts
    const paths = (await readdir(getConfigPath())).map(filename =>
      join(getConfigPath(), filename)
    )
    const accountFolders = paths.filter(path => {
      // isDeltaAccountFolder
      try {
        return (
          lstatSync(path).isDirectory() &&
          lstatSync(join(path, 'db.sqlite')).isFile() &&
          !lstatSync(path).isSymbolicLink()
        )
      } catch (error) {
        return false
      }
    })

    const migrate_from_format_1 = accountFolders.length !== 0
    const migrate_from_format_2 = existsSync(this.cwd)

    if (!migrate_from_format_1 && !migrate_from_format_2) {
      logMigrate.info('nothing to migrate')
      return
    }

    // this is the same as this.cwd, but for clarity added ../accounts
    const path_accounts = join(this.cwd, '..', 'accounts')

    const path_accounts_old = join(this.cwd, '..', 'accounts_old')

    if (migrate_from_format_2) {
      logMigrate.info('found old accounts (format 2), we need to migrate...')

      // First, rename accounts folder to accounts_old
      await rename(path_accounts, path_accounts_old)
    }

    // Next, create temporary account manger to migrate accounts
    const tmp_dc = new DeltaChat(path_accounts)
    this.registerEventHandler(tmp_dc)

    const old_folders_to_delete = []

    if (migrate_from_format_1) {
      logMigrate.info('found old legacy accounts (1), we need to migrate...')

      // Next, iterate over all folders in accounts_old
      for (const folder of accountFolders) {
        logMigrate.debug(`migrating legacy account "${folder}"`)
        const path_dbfile = path.join(folder, 'db.sqlite')
        const account_id = tmp_dc.migrateAccount(path_dbfile)
        if (account_id == 0) {
          logMigrate.error(`Failed to migrate account at path "${path_dbfile}"`)
        } else {
          old_folders_to_delete.push(folder)
        }
      }
    }

    if (migrate_from_format_2) {
      // Next, iterate over all folders in accounts_old
      for (const entry of await readdir(path_accounts_old)) {
        const stat_result = await stat(join(path_accounts_old, entry))
        if (!stat_result.isDirectory()) continue
        logMigrate.debug(
          `migrating account "${join(path_accounts_old, entry)}"`
        )
        const path_dbfile = path.join(path_accounts_old, entry, 'db.sqlite')
        if (!existsSync(path_dbfile)) {
          logMigrate.warn(
            'found an old accounts folder without a db.sqlite file, skipping'
          )
          continue
        }

        const account_id = tmp_dc.migrateAccount(path_dbfile)
        if (account_id == 0) {
          logMigrate.error(`Failed to migrate account at path "${path_dbfile}"`)
        } else {
          // check if there are stickers
          const old_sticker_folder = join(path_accounts_old, entry, 'stickers')
          if (existsSync(old_sticker_folder)) {
            logMigrate.debug(
              'found stickers, migrating them',
              old_sticker_folder
            )
            let ctx: null | Context = null
            try {
              ctx = tmp_dc.accountContext(account_id)
              const blobdir = ctx.getBlobdir()
              const new_sticker_folder = join(blobdir, '../stickers')
              await rename(old_sticker_folder, new_sticker_folder)
            } catch (error) {
              logMigrate.error(
                'stickers migration failed',
                old_sticker_folder,
                error
              )
            } finally {
              ctx?.unref()
            }
          }

          // if successful remove old account folder too
          old_folders_to_delete.push(path.join(path_accounts_old, entry))
        }
      }
    }

    this.unregisterEventHandler(tmp_dc)
    tmp_dc.close()
    // Clear some settings that we cant migrate
    DesktopSettings.update({
      lastAccount: undefined,
      lastChats: {},
    })

    // cleanup
    for (const old_folder of old_folders_to_delete) {
      try {
        await rm(join(old_folder, '.DS_Store'))
        await rmdir(old_folder)
      } catch (error) {
        logMigrate.error('Failed to cleanup old folder:', old_folder, error)
      }
    }
    logMigrate.info('migration completed')
  }

  readonly login = new DCLoginController(this)
  readonly messageList = new DCMessageList(this)
  readonly stickers = new DCStickers(this)
  readonly context = new DCContext(this)
  readonly webxdc = new DCWebxdc(this)

  /**
   * @param {string} methodName
   */
  __resolveNestedMethod(self: DeltaChatController, methodName: string) {
    const parts = methodName.split('.')
    if (parts.length > 2) {
      const message =
        'Resolving of nested method name failed: Too many parts, only two allowed: ' +
        methodName
      log.error(message)
      throw new Error(message)
    }
    const scope = (self as any)[parts[0]]
    if (typeof scope === 'undefined') {
      const message = 'Resolving of nested method name failed: ' + methodName
      log.error(message)
      throw new Error(message)
    }
    const method = scope[parts[1]]
    if (typeof method !== 'function') {
      const message = '(nested) Method is not of type function: ' + methodName
      log.error(message)
      throw new Error(message)
    }
    return method.bind(scope)
  }

  /**
   *
   * @param {*} evt
   * @param {string} methodName
   * @param {*} args
   */
  async callMethod(_evt: any, methodName: string, args: any[] = []) {
    const method =
      methodName.indexOf('.') !== -1
        ? this.__resolveNestedMethod(this, methodName)
        : (methodName => {
            const method = (this as any)[methodName]
            if (typeof method !== 'function') {
              const message = 'Method is not of type function: ' + methodName
              log.error(message)
              throw new Error(message)
            }
            return method.bind(this)
          })(methodName)

    let returnValue
    try {
      returnValue = await method(...args)
    } catch (err: any) {
      log.error(
        `Error calling ${methodName}(${args.join(', ')}):\n ${err.stack}`
      )
      throw err
    }
    return returnValue
  }

  sendToRenderer(eventType: string, payload?: any) {
    log.debug('sendToRenderer eventType: ' + eventType)
    //log.debug('sendToRenderer: ' + eventType, payload)
    mainWindow.send('ALL', eventType, payload)
    if (!eventType) {
      log.error(
        'Tried to send an undefined event to the renderer.\n' +
          'This is not allowed and will normally produce a crash of electron'
      )
      return
    }
    if (!payload) payload = null
    mainWindow.send(eventType, payload)
  }

  translate(
    ...args: Parameters<import('../../shared/localize').getMessageFunction>
  ) {
    return tx(...args)
  }

  onAll(event: string, accountId: number, data1: any, data2: any) {
    if (event === 'DC_EVENT_WARNING') {
      logCoreEventM.warn(accountId, event, data1, data2)
    } else if (event === 'DC_EVENT_INFO') {
      logCoreEventM.info(accountId, event, data1, data2)
    } else if (event.startsWith('DC_EVENT_ERROR')) {
      logCoreEventM.error(accountId, event, data1, data2)
    } else if (app.rc['log-debug']) {
      // in debug mode log all core events
      logCoreEventM.debug(accountId, event, data1, data2)
    }
  }

  registerEventHandler(dc: DeltaChat) {
    dc.startEvents()
    dc.on('ALL', this.onAll.bind(this))
  }

  unregisterEventHandler(dc: DeltaChat) {
    dc.removeListener('ALL', this.onAll)
  }

  /**
   * Internal
   * Reset state related to login
   */
  _resetState() {
    this.ready = false
  }
}
