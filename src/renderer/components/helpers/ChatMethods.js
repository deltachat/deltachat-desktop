import { ipcRenderer } from 'electron'

export function archiveChat (chatId, archive) {
  ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'archiveChat', chatId, archive)
}

export function openLeaveChatDialog (screenContext, chatId) {
  const tx = window.translate
  screenContext.openDialog('ConfirmationDialog', {
    message: tx('ask_leave_group'),
    cb: yes => {
      if (yes) {
        ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'leaveGroup', chatId)
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
        ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'deleteChat', chatId)
      }
    }
  })
}

export function openBlockContactDialog(screenContext, selectedChat) {
  const tx = window.translate
  if (selectedChat && selectedChat.contacts.length) {
    let contact = selectedChat.contacts[0]
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

export function openEncryptionInfoDialog(screenContext, chat) {
  screenContext.openDialog('EncrInfo', { chat })
}
