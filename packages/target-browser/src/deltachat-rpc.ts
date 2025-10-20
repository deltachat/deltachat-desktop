import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { DC_ACCOUNTS_DIR } from './config'
import { getRPCServerPath } from '@deltachat/stdio-rpc-server'
import { BaseDeltaChat, yerpc } from '@deltachat/jsonrpc-client'
import { WebSocket, WebSocketServer } from 'ws'
import { RCConfig } from './rc-config'
import { getLogger } from '@deltachat-desktop/shared/logger'
import { join } from 'path'

const log = getLogger('main/dc_wss')
const logCoreEvent = getLogger('core')

class StdioServer {
  serverProcess: ChildProcessWithoutNullStreams | null
  constructor(public on_data: (reponse: string) => void) {
    this.serverProcess = null
  }

  async start() {
    const serverPath = await getRPCServerPath()
    log.info('using deltachat-rpc-server at', { serverPath })
    this.serverProcess = spawn(serverPath, {
      env: {
        DC_ACCOUNTS_PATH: DC_ACCOUNTS_DIR,
        RUST_LOG: process.env.RUST_LOG,
      },
    })

    let buffer = ''
    this.serverProcess.stdout.on('data', data => {
      // console.log(`stdout: ${data}`)
      buffer += data.toString()
      while (buffer.includes('\n')) {
        const n = buffer.indexOf('\n')
        const message = buffer.substring(0, n)
        this.on_data(message)
        buffer = buffer.substring(n + 1)
      }
    })

    // some kind of "buffer" that the text in the error dialog does not get too long
    let errorLog = ''
    const ERROR_LOG_LENGTH = 800
    this.serverProcess.stderr.on('data', data => {
      log.error(`stderr: ${data}`.trimEnd())
      errorLog = (errorLog + data).slice(-ERROR_LOG_LENGTH)
    })

    this.serverProcess.on('close', (code, signal) => {
      if (code !== null) {
        log.debug(`child process close all stdio with code ${code}`)
      } else {
        log.debug(`child process close all stdio with signal ${signal}`)
      }
    })

    this.serverProcess.on('exit', (code, signal) => {
      if (code !== null) {
        log.debug(`child process exited with code ${code}`)
        if (code !== 0) {
          // IDEA attempt restart it automatically with backoff-Algorithm?
          log.critical('Fatal: The Delta Chat Core exited unexpectedly', code)
          process.exit(1)
        }
      } else {
        log.debug(`child process exited with signal ${signal}`)
      }
    })
  }

  send(message: string) {
    this.serverProcess?.stdin.write(message + '\n')
  }
}

class MainTransport extends yerpc.BaseTransport {
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

export class JRPCDeltaChat extends BaseDeltaChat<MainTransport> {}

// Mostly copy-pasted from `target-electron/controller.ts`.
export async function startDeltaChat(): Promise<
  [dc: JRPCDeltaChat, wssDC: WebSocketServer, shutdownDC: () => void]
> {
  let active_connection: WebSocket | undefined

  const DCInstance = new StdioServer(response => {
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
    active_connection?.send(response)
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
          type JRPCDeltaChatWithPrivateExposed = {
            [P in keyof typeof mainProcessDC]: (typeof mainProcessDC)[P]
          } & {
            contextEmitters: (typeof mainProcessDC)['contextEmitters']
          }
          const jsonrpcRemote =
            mainProcessDC as unknown as JRPCDeltaChatWithPrivateExposed
          jsonrpcRemote.emit(result.event.kind, result.contextId, result.event)
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

          if (event.kind === 'WebxdcRealtimeData') {
            return
          }
          if (event.kind === 'Warning') {
            logCoreEvent.warn(contextId, event.msg)
          } else if (event.kind === 'Info') {
            logCoreEvent.info(contextId, event.msg)
          } else if (event.kind.startsWith('Error')) {
            logCoreEvent.error(contextId, event.msg)
          } else if (RCConfig['log-debug']) {
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
  })

  await DCInstance.start()

  const mainProcessTransport = new MainTransport(message => {
    message.id = `main-${message.id}`
    DCInstance.send(JSON.stringify(message))
  })

  const mainProcessDC = new JRPCDeltaChat(
    mainProcessTransport,
    // Do NOT start calling `rpc.getNextEvent`.
    // Because there can be only one consumer of
    // `get_next_event`, and that is the renderer process's JSON-RPC client.
    false
  )

  const StolenConnectionPacket = JSON.stringify({
    jsonrpc: '2.0',
    method: 'error_other_client_stole_dc_connection',
  })

  const wssDC = new WebSocketServer({ noServer: true, perMessageDeflate: true })
  wssDC.on('connection', function connection(ws) {
    // eslint-disable-next-line no-console
    ws.on('error', console.error)

    if (active_connection) {
      active_connection?.send(StolenConnectionPacket)
    }
    active_connection = ws

    ws.on('message', raw_data => {
      if (active_connection === ws) {
        const stringData = raw_data.toString('utf-8')
        if (stringData.indexOf('export') !== -1) {
          // modify backup export location
          const request = JSON.parse(stringData)
          if (
            (request.method === 'export_backup' ||
              request.method === 'export_self_keys') &&
            request.params[1] === '<BROWSER>'
          ) {
            request.params[1] = join(DC_ACCOUNTS_DIR, 'backups')
            return DCInstance.send(JSON.stringify(request))
          }
        }
        DCInstance.send(stringData)
      } else {
        log.debug(
          'ignored dc jsonrpc request because client is not the active one anymore'
        )
        ws.send(StolenConnectionPacket)
      }
    })
    // custom dc connection like on electron

    log.debug('connected dc socket')
  })

  return [
    mainProcessDC,
    wssDC,
    () => {
      DCInstance.serverProcess?.kill(2)
    },
  ]
}
