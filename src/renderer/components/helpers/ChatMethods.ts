import { T, C } from '@deltachat/jsonrpc-client'

import ChatStore, { ChatView } from '../../stores/chat'
import { getLogger } from '../../../shared/logger'
import AlertDialog from '../dialogs/AlertDialog'
import { BackendRemote, EffectfulBackendActions, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import ViewGroup from '../dialogs/ViewGroup'
import ViewProfile from '../dialogs/ViewProfile'
import ConfirmationDialog from '../dialogs/ConfirmationDialog'
import chatStore from '../../stores/chat'
import { openLinkSafely } from './LinkConfirmation'
import EncryptionInfo from '../dialogs/EncryptionInfo'
import MuteChat from '../dialogs/MuteChat'

import type { OpenDialog } from '../../contexts/DialogContext'

const log = getLogger('renderer/message')

type Chat =
  | Type.FullChat
  | (Type.ChatListItemFetchResult & { kind: 'ChatListItem' })

export const selectChat = async (chatId: number) => {
  await ChatStore.effect.selectChat(chatId)
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

export function openLeaveChatDialog(openDialog: OpenDialog, chatId: number) {
  const tx = window.static_translate

  openDialog(ConfirmationDialog, {
    message: tx('ask_leave_group'),
    confirmLabel: tx('menu_leave_group'),
    isConfirmDanger: true,
    noMargin: true,
    cb: (yes: boolean) =>
      yes && BackendRemote.rpc.leaveGroup(selectedAccountId(), chatId),
  })
}

export function openDeleteChatDialog(
  openDialog: OpenDialog,
  chat: Chat,
  selectedChatId: number | null
) {
  const tx = window.static_translate

  openDialog(ConfirmationDialog, {
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
  openDialog: OpenDialog,
  selectedChat: Chat
) {
  const tx = window.static_translate
  const dmChatContact =
    (selectedChat as Type.ChatListItemFetchResult & { kind: 'ChatListItem' })
      .dmChatContact || (selectedChat as Type.FullChat).contactIds[0]
  const accountId = selectedAccountId()

  // TODO: CHECK IF THE CHAT IS DM CHAT

  if (dmChatContact) {
    openDialog(ConfirmationDialog, {
      message: tx('ask_block_contact'),
      confirmLabel: tx('menu_block_contact'),
      isConfirmDanger: true,
      cb: (yes: boolean) =>
        yes &&
        EffectfulBackendActions.blockContact(accountId, dmChatContact).then(
          unselectChat
        ),
    })
  }
}

export function openEncryptionInfoDialog(
  openDialog: OpenDialog,
  chatListItem: Type.ChatListItemFetchResult & { kind: 'ChatListItem' }
) {
  openDialog(EncryptionInfo, { chatListItem })
}

export function openViewGroupDialog(
  openDialog: OpenDialog,
  selectedChat: Type.FullChat
) {
  openDialog(ViewGroup, {
    chat: selectedChat,
    isBroadcast: selectedChat.chatType === C.DC_CHAT_TYPE_BROADCAST,
  })
}

export async function openViewProfileDialog(
  openDialog: OpenDialog,
  contact_id: number
) {
  openDialog(ViewProfile, {
    contact: await BackendRemote.rpc.getContact(
      selectedAccountId(),
      contact_id
    ),
  })
}

export async function openMuteChatDialog(
  openDialog: OpenDialog,
  chatId: number
) {
  openDialog(MuteChat, { chatId })
}

export async function unMuteChat(chatId: number) {
  await BackendRemote.rpc.setChatMuteDuration(selectedAccountId(), chatId, {
    kind: 'NotMuted',
  })
}

export async function sendCallInvitation(
  openDialog: OpenDialog,
  chatId: number
) {
  try {
    const messageId = await BackendRemote.rpc.sendVideochatInvitation(
      selectedAccountId(),
      chatId
    )
    ChatStore.effect.jumpToMessage(messageId, false)
    await joinCall(openDialog, messageId)
  } catch (error: todo) {
    log.error('failed send call invitation', error)
    openDialog(AlertDialog, {
      message: error?.message || error.toString(),
    })
  }
}

export async function joinCall(openDialog: OpenDialog, messageId: number) {
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

    return openLinkSafely(openDialog, message.videochatUrl)
  } catch (error: todo) {
    log.error('failed to join call', error)
    openDialog(AlertDialog, { message: error.toString() })
  }
}

/**
 * Creates a new chat with given email address and returns chat id.
 *
 * In case an unknown email address was chosen or a chat does not exist yet the
 * user will be prompted with a confirmation dialogue. In case the user aborts the
 * action `null` is returned.
 */
export async function createChatByEmail(
  openDialog: OpenDialog,
  email: string
): Promise<number | null> {
  const tx = window.static_translate
  const accountId = selectedAccountId()

  let contactId = await BackendRemote.rpc.lookupContactIdByAddr(
    accountId,
    email
  )

  const chatId = contactId
    ? await BackendRemote.rpc.getChatIdByContactId(accountId, contactId)
    : null

  if (chatId) {
    return chatId
  }

  // Ask user if they want to proceed with creating a new contact and / or chat
  const continueProcess = await new Promise((resolve, _reject) => {
    openDialog(ConfirmationDialog, {
      message: tx('ask_start_chat_with', email),
      confirmLabel: tx('ok'),
      cb: resolve,
    })
  })

  if (!continueProcess) {
    return null
  }

  if (!contactId) {
    contactId = await BackendRemote.rpc.createContact(accountId, email, null)
  }

  return await BackendRemote.rpc.createChatByContactId(accountId, contactId)
}

export async function createChatByContactIdAndSelectIt(
  contactId: number
): Promise<void> {
  const accountId = selectedAccountId()

  const chatId = await BackendRemote.rpc.createChatByContactId(
    accountId,
    contactId
  )

  const chat = await BackendRemote.rpc.getFullChatById(accountId, chatId)

  if (chat.archived) {
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

export async function sendMessage(
  chatId: number,
  message: Partial<Type.MessageData>
) {
  const id = await BackendRemote.rpc.sendMsg(selectedAccountId(), chatId, {
    file: null,
    viewtype: message.file ? 'File' : 'Text',
    html: null,
    location: null,
    overrideSenderName: null,
    quotedMessageId: null,
    text: null,
    // replace defaults with real values
    ...message,
  })
  // jump down on sending
  chatStore.effect.jumpToMessage(id, false)
}

export function forwardMessage(
  accountId: number,
  messageId: number,
  chatId: number
) {
  return BackendRemote.rpc.forwardMessages(accountId, [messageId], chatId)
}

export const deleteMessage = (messageId: number) => {
  BackendRemote.rpc.deleteMessages(selectedAccountId(), [messageId])
}

export async function clearChat(openDialog: OpenDialog, chatId: number) {
  const accountID = selectedAccountId()
  const tx = window.static_translate
  const messages_to_delete = await BackendRemote.rpc.getMessageIds(
    accountID,
    chatId,
    false,
    false
  )

  openDialog(ConfirmationDialog, {
    message: tx('ask_delete_messages', String(messages_to_delete.length), {
      quantity: messages_to_delete.length,
    }),
    cb: async yes => {
      if (yes) {
        // workaround event race where it tried to load already deleted messages by unloading the chat first.
        unselectChat()
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

  const chat = await BackendRemote.rpc.getFullChatById(accountId, chatId)

  await BackendRemote.rpc.setChatName(accountId, chatId, name)

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

/**
 * Create draft message in given chat.
 *
 * In case a draft message already exists, the user is asked if they want to
 * replace it.
 */
export async function createDraftMessage(
  openDialog: OpenDialog,
  chatId: number,
  messageText: string
) {
  const accountId = selectedAccountId()

  const draft = await BackendRemote.rpc.getDraft(accountId, chatId)

  selectChat(chatId)

  if (draft) {
    const { name } = await BackendRemote.rpc.getBasicChatInfo(accountId, chatId)

    // ask if the draft should be replaced
    const continueProcess = await new Promise((resolve, _reject) => {
      openDialog(ConfirmationDialog, {
        message: window.static_translate('confirm_replace_draft', name),
        confirmLabel: window.static_translate('replace_draft'),
        cb: resolve,
      })
    })
    if (!continueProcess) {
      return
    }
  }

  await BackendRemote.rpc.miscSetDraft(
    accountId,
    chatId,
    messageText,
    null,
    null,
    'Text'
  )

  window.__reloadDraft && window.__reloadDraft()
}

/**
 * Returns true if all contacts of a given list are verified, otherwise false.
 */
export async function areAllContactsVerified(
  accountId: number,
  contactIds: number[]
): Promise<boolean> {
  const contacts = await BackendRemote.rpc.getContactsByIds(
    accountId,
    contactIds
  )

  return !contactIds.some(contactId => {
    return !contacts[contactId].isVerified
  })
}
