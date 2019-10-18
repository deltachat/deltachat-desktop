import { callDcMethod } from '../../ipc'

export function archiveChat (chatId, archive) {
  callDcMethod('archiveChat', [chatId, archive])
}

export function openLeaveChatDialog (screenContext, chatId) {
  const tx = window.translate
  screenContext.openDialog('ConfirmationDialog', {
    message: tx('ask_leave_group'),
    cb: yes => yes && callDcMethod('leaveGroup', chatId)
  })
}

export function openDeleteChatDialog (screenContext, chat) {
  const tx = window.translate
  screenContext.openDialog('ConfirmationDialog', {
    message: tx('ask_delete_chat_desktop', chat.name),
    cb: yes => yes && callDcMethod('deleteChat', chat.id)
  })
}

export function openBlockContactDialog (screenContext, selectedChat) {
  const tx = window.translate
  if (selectedChat && selectedChat.contacts.length) {
    const contact = selectedChat.contacts[0]
    screenContext.openDialog('ConfirmationDialog', {
      message: tx('ask_block_contact'),
      cb: yes => yes && callDcMethod('blockContact', contact.id)
    })
  }
}

export function openEncryptionInfoDialog (screenContext, chat) {
  screenContext.openDialog('EncryptionInfo', { chat })
}

export function openEditGroupDialog (screenContext, selectedChat) {
  screenContext.openDialog('EditGroup', { chat: selectedChat })
}
