import { app as rawApp, ipcMain } from 'electron'
import { EventEmitter } from 'events'
import { yerpc, BaseDeltaChat } from '@deltachat/jsonrpc-client'
import { getRPCServerPath } from '@deltachat/stdio-rpc-server'

import { getLogger } from '../../shared/logger.js'
import * as mainWindow from '../windows/main.js'
import { ExtendedAppMainProcess } from '../types.js'
import DCWebxdc from './webxdc.js'
import { DesktopSettings } from '../desktop_settings.js'
// import rc_config from '../rc.js'
import { StdioServer } from './stdio_server.js'
import rc_config from '../rc.js'

const app = rawApp as ExtendedAppMainProcess
const log = getLogger('main/deltachat')
const logCoreEvent = getLogger('core/event')
const logCoreEventM = getLogger('core/event/m')
// const logMigrate = getLogger('main/migrate')

class ElectronMainTransport extends yerpc.BaseTransport {
  constructor(private sender: (message: yerpc.Message) => void) {
    super()
  }

  onMessage(message: yerpc.Message): void {
    this._onmessage(message)
  }

  _send(message: yerpc.Message): void {
    this.sender(message)
  }
}

export class JRPCDeltaChat extends BaseDeltaChat<ElectronMainTransport> {}

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

  _inner_account_manager: StdioServer | null = null
  get account_manager(): Readonly<StdioServer> {
    if (!this._inner_account_manager) {
      throw new Error('account manager is not defined (yet?)')
    }
    return this._inner_account_manager
  }
  /** for runtime info */
  rpcServerPath?: string

  constructor(public cwd: string) {
    super()
  }

  _jsonrpcRemote: JRPCDeltaChat | null = null
  get jsonrpcRemote(): Readonly<JRPCDeltaChat> {
    if (!this._jsonrpcRemote) {
      throw new Error('_jsonrpcRemote is not defined (yet?)')
    }
    return this._jsonrpcRemote
  }

  async init() {
    log.debug('Initiating DeltaChatNode')
    const serverPath = await getRPCServerPath({
      // desktop should only use prebuilds normally
      skipSearchInPath: !rc_config['allow-unsafe-core-replacement'],
      disableEnvPath: !rc_config['allow-unsafe-core-replacement'],
    })
    this.rpcServerPath = serverPath
    log.info('using deltachat-rpc-server at', { serverPath })

    this._inner_account_manager = new StdioServer(
      response => {
        try {
          if (response.indexOf('"id":"main-') !== -1) {
            const message = JSON.parse(response)
            if (message.id.startsWith('main-')) {
              message.id = Number(message.id.replace('main-', ''))
              mainProcessTransport.onMessage(message)
              return
            }
          }
        } catch (error) {
          log.error('jsonrpc-decode', error)
        }
        mainWindow.send('json-rpc-message', response)
        if (response.indexOf('event') !== -1)
          try {
            const { result } = JSON.parse(response)
            const { contextId, event } = result
            if (
              contextId !== undefined &&
              typeof event === 'object' &&
              event.kind
            ) {
              if (event.kind === 'Warning') {
                logCoreEvent.warn(contextId, event.msg)
              } else if (event.kind === 'Info') {
                logCoreEvent.info(contextId, event.msg)
              } else if (event.kind.startsWith('Error')) {
                logCoreEvent.error(contextId, event.msg)
              } else if (app.rc['log-debug']) {
                // in debug mode log all core events
                const event_clone = Object.assign({}, event) as Partial<
                  typeof event
                >
                delete event_clone.kind
                logCoreEvent.debug(event.kind, contextId, event)
              }
            }
          } catch (error) {
            // ignore json parse errors
            return
          }
      },
      this.cwd,
      serverPath
    )

    this.account_manager.start()
    log.info('HI')

    //todo? multiple instances, accounts is always writable

    const mainProcessTransport = new ElectronMainTransport(message => {
      message.id = `main-${message.id}`
      this.account_manager.send(JSON.stringify(message))
    })

    ipcMain.handle('json-rpc-request', (_ev, message) => {
      this.account_manager.send(message)
    })

    this._jsonrpcRemote = new JRPCDeltaChat(mainProcessTransport, false)

    if (DesktopSettings.state.syncAllAccounts) {
      log.info('Ready, starting accounts io...')
      this.jsonrpcRemote.rpc.startIoForAllAccounts()
      log.info('Started accounts io.')
    }
    for (const account of await this.jsonrpcRemote.rpc.getAllAccountIds()) {
      this.jsonrpcRemote.rpc.setConfig(
        account,
        'verified_one_on_one_chats',
        '1'
      )
    }
  }

  readonly webxdc = new DCWebxdc(this)

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
}
