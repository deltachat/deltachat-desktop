import { DeltaBackend } from '../../delta-remote'
import chatStore from '../../stores/chat'
import { ScreenContext, unwrapContext } from '../../contexts'
import { ChatListItemType, FullChat } from '../../../shared/shared-types'
import { MuteDuration } from '../../../shared/constants'
import { C } from 'deltachat-node/dist/constants'
import { runtime } from '../../runtime'
import { getLogger } from '../../../shared/logger'
import AlertDialog from '../dialogs/AlertDialog'

const log = getLogger('renderer/message')

type Chat = ChatListItemType | FullChat

const unselectChat = () => {
  chatStore.dispatch({ type: 'UI_UNSELECT_CHAT' })
}

export async function setChatVisibility(
  chatId: number,
  visibility:
    | C.DC_CHAT_VISIBILITY_NORMAL
    | C.DC_CHAT_VISIBILITY_ARCHIVED
    | C.DC_CHAT_VISIBILITY_PINNED,
  shouldUnselectChat = false
) {
  await DeltaBackend.call('chat.setVisibility', chatId, visibility)
  if (shouldUnselectChat) unselectChat()
}

export function openLeaveChatDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  chatId: number
) {
  const tx = window.static_translate
  screenContext.openDialog('ConfirmationDialog', {
    message: tx('ask_leave_group'),
    confirmLabel: tx('menu_leave_group'),
    isConfirmDanger: true,
    noMargin: true,
    cb: (yes: boolean) => yes && DeltaBackend.call('chat.leaveGroup', chatId),
  })
}

export function openDeleteChatDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  chat: Chat,
  selectedChatId: number
) {
  const tx = window.static_translate
  screenContext.openDialog('ConfirmationDialog', {
    message: tx('ask_delete_named_chat', chat.name),
    confirmLabel: tx('delete'),
    isConfirmDanger: true,
    cb: (yes: boolean) =>
      yes &&
      DeltaBackend.call('chat.delete', chat.id).then(() => {
        if (selectedChatId === chat.id) {
          unselectChat()
        }
      }),
  })
}

export function openBlockContactDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  selectedChat: Chat
) {
  const tx = window.static_translate
  if (selectedChat && selectedChat.contactIds.length) {
    screenContext.openDialog('ConfirmationDialog', {
      message: tx('ask_block_contact'),
      confirmLabel: tx('menu_block_contact'),
      isConfirmDanger: true,
      cb: (yes: boolean) =>
        yes &&
        DeltaBackend.call(
          'contacts.blockContact',
          selectedChat.contactIds[0]
        ).then(unselectChat),
    })
  }
}

export function openEncryptionInfoDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  chatListItem: ChatListItemType
) {
  screenContext.openDialog('EncryptionInfo', { chatListItem })
}

export function openEditGroupDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  selectedChat: FullChat
) {
  screenContext.openDialog('EditGroup', { chat: selectedChat })
}

export async function openViewProfileDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  contact_id: number
) {
  screenContext.openDialog('ViewProfile', {
    contact: await DeltaBackend.call('contacts.getContact', contact_id),
  })
}

export async function openMuteChatDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  chatId: number
) {
  // todo open dialog to ask for duration
  screenContext.openDialog('MuteChat', { chatId })
}

export async function unMuteChat(chatId: number) {
  await DeltaBackend.call('chat.setMuteDuration', chatId, MuteDuration.OFF)
}

export async function sendCallInvitation(
  screenContext: unwrapContext<typeof ScreenContext>,
  chatId: number
) {
  try {
    const messageId = await DeltaBackend.call(
      'chat.sendVideoChatInvitation',
      chatId
    )
    await joinCall(screenContext, messageId)
  } catch (error) {
    log.error('failed send call invitation', error)
    screenContext.openDialog(AlertDialog, { message: error.toString() })
  }
}

export async function joinCall(
  screenContext: unwrapContext<typeof ScreenContext>,
  messageId: number
) {
  try {
    const message = await DeltaBackend.call('messageList.getMessage', messageId)

    if (message.msg.viewType !== C.DC_MSG_VIDEOCHAT_INVITATION) {
      throw new Error('Message is not a video chat invitation')
    }

    return runtime.openLink(message.msg.videochatUrl)
  } catch (error) {
    log.error('failed to join call', error)
    screenContext.openDialog(AlertDialog, { message: error.toString() })
  }
}
