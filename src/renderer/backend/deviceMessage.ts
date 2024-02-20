import { BackendRemote } from '../backend-com'

import type { T } from '@deltachat/jsonrpc-client'

export async function addDeviceMessage(
  accountId: number,
  label: string,
  messageData: Partial<T.MessageData> | null
) {
  if (messageData === null) {
    await BackendRemote.rpc.addDeviceMessage(accountId, label, null)
  } else {
    await BackendRemote.rpc.addDeviceMessage(accountId, label, {
      text: null,
      html: null,
      viewtype: null,
      file: null,
      location: null,
      overrideSenderName: null,
      quotedMessageId: null,
      ...messageData,
    })
  }
}
