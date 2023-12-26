import moment from 'moment'

import { getLogger } from '../../../shared/logger'
import { runtime } from '../../runtime'
import {
  forwardMessage,
  deleteMessage,
  selectChat,
} from '../helpers/ChatMethods'
import { BackendRemote, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { internalOpenWebxdc } from '../../system-integration/webxdc'
import ForwardMessage from '../dialogs/ForwardMessage'
import ConfirmationDialog from '../dialogs/ConfirmationDialog'
import MessageDetail from '../dialogs/MessageDetail'

import type { OpenDialog } from '../../contexts/DialogContext'

const log = getLogger('render/msgFunctions')

/**
 * json representation of the message object we get from the backend
 */
export function onDownload(msg: Type.Message) {
  if (!msg.file) {
    log.error('message has no file to download:', msg)
    throw new Error('message has no file to download')
  } else if (!msg.fileName) {
    log.error('message has no filename to download:', msg)
    throw new Error('message has no file name to download')
  } else {
    runtime.downloadFile(msg.file, msg.fileName)
  }
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

export function openForwardDialog(
  openDialog: OpenDialog,
  messages: Type.Message | number[],
  onForward?: () => void
) {
  openDialog(ForwardMessage, { messages, onForward })
}

export function confirmDialog(
  openDialog: OpenDialog,
  message: string,
  confirmLabel: string,
  isConfirmDanger = false
): Promise<boolean> {
  return new Promise((res, _rej) => {
    openDialog(ConfirmationDialog, {
      message,
      confirmLabel,
      isConfirmDanger,
      cb: (yes: boolean) => {
        res(yes)
      },
    })
  })
}

export async function confirmForwardMessage(
  openDialog: OpenDialog,
  accountId: number,
  messages: Type.Message | number[],
  chat: Type.FullChat
) {
  const tx = window.static_translate
  const yes = await confirmDialog(
    openDialog,
    tx('ask_forward', [chat.name]),
    tx('forward')
  )
  const isMany = Array.isArray(messages)
  if (yes) {
    if (isMany) {
      for (let messageId of messages)
        await forwardMessage(accountId, messageId, chat.id)
    } else {
      await forwardMessage(accountId, messages.id, chat.id)
    }
  }
  return yes
}

export function confirmDeleteMessage(
  openDialog: OpenDialog,
  messages: Type.Message | number[],
  onDelete?: () => void
) {
  const tx = window.static_translate

  openDialog(ConfirmationDialog, {
    message: tx('ask_delete_message'),
    confirmLabel: tx('delete'),
    cb: (yes: boolean) => {
      if (yes) {
        const isMany = Array.isArray(messages)
        if (isMany) {
          for (let messageId of messages) {
            deleteMessage(messageId)
          }
        } else {
          deleteMessage(messages.id)
        }
        onDelete && onDelete()
      }
    }
  })
}

export function openMessageInfo(openDialog: OpenDialog, message: Type.Message) {
  openDialog(MessageDetail, { id: message.id })
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
  const chatId = await BackendRemote.rpc.createChatByContactId(
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
    quotedMessageId,
    'Text'
  )

  // select chat
  selectChat(chatId)
}

export async function openMessageHTML(messageId: number) {
  const accountId = selectedAccountId()
  const content = await BackendRemote.rpc.getMessageHtml(accountId, messageId)
  if (!content) {
    log.error('openMessageHTML, message has no html content', { messageId })
    return
  }
  const {
    sender: { displayName },
    subject,
    chatId,
    receivedTimestamp,
  } = await BackendRemote.rpc.getMessage(accountId, messageId)
  const receiveTime = moment(receivedTimestamp * 1000).format('LLLL')
  const { isContactRequest, isProtectionBroken } =
    await BackendRemote.rpc.getBasicChatInfo(accountId, chatId)
  runtime.openMessageHTML(
    `${accountId}.${messageId}`,
    accountId,
    isContactRequest || isProtectionBroken,
    subject,
    displayName,
    receiveTime,
    content
  )
}

export async function downloadFullMessage(messageId: number) {
  await BackendRemote.rpc.downloadFullMessage(selectedAccountId(), messageId)
}

export async function openWebxdc(messageId: number) {
  const accountId = selectedAccountId()
  internalOpenWebxdc(accountId, messageId)
}
