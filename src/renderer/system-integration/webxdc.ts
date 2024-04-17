// webxdc could be seen as system integration,
// because it opens new "independent" windows
// and heavily uses the events

import { BackendRemote } from '../apiService'
import { RuntimeService } from '../runtime/runtimeService'

export function initWebxdc() {
  BackendRemote.on('WebxdcStatusUpdate', (accountId, { msgId }) => {
    RuntimeService.notifyWebxdcStatusUpdate(accountId, msgId)
  })
  BackendRemote.on('MsgsChanged', (accountId, { msgId }) => {
    RuntimeService.notifyWebxdcMessageChanged(accountId, msgId)
  })
  BackendRemote.on('WebxdcInstanceDeleted', (accountId, { msgId }) => {
    RuntimeService.notifyWebxdcInstanceDeleted(accountId, msgId)
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
  const { addr, displayname } = await BackendRemote.rpc.batchGetConfig(
    accountId,
    ['addr', 'displayname']
  )
  RuntimeService.openWebxdc(messageId, {
    accountId,
    addr,
    displayname,
    chatName,
    webxdcInfo: message.webxdcInfo,
  })
}
