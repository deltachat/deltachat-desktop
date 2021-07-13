import { getLogger } from '../../../shared/logger'
const log = getLogger('render/msgFunctions')
import { Message } from '../../../shared/shared-types'
import { ChatStoreDispatch } from '../../stores/chat'
import { DeltaBackend } from '../../delta-remote'
import { runtime } from '../../runtime'
import { deleteMessage, selectChat } from '../helpers/ChatMethods'

export function onDownload(message: Message) {
  runtime.downloadFile(message.file)
}

export function openAttachmentInShell(message: Message) {
  if (!runtime.openPath(message.file)) {
    log.info(
      "file couldn't be opened, try saving it in a different place and try to open it from there"
    )
  }
}

export function forwardMessage(message: Message) {
  window.__openDialog('ForwardMessage', { message })
}

export function deleteMessageWithConfirm(
  message: Message,
  _chatStoreDispatch: ChatStoreDispatch
) {
  const tx = window.static_translate
  window.__openDialog('ConfirmationDialog', {
    message: tx('ask_delete_message'),
    confirmLabel: tx('delete'),
    cb: (yes: boolean) => yes && deleteMessage(message.id),
  })
}

export function openMessageInfo(message: Message) {
  window.__openDialog('MessageDetail', { id: message.id })
}

export function setQuoteInDraft(messageId: number) {
  if (window.__setQuoteInDraft) {
    window.__setQuoteInDraft(messageId)
  } else {
    throw new Error('window.__setQuoteInDraft undefined')
  }
}

export async function privateReply(message: Message) {
  const quotedMessageId = message.id
  const contactId = message.fromId
  const chatId = await DeltaBackend.call('contacts.getDMChatId', contactId) // getDMChatId creates the dm chat if it doesn't exist

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
