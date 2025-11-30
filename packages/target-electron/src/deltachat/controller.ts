import { app as rawApp, ipcMain } from 'electron'
import { yerpc, BaseDeltaChat } from '@deltachat/jsonrpc-client'
import { getRPCServerPath } from '@deltachat/stdio-rpc-server'

import { getLogger } from '../../../shared/logger.js'
import * as mainWindow from '../windows/main.js'
import { ExtendedAppMainProcess } from '../types.js'
import DCWebxdc from './webxdc.js'
import { DesktopSettings } from '../desktop_settings.js'
import { StdioServer } from './stdio_server.js'
import rc_config from '../rc.js'
import {
  migrateAccountsIfNeeded,
  disableDeleteFromServerConfig,
} from './migration.js'

const app = rawApp as ExtendedAppMainProcess
const log = getLogger('main/deltachat')
const logCoreEvent = getLogger('core/event')

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
export default class DeltaChatController {
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

  constructor(public cwd: string) {}

  _jsonrpcRemote: JRPCDeltaChat | null = null
  get jsonrpcRemote(): Readonly<JRPCDeltaChat> {
    if (!this._jsonrpcRemote) {
      throw new Error('_jsonrpcRemote is not defined (yet?)')
    }
    return this._jsonrpcRemote
  }

  async init() {
    log.debug('Check if legacy accounts need migration')
    if (await migrateAccountsIfNeeded(this.cwd, getLogger('migration'))) {
      // Clear some settings that we can't migrate
      DesktopSettings.update({
        lastAccount: undefined,
        lastChats: {},
        lastSaveDialogLocation: undefined,
      })
    }

    log.debug('Initiating DeltaChatNode')
    let serverPath = await getRPCServerPath({
      // desktop should only use prebuilds normally
      disableEnvPath: !rc_config['allow-unsafe-core-replacement'],
    })
    if (serverPath.includes('app.asar')) {
      // probably inside of electron build
      serverPath = serverPath.replace('app.asar', 'app.asar.unpacked')
    }

    this.rpcServerPath = serverPath
    log.info('using deltachat-rpc-server at', { serverPath })

    this._inner_account_manager = new StdioServer(
      response => {
        try {
          // The `main-` in the ID prefix signifies that this is a response
          // to a request that originated from this (main) process's
          // JSON-RPC client, and not the JSON-RPC client
          // of the renderer process.
          // Thus we don't need to forward this response
          // to the renderer process.
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
              // A workaround.
              // Intercept the events that go to the renderer
              // and manually fire them on this JSON-RPC client.
              // See comments below about why we don't call `rpc.getNextEvent()`
              // on this JSON-RPC client.
              //
              // Note that, as you can see, if the renderer process
              // stops polling for events for whatever reason,
              // we will also stop emitting them here.
              //
              // The code is copy-pasted from
              // https://github.com/chatmail/core/blob/df0c0c47bacabfb8dcb4a5ea5edd92dc0652e0b3/deltachat-jsonrpc/typescript/src/client.ts#L56-L70
              const jsonrpcRemote_ = this._jsonrpcRemote
              if (jsonrpcRemote_) {
                type JRPCDeltaChatWithPrivateExposed = {
                  [P in keyof typeof jsonrpcRemote_]: (typeof jsonrpcRemote_)[P]
                } & {
                  contextEmitters: (typeof jsonrpcRemote_)['contextEmitters']
                }
                const jsonrpcRemote =
                  jsonrpcRemote_ as unknown as JRPCDeltaChatWithPrivateExposed
                jsonrpcRemote.emit(
                  result.event.kind,
                  result.contextId,
                  result.event
                )
                jsonrpcRemote.emit('ALL', result.contextId, result.event)
                if (jsonrpcRemote.contextEmitters[result.contextId]) {
                  jsonrpcRemote.contextEmitters[result.contextId].emit(
                    result.event.kind,
                    result.event as any
                  )
                  jsonrpcRemote.contextEmitters[result.contextId].emit(
                    'ALL',
                    result.event as any
                  )
                }
              }

              if (event.kind === 'WebxdcRealtimeData') {
                return
              }
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
                logCoreEvent.debug(contextId, event.kind, event)
              }
            }
          } catch (_error) {
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

    this._jsonrpcRemote = new JRPCDeltaChat(
      mainProcessTransport,
      // Do NOT start calling `rpc.getNextEvent`.
      // Because there can be only one consumer of
      // `get_next_event`, and that is the renderer process's JSON-RPC client.
      false
    )
    await disableDeleteFromServerConfig(
      this.jsonrpcRemote.rpc,
      getLogger('migration')
    )

    if (DesktopSettings.state.syncAllAccounts) {
      log.info('Ready, starting accounts io...')
      this.jsonrpcRemote.rpc.startIoForAllAccounts()
      log.info('Started accounts io.')
    }
  }

  readonly webxdc = new DCWebxdc(this)
}
