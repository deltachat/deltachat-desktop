// webxdc could be seen as system integration,
// because it opens new "independent" windows
// and heavily uses the events

import { BackendRemote, Type } from '../backend-com'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { C, T } from '@deltachat/jsonrpc-client'
import { getLogger } from '@deltachat-desktop/shared/logger'

const log = getLogger('renderer/webxdc')

export function initWebxdc() {
  BackendRemote.on('WebxdcStatusUpdate', (accountId, { msgId }) => {
    runtime.notifyWebxdcStatusUpdate(accountId, msgId)
  })
  BackendRemote.on('WebxdcRealtimeData', (accountId, { msgId, data }) => {
    runtime.notifyWebxdcRealtimeData(accountId, msgId, data)
  })
  BackendRemote.on('MsgsChanged', (accountId, { msgId }) => {
    runtime.notifyWebxdcMessageChanged(accountId, msgId)
  })
  BackendRemote.on('WebxdcInstanceDeleted', (accountId, { msgId }) => {
    runtime.notifyWebxdcInstanceDeleted(accountId, msgId)
  })
  BackendRemote.on('ChatDeleted', accountId => {
    // This is only needed as long as chat deletion
    // still doesn't fire the 'WebxdcInstanceDeleted' event
    // for WebXDC instances inside the chat.
    // https://github.com/chatmail/core/issues/6670
    runtime.notifyWebxdcInstanceDeleted(accountId, null)
  })
}

/**
 * open a webxdc window or focus to an existing one
 * parameter "message" might be of viewType Webxdc or
 * systemMessageType WebxdcInfoMessage
 */
export async function internalOpenWebxdc(
  accountId: number,
  message: Type.Message,
  webxdcInfo?: T.WebxdcMessageInfo
) {
  let href = ''
  let messageId = message.id
  if (message.systemMessageType === 'WebxdcInfoMessage' && message.parentId) {
    href = message.webxdcHref ?? ''
    // if we have a webxdc info message, the webxdcInfo is attached to the parent message
    messageId = message.parentId
    message = await BackendRemote.rpc.getMessage(accountId, messageId)
  }
  if (!webxdcInfo) {
    webxdcInfo = await BackendRemote.rpc.getWebxdcInfo(accountId, messageId)
  }
  if (!webxdcInfo) {
    // we can open only messages with webxdc info
    throw new Error('no webxdc info for message ' + message)
  }
  const chatName = (
    await BackendRemote.rpc.getBasicChatInfo(accountId, message.chatId)
  ).name
  const account: Type.Account =
    await BackendRemote.rpc.getAccountInfo(accountId)
  const displayname =
    account.kind === 'Configured'
      ? account.displayName || window.static_translate('unnamed')
      : null

  runtime.openWebxdc(messageId, {
    accountId,
    displayname,
    chatName,
    webxdcInfo,
    href,
  })
}

/**
 * Opens the webxdc app referenced by a `dcwebxdc:` URI.
 *
 * These URIs can be triggered by any website or program, so this only opens
 * webxdc apps that the user could also open from a regular chat.
 *
 * @returns `false` if there is no such webxdc app
 */
export async function openWebxdcFromUri({
  accountId,
  msgId,
}: {
  accountId: number
  msgId: number
}): Promise<boolean> {
  try {
    const accountIds = await BackendRemote.rpc.getAllAccountIds()
    if (!accountIds.includes(accountId)) {
      log.warn('dcwebxdc: unknown account', { accountId, msgId })
      return false
    }
    const message = await BackendRemote.rpc.getMessage(accountId, msgId)
    if (
      message.viewType !== 'Webxdc' ||
      message.chatId <= C.DC_CHAT_ID_LAST_SPECIAL
    ) {
      log.warn('dcwebxdc: not a webxdc message', { accountId, msgId })
      return false
    }
    const chat = await BackendRemote.rpc.getBasicChatInfo(
      accountId,
      message.chatId
    )
    if (chat.isContactRequest) {
      log.warn('dcwebxdc: message is in a contact request', {
        accountId,
        msgId,
      })
      return false
    }
    await internalOpenWebxdc(accountId, message)
    return true
  } catch (error) {
    log.warn('dcwebxdc: failed to open webxdc', { accountId, msgId }, error)
    return false
  }
}

export async function openMapWebxdc(accountId: number, chatId?: number) {
  runtime.openMapsWebxdc(accountId, chatId)
}
