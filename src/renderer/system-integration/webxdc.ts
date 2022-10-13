// webxdc could be seen as system integration,
// because it opens new "independent" windows
// and heavyly uses the events

import { BackendRemote } from '../backend-com'
import { ipcBackend } from '../ipc'
import { runtime } from '../runtime'
import { selectedAccountId } from '../ScreenController'

export function initWebxdc() {
  ipcBackend.on('DC_EVENT_WEBXDC_STATUS_UPDATE', (_ev, [msgId]) => {
    runtime.notifyWebxdcStatusUpdate(selectedAccountId(), msgId)
  })
  ipcBackend.on('DC_EVENT_WEBXDC_INSTANCE_DELETED', (_ev, [msg_id]) => {
    runtime.notifyWebxdcInstanceDeleted(selectedAccountId(), msg_id)
  })
}

export async function internalOpenWebxdc(accountId: number, messageId: number) {
  const message = await BackendRemote.rpc.messageGetMessage(
    accountId,
    messageId
  )
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
