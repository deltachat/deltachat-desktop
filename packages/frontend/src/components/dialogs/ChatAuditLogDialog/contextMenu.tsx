import { C, T } from '@deltachat/jsonrpc-client'

import {
  openMessageInfo,
  setQuoteInDraft,
} from '../../message/messageFunctions'

import type { DialogProps, OpenDialog } from '../../../contexts/DialogContext'
import type { JumpToMessage } from '../../../hooks/chat/useMessage'
import type { PrivateReply } from '../../../hooks/chat/usePrivateReply'

export function buildContextMenu(
  jumpToMessage: JumpToMessage,
  openDialog: OpenDialog,
  privateReply: PrivateReply,
  accountId: number,
  message: T.Message,
  isGroup: boolean,
  closeDialogCallback: DialogProps['onClose']
) {
  const tx = window.static_translate // don't use the i18n context here for now as this component is inefficient (rendered one menu for every message)
  const isInfoOrCallInvitation =
    message.isInfo || message.viewType === 'VideochatInvitation'
  return [
    // Show in Chat
    {
      label: tx('show_in_chat'),
      action: () => {
        closeDialogCallback()
        setTimeout(() =>
          jumpToMessage({
            accountId,
            msgId: message.id,
            msgChatId: message.chatId,
            highlight: true,
            focus: true,
            scrollIntoViewArg: { block: 'center' },
          })
        )
      },
    },
    // Show Webxdc in Chat
    message.systemMessageType == 'WebxdcInfoMessage' && {
      label: tx('show_app_in_chat'),
      action: () => {
        if (message.parentId) {
          closeDialogCallback()
          jumpToMessage({
            accountId,
            msgId: message.parentId,
            // Currently the info message is always in the same chat
            // as the message with `message.parentId`,
            // but let's not pass `chatId` here, for future-proofing.
            msgChatId: undefined,
            highlight: true,
            focus: true,
            scrollIntoViewArg: { block: 'center' },
          })
        }
      },
    },
    // Reply
    // TODO also check `chat.canSend`, as with `showReply` in `Message.tsx`,
    // and double-check other items.
    !isInfoOrCallInvitation && {
      label: tx('reply_noun'),
      action: () => {
        setQuoteInDraft(message.id)
        closeDialogCallback()
      },
    },
    // Reply privately -> only show in groups, don't show on info messages or outgoing messages
    isGroup &&
      !isInfoOrCallInvitation &&
      message.fromId > C.DC_CONTACT_ID_LAST_SPECIAL && {
        label: tx('reply_privately'),
        action: () => {
          privateReply(accountId, message)
          closeDialogCallback()
        },
      },
    // Copy to clipboard
    {
      label: tx('global_menu_edit_copy_desktop'),
      action: () => {
        navigator.clipboard.writeText(message.text || '')
      },
    },
    // Message Info
    {
      label: tx('info'),
      action: openMessageInfo.bind(null, openDialog, message),
    },
  ]
}
