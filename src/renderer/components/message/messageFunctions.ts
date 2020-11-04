const { openItem } = window.electron_functions

import { getLogger } from '../../../shared/logger'
const log = getLogger('render/msgFunctions')
import { Message } from 'deltachat-node'
import { MessageType } from '../../../shared/shared-types'
import { ChatStoreDispatch } from '../../stores/chat'
/**
 * json representation of the message object we get from the backend
 */
type MsgObject = ReturnType<typeof Message.prototype.toJson>

export function onDownload(msg: MsgObject) {
  window.preload_functions.downloadFile(msg.file)
}

export function openAttachmentInShell(msg: MsgObject) {
  if (!openItem(msg.file)) {
    log.info(
      "file couldn't be opened, try saving it in a different place and try to open it from there"
    )
  }
}

export function forwardMessage(message: MessageType) {
  window.__openDialog('ForwardMessage', { message })
}

export function deleteMessage(
  msg: MsgObject,
  chatStoreDispatch: ChatStoreDispatch
) {
  const tx = window.static_translate
  window.__openDialog('ConfirmationDialog', {
    message: tx('ask_delete_message_desktop'),
    confirmLabel: tx('delete'),
    cb: (yes: boolean) =>
      yes && chatStoreDispatch({ type: 'UI_DELETE_MESSAGE', payload: msg.id }),
  })
}

export function openMessageInfo(message: MessageType) {
  window.__openDialog('MessageDetail', { id: message.id })
}
