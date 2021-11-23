import { getLogger } from '../../../shared/logger'
const log = getLogger('render/msgFunctions')
import type { Message } from 'deltachat-node'
import { MessageType, JsonMessage } from '../../../shared/shared-types'
import { DeltaBackend } from '../../delta-remote'
import { runtime } from '../../runtime'
import { deleteMessage, selectChat } from '../helpers/ChatMethods'
/**
 * json representation of the message object we get from the backend
 */
type MsgObject = ReturnType<typeof Message.prototype.toJson>

export function onDownload(msg: MsgObject) {
  runtime.downloadFile(msg.file)
}

export function openAttachmentInShell(msg: MsgObject) {
  if (!runtime.openPath(msg.file)) {
    log.info(
      "file couldn't be opened, try saving it in a different place and try to open it from there"
    )
  }
}

export function forwardMessage(message: MessageType) {
  window.__openDialog('ForwardMessage', { message })
}

export function confirmDeleteMessage(msg: MsgObject) {
  const tx = window.static_translate
  window.__openDialog('ConfirmationDialog', {
    message: tx('ask_delete_message'),
    confirmLabel: tx('delete'),
    cb: (yes: boolean) => yes && deleteMessage(msg.id),
  })
}

export function openMessageInfo(message: MessageType) {
  window.__openDialog('MessageDetail', { id: message.id })
}

export function setQuoteInDraft(messageId: number) {
  if (window.__setQuoteInDraft) {
    window.__setQuoteInDraft(messageId)
  } else {
    throw new Error('window.__setQuoteInDraft undefined')
  }
}

export async function privateReply(msg: JsonMessage) {
  const quotedMessageId = msg.id
  const contactId = msg.fromId
  const chatId = await DeltaBackend.call(
    'contacts.createChatByContactId',
    contactId
  )

  // retrieve existing draft to append the quotedMessageId
  const oldDraft = await DeltaBackend.call('messageList.getDraft', chatId)

  await DeltaBackend.call('messageList.setDraft', chatId, {
    text: oldDraft?.text,
    file: oldDraft?.file,
    quotedMessageId,
  })

  // select chat
  selectChat(chatId)
}

export async function openMessageHTML(messageId: number) {
  const filepath = await DeltaBackend.call(
    'messageList.saveMessageHTML2Disk',
    messageId
  )
  runtime.openPath(filepath)
}
