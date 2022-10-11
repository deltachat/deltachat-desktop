import { BaseDeltaChat, yerpc, RPC } from '@deltachat/jsonrpc-client'
import { DeltaBackend } from './delta-remote'
import { runtime } from './runtime'
import { getLogger } from '../shared/logger'
import { debouncedUpdateBadgeCounter } from './system-integration/badge-counter'
import { clearNotificationsForChat } from './system-integration/notifications'

export { T as Type } from '@deltachat/jsonrpc-client'

const { BaseTransport } = yerpc
const log = getLogger('renderer/jsonrpc')

class ElectronTransport extends BaseTransport {
  constructor() {
    super()
    window.electron_functions.ipcRenderer.on(
      'json-rpc-message',
      (_ev, response) => {
        const message: RPC.Message = JSON.parse(response)
        log.debug('received: ', message)
        this._onmessage(message)
      }
    )
  }
  _send(message: RPC.Message): void {
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
    debouncedUpdateBadgeCounter()

    if (!(await runtime.getDesktopSettings()).syncAllAccounts) {
      await BackendRemote.rpc.stopIo(window.__selectedAccountId)
    }

    runtime.setDesktopSetting('lastAccount', undefined)

    // for now we still need to call the backend function,
    // because backend still has selected account
    await DeltaBackend.call('login.logout')
    ;(window.__selectedAccountId as any) = undefined
  }

  // TODO make a core events for these chatlist events instead of faking them in desktop
  export async function acceptChat(account_id: number, chatId: number) {
    await BackendRemote.rpc.acceptChat(account_id, chatId)
    window.__refetchChatlist && window.__refetchChatlist()
  }

  export async function blockChat(account_id: number, chatId: number) {
    await BackendRemote.rpc.acceptChat(account_id, chatId)
    window.__refetchChatlist && window.__refetchChatlist()
  }

  export async function deleteChat(accountId: number, chatId: number) {
    await BackendRemote.rpc.deleteChat(accountId, chatId)
    clearNotificationsForChat(accountId, chatId)
    window.__refetchChatlist && window.__refetchChatlist()
  }
}
