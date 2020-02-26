import { callDcMethod, callDcMethodAsync } from '../../ipc'
import chatStore from '../../stores/chat'
import { ScreenContext, unwrapContext } from '../../contexts'
import { ChatListItemType } from '../../../shared/shared-types'

type Chat = ChatListItemType //| ChatType

const unselectChat = () => {
  chatStore.dispatch({ type: 'UI_UNSELECT_CHAT' })
}

export function archiveChat(chatId: number, archive: boolean) {
  callDcMethod('chat.archive', [chatId, archive], unselectChat)
}

export function openLeaveChatDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  chatId: number
) {
  const tx = window.translate
  screenContext.openDialog('ConfirmationDialog', {
    message: tx('ask_leave_group'),
    confirmLabel: tx('menu_leave_group'),
    cb: (yes: boolean) => yes && callDcMethod('chat.leaveGroup', chatId),
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
      yes && callDcMethod('chat.delete', chat.id, unselectChat),
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
        callDcMethod(
          'contacts.blockContact',
          selectedChat.contactIds[0],
          unselectChat
        ),
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
  contact: number /* |ContactType */
) {
  if (Number.isInteger(contact)) {
    contact = await callDcMethodAsync('chatList.getContact', contact)
  }
  screenContext.openDialog('ViewProfile', { contact })
}
