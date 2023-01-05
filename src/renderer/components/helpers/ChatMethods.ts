import ChatStore, { ChatView } from '../../stores/chat'
import { ScreenContext, unwrapContext } from '../../contexts'
import { C } from '@deltachat/jsonrpc-client'
import { runtime } from '../../runtime'
import { getLogger } from '../../../shared/logger'
import AlertDialog from '../dialogs/AlertDialog'
import { BackendRemote, EffectfulBackendActions, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import ViewGroup from '../dialogs/ViewGroup'
import ViewProfile from '../dialogs/ViewProfile'
import ConfirmationDialog from '../dialogs/ConfirmationDialog'
import { T } from '@deltachat/jsonrpc-client'
import { sendMessageParams } from '../../../shared/shared-types'
import chatStore from '../../stores/chat'

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
  highlight?: undefined | boolean,
  msgParentId?: undefined | number
) => {
  ChatStore.effect.jumpToMessage(msgId, highlight, msgParentId)
}

export const unselectChat = () => {
  ChatStore.reducer.unselectChat()
}

export async function setChatVisibility(
  chatId: number,
  visibility: T.ChatVisibility,
  shouldUnselectChat = false
) {
  await BackendRemote.rpc.setChatVisibility(
    selectedAccountId(),
    chatId,
    visibility
  )
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
        BackendRemote.rpc.blockContact(accountId, dmChatContact).then(() => {
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
    contact: await BackendRemote.rpc.getContact(
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
    const message = await BackendRemote.rpc.getMessage(
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

  const chatId = await BackendRemote.rpc.createChatByContactId(
    accountId,
    contactId
  )

  if (!chatId) {
    throw new Error(window.static_translate('create_chat_error_desktop'))
  }

  const chat = await BackendRemote.rpc.getFullChatById(accountId, chatId)

  if (chat && chat.archived) {
    log.debug('chat was archived, unarchiving it')
    await BackendRemote.rpc.setChatVisibility(
      selectedAccountId(),
      chatId,
      'Normal'
    )
  }

  // TODO update chatlist if its needed

  selectChat(chatId)
}

export async function sendMessage(chatId: number, message: sendMessageParams) {
  const { text, filename, location, quoteMessageId } = message
  const [id] = await BackendRemote.rpc.miscSendMsg(
    selectedAccountId(),
    chatId,
    text || null,
    filename || null,
    location ? [location.lat, location.lng] : null,
    quoteMessageId || null
  )
  // jump down on sending
  chatStore.effect.jumpToMessage(id, false)
}

export async function forwardMessage(accountId: number, messageId: number, chatId: number) {
  await BackendRemote.rpc.forwardMessages(accountId, [messageId], chatId)
}

export const deleteMessage = (messageId: number) => {
  BackendRemote.rpc.deleteMessages(selectedAccountId(), [messageId])
}

export async function clearChat(chatId: number) {
  const accountID = selectedAccountId()
  const tx = window.static_translate
  const messages_to_delete = await BackendRemote.rpc.getMessageIds(
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

export async function modifyGroup(
  chatId: number,
  name: string,
  image: string | null | undefined,
  members: number[] | null
) {
  const accountId = selectedAccountId()
  log.debug('action - modify group', { chatId, name, image, members })
  await BackendRemote.rpc.setChatName(accountId, chatId, name)
  const chat = await BackendRemote.rpc.getFullChatById(accountId, chatId)
  if (!chat) {
    throw new Error('chat is undefined, this should not happen')
  }
  if (typeof image !== 'undefined' && chat.profileImage !== image) {
    await BackendRemote.rpc.setChatProfileImage(
      accountId,
      chatId,
      image || null
    )
  }

  if (members !== null) {
    const previousMembers = [...chat.contactIds]
    const remove = previousMembers.filter(m => !members.includes(m))
    const add = members.filter(m => !previousMembers.includes(m))

    await Promise.all(
      remove.map(id =>
        BackendRemote.rpc.removeContactFromChat(accountId, chatId, id)
      )
    )
    await Promise.all(
      add.map(id => BackendRemote.rpc.addContactToChat(accountId, chatId, id))
    )
  }
}
