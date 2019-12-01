const { ipcRenderer } = require('electron')
const { callDcMethod } = require('../ipc')
const { Store } = require('./store')

const defaultState = {
  id: null,
  name: '',
  isVerified: false,
  profileImage: null,

  archived: false,
  subtitle: '',
  type: null,
  isUnpromoted: false,
  isSelfTalk: false,

  contacts: [],
  color: '',
  summary: undefined,
  freshMessageCounter: 0,
  isGroup: false,
  isDeaddrop: false,
  draft: null
}
const chatStore = new Store(defaultState)

const log = require('../../logger').getLogger('renderer/stores/chat')

// remove the message from state immediately

chatStore.effects.push((action) => {
  if (action.type === 'UI_DELETE_MESSAGE') {
    const { msgId } = action.payload
    callDcMethod('messageList.deleteMessage', [msgId])
  }
})

ipcRenderer.on('DD_EVENT_CHAT_MODIFIED', (evt, payload) => {
  const { chatId, chat } = payload
  const state = chatStore.getState()
  if (state.id !== chatId) {
    return
  }
  // update info for selected chat
  chatStore.setState(
    { ...state,
      profileImage: chat.profileImage,
      name: chat.name,
      subtitle: chat.subtitle,
      contacts: chat.contacts,
      selfInGroup: chat.selfInGroup
    })
})

ipcRenderer.on('DD_EVENT_CHAT_SELECTED', (evt, payload) => {
  chatStore.setState(payload.chat)
})

module.exports = chatStore
