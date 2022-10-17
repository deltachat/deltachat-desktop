// webxdc could be seen as system integration,
// because it opens new "independent" windows
// and heavyly uses the events

import { BackendRemote } from '../backend-com'
import { runtime } from '../runtime'

export function initWebxdc() {
  BackendRemote.on('WebxdcStatusUpdate', (accountId, { msgId }) => {
    runtime.notifyWebxdcStatusUpdate(accountId, msgId)
  })
  BackendRemote.on('WebxdcInstanceDeleted', (accountId, { msgId }) => {
    runtime.notifyWebxdcInstanceDeleted(accountId, msgId)
  })
}

export async function internalOpenWebxdc(accountId: number, messageId: number) {
  const message = await BackendRemote.rpc.getMessage(accountId, messageId)
  if (!message.webxdcInfo) {
    throw new Error('no webxdc info for message ' + messageId)
  }
  const chatName = (
    await BackendRemote.rpc.getBasicChatInfo(accountId, message.chatId)
  ).name
  const {
    addr,
    displayname,
  } = await BackendRemote.rpc.batchGetConfig(accountId, ['addr', 'displayname'])
  runtime.openWebxdc(messageId, {
    accountId,
    addr,
    displayname,
    chatName,
    webxdcInfo: message.webxdcInfo,
  })
}
