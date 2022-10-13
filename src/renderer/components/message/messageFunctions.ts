import { getLogger } from '../../../shared/logger'
const log = getLogger('render/msgFunctions')
import { DeltaBackend } from '../../delta-remote'
import { runtime } from '../../runtime'
import { deleteMessage, selectChat } from '../helpers/ChatMethods'
import { BackendRemote, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { internalOpenWebxdc } from '../../system-integration/webxdc'
/**
 * json representation of the message object we get from the backend
 */

export function onDownload(msg: Type.Message) {
  if (!msg.file) {
    log.error('message has no file to download:', msg)
    throw new Error('message has no file to download')
  }
  msg.file && runtime.downloadFile(msg.file)
}

export function openAttachmentInShell(msg: Type.Message) {
  if (!msg.file) {
    log.error('message has no file to open:', msg)
    throw new Error('message has no file to open')
  }
  if (!runtime.openPath(msg.file)) {
    log.info(
      "file couldn't be opened, try saving it in a different place and try to open it from there"
    )
  }
}

export function forwardMessage(message: Type.Message) {
  window.__openDialog('ForwardMessage', { message })
}

export function confirmDeleteMessage(msg: Type.Message) {
  const tx = window.static_translate
  window.__openDialog('ConfirmationDialog', {
    message: tx('ask_delete_message'),
    confirmLabel: tx('delete'),
    cb: (yes: boolean) => yes && deleteMessage(msg.id),
  })
}

export function openMessageInfo(message: Type.Message) {
  window.__openDialog('MessageDetail', { id: message.id })
}

export function setQuoteInDraft(messageId: number) {
  if (window.__setQuoteInDraft) {
    window.__setQuoteInDraft(messageId)
  } else {
    throw new Error('window.__setQuoteInDraft undefined')
  }
}

export async function privateReply(msg: Type.Message) {
  const quotedMessageId = msg.id
  const contactId = msg.fromId
  const accountId = selectedAccountId()
  const chatId = await BackendRemote.rpc.contactsCreateChatByContactId(
    accountId,
    contactId
  )

  // retrieve existing draft to append the quotedMessageId
  const oldDraft = await BackendRemote.rpc.getDraft(accountId, chatId)

  await BackendRemote.rpc.miscSetDraft(
    accountId,
    chatId,
    oldDraft?.text || null,
    oldDraft?.file || null,
    quotedMessageId
  )

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

export async function downloadFullMessage(messageId: number) {
  await DeltaBackend.call('messageList.downloadFullMessage', messageId)
}

export async function openWebxdc(messageId: number) {
  const accountId = selectedAccountId()
  internalOpenWebxdc(accountId, messageId)
}
