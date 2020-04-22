import { callDcMethodAsync } from '../../ipc'
import chatStore from '../../stores/chat'
import { ScreenContext, unwrapContext } from '../../contexts'
import {
  ChatListItemType,
  JsonContact,
  FullChat,
} from '../../../shared/shared-types'
import { C } from 'deltachat-node/dist/constants'

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
  shouldUnselectChat: boolean = false
) {
  await callDcMethodAsync('chat.setVisibility', chatId, visibility)
  if (shouldUnselectChat || visibility === C.DC_CHAT_VISIBILITY_ARCHIVED)
    unselectChat()
}

export function openLeaveChatDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  chatId: number
) {
  const tx = window.translate
  screenContext.openDialog('ConfirmationDialog', {
    message: tx('ask_leave_group'),
    confirmLabel: tx('menu_leave_group'),
    cb: (yes: boolean) => yes && callDcMethodAsync('chat.leaveGroup', chatId),
  })
}

export function openDeleteChatDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  chat: Chat
) {
  const tx = window.translate
  screenContext.openDialog('ConfirmationDialog', {
    message: tx('ask_delete_chat_desktop', chat.name),
    confirmLabel: tx('delete'),
    cb: (yes: boolean) =>
      yes && callDcMethodAsync('chat.delete', chat.id).then(unselectChat),
  })
}

export function openBlockContactDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  selectedChat: Chat
) {
  const tx = window.translate
  if (selectedChat && selectedChat.contactIds.length) {
    screenContext.openDialog('ConfirmationDialog', {
      message: tx('ask_block_contact'),
      confirmLabel: tx('menu_block_contact'),
      cb: (yes: boolean) =>
        yes &&
        callDcMethodAsync(
          'contacts.blockContact',
          selectedChat.contactIds[0]
        ).then(unselectChat),
    })
  }
}

export function openEncryptionInfoDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  chat: Chat
) {
  screenContext.openDialog('EncryptionInfo', { chat })
}

export function openEditGroupDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  selectedChat: Chat
) {
  screenContext.openDialog('EditGroup', { chat: selectedChat })
}

export function openMapDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  selectedChat: Chat
) {
  screenContext.openDialog('MapDialog', { selectedChat })
}

export async function openViewProfileDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  contact: number | JsonContact
) {
  if (typeof contact === 'number' && Number.isInteger(contact)) {
    contact = await callDcMethodAsync('chatList.getContact', contact)
  }
  screenContext.openDialog('ViewProfile', { contact })
}
