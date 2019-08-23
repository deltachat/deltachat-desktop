import { ipcRenderer } from 'electron'
const chatListStore = require('../../stores/chatList')

export function archiveChat (chatId, archive) {
  chatListStore.dispatch({ type: 'UI_ARCHIVE_CHAT', payload: { chatId, archive } })
}

export function openLeaveChatDialog (screenContext, chatId) {
  const tx = window.translate
  screenContext.openDialog('ConfirmationDialog', {
    message: tx('ask_leave_group'),
    cb: yes => {
      if (yes) {
        chatListStore.dispatch({ type: 'UI_LEAVE_CHAT', payload: { chatId } })
      }
    }
  })
}

export function openDeleteChatDialog (screenContext, chatId) {
  const tx = window.translate
  screenContext.openDialog('ConfirmationDialog', {
    message: tx('ask_delete_chat_desktop'),
    cb: yes => {
      if (yes) {
        chatListStore.dispatch({ type: 'UI_DELETE_CHAT', payload: { chatId } })
      }
    }
  })
}

export function openBlockContactDialog (screenContext, selectedChat) {
  const tx = window.translate
  if (selectedChat && selectedChat.contacts.length) {
    const contact = selectedChat.contacts[0]
    screenContext.openDialog('ConfirmationDialog', {
      message: tx('ask_block_contact'),
      cb: yes => {
        if (yes) {
          ipcRenderer.send('blockContact', contact.id)
        }
      }
    })
  }
}

export function openEncryptionInfoDialog (screenContext, chat) {
  screenContext.openDialog('EncryptionInfo', { chat })
}
