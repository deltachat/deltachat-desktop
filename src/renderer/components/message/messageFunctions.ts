const { openItem } = window.electron_functions

import { getLogger } from '../../../shared/logger'
const log = getLogger('render/msgFunctions')
import { Message } from 'deltachat-node'
import { DeltaBackend } from '../../delta-remote'
import { ActionEmitter, KeybindAction } from '../../keybindings'
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

type sendMessageArguments = {
  text: string
  filename?: string
  location?: {
    lat: number
    lng: number
  }
}

export async function UI_SendMessage(
  chatId: number,
  { text, filename, location }: sendMessageArguments
) {
  await DeltaBackend.call(
    'messageList.sendMessage',
    chatId,
    text,
    filename,
    location
  )

  ActionEmitter.emitAction(KeybindAction.ChatView_RefreshMessageList)
  ActionEmitter.emitAction(KeybindAction.ChatView_ScrollToBottom)
}

export async function UI_DeleteMessage(messageId: number) {
  await DeltaBackend.call('messageList.deleteMessage', messageId)
  ActionEmitter.emitAction(KeybindAction.ChatView_RefreshMessageList)
}
