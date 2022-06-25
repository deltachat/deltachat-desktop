import {
  BaseDeltachat,
  yerpc,
} from 'deltachat-node/deltachat-jsonrpc/typescript'
import { Message } from 'deltachat-node/deltachat-jsonrpc/typescript/dist/generated/jsonrpc'
// import { getLogger } from '../shared/logger'

const { BaseTransport } = yerpc
// const log = getLogger('renderer/jsonrpc')

class ElectronTransport extends BaseTransport {
  constructor() {
    super()
    window.electron_functions.ipcRenderer.on(
      'json-rpc-message',
      (_ev, response) => {
        const message: Message = JSON.parse(response)
        //   log.debug("received: ", message)
        this._onmessage(message)
      }
    )
  }
  _send(message: Message): void {
    const serialized = JSON.stringify(message)
    window.electron_functions.ipcRenderer.invoke('json-rpc-request', serialized)
    //   log.debug("sent: ", message)
  }
}

class ElectronDeltachat extends BaseDeltachat<ElectronTransport> {
  close() {
    /** noop */
  }
  constructor() {
    super(new ElectronTransport())
  }
}

export const BackendRemote: BaseDeltachat<any> = new ElectronDeltachat()
