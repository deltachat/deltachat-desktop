import { BaseDeltaChat, yerpc, RPC, DcEvent } from '@deltachat/jsonrpc-client'
import { runtime } from './runtime'
import { hasDebugEnabled } from '../shared/logger'
import { debouncedUpdateBadgeCounter } from './system-integration/badge-counter'
import { clearNotificationsForChat } from './system-integration/notifications'
import { countCall } from './debug-tools'
import SettingsStoreInstance from './stores/settings'
import chatStore from './stores/chat'

export { T as Type } from '@deltachat/jsonrpc-client'

const { BaseTransport } = yerpc

class ElectronTransport extends BaseTransport {
  constructor() {
    super()
    window.electron_functions.ipcRenderer.on(
      'json-rpc-message',
      (_ev: any, response: any) => {
        const message: RPC.Message = JSON.parse(response)
        if (hasDebugEnabled()) {
          /* ignore-console-log */
          console.debug('%c▼ %c[JSONRPC]', 'color: red', 'color:grey', message)
        }
        this._onmessage(message)
      }
    )
  }
  _send(message: RPC.Message): void {
    const serialized = JSON.stringify(message)
    window.electron_functions.ipcRenderer.invoke('json-rpc-request', serialized)
    if (hasDebugEnabled()) {
      /* ignore-console-log */
      console.debug('%c▲ %c[JSONRPC]', 'color: green', 'color:grey', message)
      if ((message as any)['method']) {
        countCall((message as any).method)
        countCall('total')
      }
    }
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

    // if successful remove webxdc data
    runtime.deleteWebxdcAccountData(account_id)
  }

  export async function logout() {
    if (window.__selectedAccountId === undefined) {
      throw new Error('no account selected')
    }
    // clear stores - these do react updates so call them first
    chatStore.reducer.unselectChat()
    SettingsStoreInstance.effect.clear()

    runtime.closeAllWebxdcInstances()
    debouncedUpdateBadgeCounter()

    if (!(await runtime.getDesktopSettings()).syncAllAccounts) {
      await BackendRemote.rpc.stopIo(window.__selectedAccountId)
    }

    runtime.setDesktopSetting('lastAccount', undefined)
    ;(window.__selectedAccountId as any) = undefined
  }

  // TODO make a core events for these chatlist events instead of faking them in desktop
  export async function acceptChat(account_id: number, chatId: number) {
    await BackendRemote.rpc.acceptChat(account_id, chatId)
    window.__refetchChatlist && window.__refetchChatlist()
  }

  export async function blockChat(account_id: number, chatId: number) {
    await BackendRemote.rpc.blockChat(account_id, chatId)
    window.__refetchChatlist && window.__refetchChatlist()
  }

  export async function deleteChat(accountId: number, chatId: number) {
    await BackendRemote.rpc.deleteChat(accountId, chatId)
    clearNotificationsForChat(accountId, chatId)
    window.__refetchChatlist && window.__refetchChatlist()
  }

  export async function blockContact(accountId: number, contactId: number) {
    await BackendRemote.rpc.blockContact(accountId, contactId)
    window.__refetchChatlist && window.__refetchChatlist()
  }

  export async function unBlockContact(accountId: number, contactId: number) {
    await BackendRemote.rpc.unblockContact(accountId, contactId)
    window.__refetchChatlist && window.__refetchChatlist()
  }
}

type ContextEvents = { ALL: (event: DcEvent) => void } & {
  [Property in DcEvent['type']]: (
    event: Extract<DcEvent, { type: Property }>
  ) => void
}

export function onDCEvent<variant extends keyof ContextEvents>(
  accountId: number,
  eventType: variant,
  callback: ContextEvents[variant]
) {
  const emitter = BackendRemote.getContextEvents(accountId)
  emitter.on(eventType, callback)
  return () => {
    emitter.off(eventType, callback)
  }
}
