import { BaseDeltaChat, DcEvent } from '@deltachat/jsonrpc-client'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { clearNotificationsForChat } from './system-integration/notifications'
import { countCall } from './debug-tools'

export { T as Type } from '@deltachat/jsonrpc-client'

export const BackendRemote: BaseDeltaChat<any> =
  runtime.createDeltaChatConnection(countCall)

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

  // TODO make a core events for these chatlist events instead of faking them in desktop
  export async function acceptChat(account_id: number, chatId: number) {
    await BackendRemote.rpc.acceptChat(account_id, chatId)
    window.__refetchChatlist && window.__refetchChatlist()
  }

  export async function blockChat(accountId: number, chatId: number) {
    await BackendRemote.rpc.blockChat(accountId, chatId)
    clearNotificationsForChat(accountId, chatId)
  }

  export async function deleteChat(accountId: number, chatId: number) {
    await BackendRemote.rpc.deleteChat(accountId, chatId)
    clearNotificationsForChat(accountId, chatId)
  }

  export async function marknoticedChat(accountId: number, chatId: number) {
    await BackendRemote.rpc.marknoticedChat(accountId, chatId)
    clearNotificationsForChat(accountId, chatId)
  }
}

type ContextEvents = { ALL: (event: DcEvent) => void } & {
  [Property in DcEvent['kind']]: (
    event: Extract<DcEvent, { kind: Property }>
  ) => void
}

/** For use in react useEffect hooks, already returns the cleanup function
 *
 * ```
 * // one event
 * useEffect(onDCEvent(accountId, 'Info', () => {}), [])
 * // multiple events
 * useEffect(() => {
 *   const cleanup = [
 *     onDCEvent(accountId, 'Info', () => {}),
 *     onDCEvent(accountId, 'IncomingMsg', () => {}),
 *     onDCEvent(accountId, 'ContactsChanged', () => {})
 *   ]
 *   return () => cleanup.forEach(off => off())
 * }, [])
 * ```
 */
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
