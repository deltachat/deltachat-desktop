import {
  BaseDeltaChat,
  yerpc,
} from 'deltachat-node/deltachat-jsonrpc/typescript/src/lib'
import { Message } from 'deltachat-node/deltachat-jsonrpc/typescript/generated/jsonrpc'
import { DeltaBackend } from './delta-remote'
import { runtime } from './runtime'
import { getLogger } from '../shared/logger'

export * as Type from 'deltachat-node/deltachat-jsonrpc/typescript/generated/types'

const { BaseTransport } = yerpc
const log = getLogger('renderer/jsonrpc')

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
    log.debug('sent: ', message)
  }
}

class ElectronDeltachat extends BaseDeltaChat<ElectronTransport> {
  close() {
    /** noop */
  }
  constructor() {
    super(new ElectronTransport())
  }
}

export const BackendRemote: BaseDeltaChat<any> = new ElectronDeltachat()

/** Functions with side-effects */
export namespace EffectfulBackendActions {
  export async function removeAccount(account_id: number) {
    // unselect the account in the UI if its selected
    if (window.__selectedAccountId === account_id) {
      throw new Error(
        'Can not remove the selected account, please unselect it first'
      )
    }

    // remove the account
    await BackendRemote.rpc.removeAccount(account_id)

    // if sucessfull remove webxdc data
    runtime.deleteWebxdcAccountData(account_id)
  }

  export async function logout() {
    if (window.__selectedAccountId === undefined) {
      throw new Error('no account selected')
    }

    runtime.closeAllWebxdcInstances()

    // for now we still need to call the backend function,
    // because backend still has sleected account
    await DeltaBackend.call('login.logout')
    ;(window.__selectedAccountId as any) = undefined
  }
}
