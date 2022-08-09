import { DeltaBackend, sendMessageParams } from '../../delta-remote'
import ChatStore, { ChatView } from '../../stores/chat'
import { ScreenContext, unwrapContext } from '../../contexts'
import { FullChat } from '../../../shared/shared-types'
import { MuteDuration } from '../../../shared/constants'
import { C } from 'deltachat-node/node/dist/constants'
import { runtime } from '../../runtime'
import { getLogger } from '../../../shared/logger'
import AlertDialog from '../dialogs/AlertDialog'
import { Type } from '../../backend'

const log = getLogger('renderer/message')

type Chat = FullChat | (Type.ChatListItemFetchResult & { type: 'ChatListItem' })

export const selectChat = (chatId: number) => {
  ChatStore.effect.selectChat(chatId)
}

export const setChatView = (view: ChatView) => {
  ChatStore.effect.setView(view)
}

export const jumpToMessage = (
  msgId: number,
  highlight?: undefined | boolean
) => {
  ChatStore.effect.jumpToMessage(msgId, highlight)
}

export const unselectChat = () => {
  ChatStore.reducer.unselectChat()
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
      chat.id &&
      DeltaBackend.call('chat.delete', chat.id).then(() => {
        if (selectedChatId === chat.id) {
          unselectChat()
        }
      }),
  })
}

/**
 * used to block contacts based on a DM chat/chatlistentry with that contact
 */
export function openBlockFirstContactOfChatDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  selectedChat: Chat
) {
  const tx = window.static_translate
  const dmChatContact =
    (selectedChat as Type.ChatListItemFetchResult & { type: 'ChatListItem' })
      .dmChatContact || (selectedChat as FullChat)?.contactIds[0]

  // TODO: CHECK IF THE CHAT IS DM CHAT

  if (dmChatContact) {
    screenContext.openDialog('ConfirmationDialog', {
      message: tx('ask_block_contact'),
      confirmLabel: tx('menu_block_contact'),
      isConfirmDanger: true,
      cb: (yes: boolean) =>
        yes &&
        DeltaBackend.call('contacts.blockContact', dmChatContact).then(
          unselectChat
        ),
    })
  }
}

export function openEncryptionInfoDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  chatListItem: Type.ChatListItemFetchResult & { type: 'ChatListItem' }
) {
  screenContext.openDialog('EncryptionInfo', { chatListItem })
}

export function openViewGroupDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  selectedChat: FullChat
) {
  screenContext.openDialog('ViewGroup', { chat: selectedChat })
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
    ChatStore.effect.jumpToMessage(messageId, false)
    await joinCall(screenContext, messageId)
  } catch (error: todo) {
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

    if (!message) {
      throw new Error('Message not found')
    }

    if (message.viewType !== C.DC_MSG_VIDEOCHAT_INVITATION) {
      throw new Error('Message is not a video chat invitation')
    }

    return runtime.openLink(message.videochatUrl)
  } catch (error: todo) {
    log.error('failed to join call', error)
    screenContext.openDialog(AlertDialog, { message: error.toString() })
  }
}

export async function createChatByContactIdAndSelectIt(
  contactId: number
): Promise<void> {
  const chatId = await DeltaBackend.call(
    'contacts.createChatByContactId',
    contactId
  )

  if (!chatId) {
    throw new Error(window.static_translate('create_chat_error_desktop'))
  }

  const chat = await DeltaBackend.call('chatList.getFullChatById', chatId)

  if (chat && chat.archived) {
    log.debug('chat was archived, unarchiving it')
    await DeltaBackend.call(
      'chat.setVisibility',
      chatId,
      C.DC_CHAT_VISIBILITY_NORMAL
    )
  }

  // TODO update chatlist if its needed

  selectChat(chatId)
}

export function sendMessage(chatId: number, message: sendMessageParams) {
  return ChatStore.effect.sendMessage({ chatId, message })
}

export const deleteMessage = (messageId: number) => {
  ChatStore.effect.uiDeleteMessage(messageId)
}
