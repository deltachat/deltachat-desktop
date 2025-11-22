import moment from 'moment'

import { getLogger } from '../../../../shared/logger'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { BackendRemote, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { internalOpenWebxdc } from '../../system-integration/webxdc'
import ForwardMessage from '../dialogs/ForwardMessage'
import ConfirmationDialog from '../dialogs/ConfirmationDialog'
import MessageDetail from '../dialogs/MessageDetail/MessageDetail'

import type { OpenDialog } from '../../contexts/DialogContext'
import { C, T } from '@deltachat/jsonrpc-client'
import ConfirmDeleteMessageDialog from '../dialogs/ConfirmDeleteMessage'

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

export async function openAttachmentInShell(msg: Type.Message) {
  if (!msg.file || !msg.fileName) {
    log.error('message has no file to open:', msg)
    throw new Error('message has no file to open')
  }
  const tmpFile = await runtime.copyFileToInternalTmpDir(msg.fileName, msg.file)
  if (!runtime.openPath(tmpFile)) {
    log.info(
      "file couldn't be opened, try saving it in a different place and try to open it from there"
    )
  }
}

export function openForwardDialog(
  openDialog: OpenDialog,
  message: Type.Message
) {
  openDialog(ForwardMessage, { message })
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
  message: Type.Message,
  chat: Pick<Type.BasicChat, 'name' | 'id'>
) {
  const tx = window.static_translate
  const yes = await confirmDialog(
    openDialog,
    tx('ask_forward', [chat.name]),
    tx('forward')
  )
  if (yes) {
    await BackendRemote.rpc.forwardMessages(accountId, [message.id], chat.id)
  }
  return yes
}

export function confirmDeleteMessage(
  openDialog: OpenDialog,
  accountId: number,
  msg: Type.Message,
  chat: Type.FullChat
) {
  openDialog(ConfirmDeleteMessageDialog, {
    accountId,
    msg,
    chat,
  })
}

export function openMessageInfo(openDialog: OpenDialog, message: Type.Message) {
  openDialog(MessageDetail, { id: message.id })
}

/**
 * @param messageOrMessageId prefer to pass the full message
 * insitead of the message ID, for better performance.
 */
export function setQuoteInDraft(
  messageOrMessageId: Parameters<
    Exclude<typeof window.__setQuoteInDraft, null>
  >[0]
) {
  if (window.__setQuoteInDraft) {
    window.__setQuoteInDraft(messageOrMessageId)
  } else {
    throw new Error('window.__setQuoteInDraft undefined')
  }
}
/**
 * @throws if the composer is not rendered.
 */
export function enterEditMessageMode(messageToEdit: T.Message) {
  if (window.__enterEditMessageMode) {
    window.__enterEditMessageMode(messageToEdit)
  } else {
    throw new Error('window.__enterEditMessageMode undefined')
  }
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
  const { isContactRequest } = await BackendRemote.rpc.getBasicChatInfo(
    accountId,
    chatId
  )
  runtime.openMessageHTML(
    accountId,
    messageId,
    isContactRequest,
    subject,
    displayName,
    receiveTime,
    content
  )
}

export async function downloadFullMessage(messageId: number) {
  await BackendRemote.rpc.downloadFullMessage(selectedAccountId(), messageId)
}

export async function openWebxdc(
  message: Type.Message,
  webxdcInfo?: T.WebxdcMessageInfo
) {
  const accountId = selectedAccountId()
  internalOpenWebxdc(accountId, message, webxdcInfo)
}

export function isMessageEditable(
  message: T.Message,
  chat: T.FullChat
): boolean {
  return (
    message.fromId === C.DC_CONTACT_ID_SELF &&
    chat.isEncrypted &&
    message.text !== '' &&
    chat.canSend &&
    !message.isInfo &&
    !message.hasHtml &&
    message.viewType !== 'Call'
  )
}
