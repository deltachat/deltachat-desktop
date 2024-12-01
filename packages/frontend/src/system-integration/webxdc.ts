// webxdc could be seen as system integration,
// because it opens new "independent" windows
// and heavily uses the events

import { BackendRemote, Type } from '../backend-com'
import { runtime } from '@deltachat-desktop/runtime-interface'

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
}

/**
 * open a webxdc window or focus to an existing one
 * parameter "message" might be of viewType Webxdc or
 * systemMessageType WebxdcInfoMessage
 */
export async function internalOpenWebxdc(
  accountId: number,
  message: Type.Message
) {
  let href = ''
  let messageId = message.id
  if (message.systemMessageType === 'WebxdcInfoMessage' && message.parentId) {
    // if we have a webxdc info message, the webxdc app is attached to the parent message
    href = message.webxdcHref ?? ''
    messageId = message.parentId
  }
  if (!message.webxdcInfo) {
    // we can open only messages with webxdc info
    throw new Error('no webxdc info for message ' + message)
  }
  const chatName = (
    await BackendRemote.rpc.getBasicChatInfo(accountId, message.chatId)
  ).name
  const displayname = await BackendRemote.rpc.getConfig(
    accountId,
    'displayname'
  )

  runtime.openWebxdc(messageId, {
    accountId,
    displayname,
    chatName,
    webxdcInfo: message.webxdcInfo,
    href,
  })
}

export async function openMapWebxdc(accountId: number, chatId?: number) {
  runtime.openMapsWebxdc(accountId, chatId)
}
