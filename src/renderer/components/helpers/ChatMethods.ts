import { DeltaBackend, sendMessageParams } from '../../delta-remote'
import ChatStore, { ChatView } from '../../stores/chat'
import { ScreenContext, unwrapContext } from '../../contexts'
import { C } from 'deltachat-node/node/dist/constants'
import { runtime } from '../../runtime'
import { getLogger } from '../../../shared/logger'
import AlertDialog from '../dialogs/AlertDialog'
import { BackendRemote, EffectfulBackendActions, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import ViewGroup from '../dialogs/ViewGroup'
import ViewProfile from '../dialogs/ViewProfile'
import ConfirmationDialog from '../dialogs/ConfirmationDialog'

const log = getLogger('renderer/message')

type Chat =
  | Type.FullChat
  | (Type.ChatListItemFetchResult & { type: 'ChatListItem' })

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
    cb: (yes: boolean) =>
      yes && BackendRemote.rpc.leaveGroup(selectedAccountId(), chatId),
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
      EffectfulBackendActions.deleteChat(selectedAccountId(), chat.id).then(
        () => {
          if (selectedChatId === chat.id) {
            unselectChat()
          }
        }
      ),
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
      .dmChatContact || (selectedChat as Type.FullChat).contactIds[0]
  const accountId = selectedAccountId()

  // TODO: CHECK IF THE CHAT IS DM CHAT

  if (dmChatContact) {
    screenContext.openDialog('ConfirmationDialog', {
      message: tx('ask_block_contact'),
      confirmLabel: tx('menu_block_contact'),
      isConfirmDanger: true,
      cb: (yes: boolean) =>
        yes &&
        BackendRemote.rpc.contactsBlock(accountId, dmChatContact).then(() => {
          unselectChat()
          window.__refetchChatlist && window.__refetchChatlist()
        }),
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
  selectedChat: Type.FullChat
) {
  screenContext.openDialog(ViewGroup, {
    chat: selectedChat,
    isBroadcast: selectedChat.chatType === C.DC_CHAT_TYPE_BROADCAST,
  })
}

export async function openViewProfileDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  contact_id: number
) {
  screenContext.openDialog(ViewProfile, {
    contact: await BackendRemote.rpc.contactsGetContact(
      selectedAccountId(),
      contact_id
    ),
  })
}

export async function openMuteChatDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  chatId: number
) {
  screenContext.openDialog('MuteChat', { chatId })
}

export async function unMuteChat(chatId: number) {
  await BackendRemote.rpc.setChatMuteDuration(
    selectedAccountId(),
    chatId,
    'NotMuted'
  )
}

export async function sendCallInvitation(
  screenContext: unwrapContext<typeof ScreenContext>,
  chatId: number
) {
  try {
    const messageId = await BackendRemote.rpc.sendVideochatInvitation(
      selectedAccountId(),
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
    const message = await BackendRemote.rpc.messageGetMessage(
      selectedAccountId(),
      messageId
    )

    if (!message) {
      throw new Error('Message not found')
    }
    if (message.viewType !== 'VideochatInvitation') {
      throw new Error('Message is not a video chat invitation')
    }
    if (!message.videochatUrl) {
      throw new Error('Message has no video chat url')
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
  const accountId = selectedAccountId()

  const chatId = await BackendRemote.rpc.contactsCreateChatByContactId(
    accountId,
    contactId
  )

  if (!chatId) {
    throw new Error(window.static_translate('create_chat_error_desktop'))
  }

  const chat = await BackendRemote.rpc.chatlistGetFullChatById(
    accountId,
    chatId
  )

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

export async function clearChat(chatId: number) {
  const accountID = selectedAccountId()
  const tx = window.static_translate
  const messages_to_delete = await BackendRemote.rpc.messageListGetMessageIds(
    accountID,
    chatId,
    0
  )

  window.__openDialog(ConfirmationDialog, {
    message: tx('ask_delete_messages', String(messages_to_delete.length), {
      quantity: messages_to_delete.length,
    }),
    cb: async yes => {
      if (yes) {
        await BackendRemote.rpc.deleteMessages(accountID, messages_to_delete)
        selectChat(chatId)
      }
    },
  })
}
