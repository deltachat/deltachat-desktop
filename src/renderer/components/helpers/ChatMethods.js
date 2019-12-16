import { callDcMethod } from '../../ipc'
import chatStore from '../../stores/chat'

const unselectChat = () => {
  chatStore.dispatch({ type: 'UI_UNSELECT_CHAT' })
}

export function archiveChat (chatId, archive) {
  callDcMethod('chat.archive', [chatId, archive], unselectChat)
}

export function openLeaveChatDialog (screenContext, chatId) {
  const tx = window.translate
  screenContext.openDialog('ConfirmationDialog', {
    message: tx('ask_leave_group'),
    confirmLabel: tx('menu_leave_group'),
    cb: yes => yes && callDcMethod('chat.leaveGroup', chatId)
  })
}

export function openDeleteChatDialog (screenContext, chat) {
  const tx = window.translate
  screenContext.openDialog('ConfirmationDialog', {
    message: tx('ask_delete_chat_desktop', chat.name),
    confirmLabel: tx('delete'),
    cb: yes => yes && callDcMethod('chat.delete', chat.id, unselectChat)
  })
}

export function openBlockContactDialog (screenContext, selectedChat) {
  const tx = window.translate
  if (selectedChat && selectedChat.contactIds.length) {
    screenContext.openDialog('ConfirmationDialog', {
      message: tx('ask_block_contact'),
      confirmLabel: tx('menu_block_contact'),
      cb: yes => yes && callDcMethod('contacts.blockContact', selectedChat.contactIds[0], unselectChat)
    })
  }
}

export function openEncryptionInfoDialog (screenContext, chat) {
  screenContext.openDialog('EncryptionInfo', { chat })
}

export function openEditGroupDialog (screenContext, selectedChat) {
  screenContext.openDialog('EditGroup', { chat: selectedChat })
}
