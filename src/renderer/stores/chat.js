const { ipcRenderer } = require('electron')
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
  totalMessages: 0,
  messages: [],
  color: '',
  summary: undefined,
  freshMessageCounter: 0,
  isGroup: false,
  isDeaddrop: false,
  draft: null
}
const chatStore = new Store(defaultState)

// remove the message from state immediately
chatStore.reducers.push((action, state) => {
  if (action.type === 'UI_DELETE_MESSAGE') {
    const { msgId } = action.payload
    const index = state.messages.findIndex(msg => msg.id === msgId)
    let messages = [
      ...state.messages.slice(0, index),
      ...state.messages.slice(index + 1)
    ]
    return { ...state, messages }
  }
})

chatStore.effects.push((action, state) => {
  if (action.type === 'UI_DELETE_MESSAGE') {
    const { msgId } = action.payload
    ipcRenderer.send(
      'EVENT_DC_FUNCTION_CALL',
      'deleteMessage',
      msgId
    )
  }
})

ipcRenderer.on('DD_EVENT_CHAT_SELECTED', (evt, payload) => {
  chatStore.setState(payload.chat)
})

ipcRenderer.on('DD_MESSAGES_LOADED', (evt, payload) => {
  const state = chatStore.getState()
  const { chatId, messages, totalMessages } = payload
  if (chatId === chatStore.getState().id) {
    chatStore.setState({ ...state, totalMessages, messages: [...messages, ...state.messages] })
  }
})

ipcRenderer.on('DD_EVENT_MSG_UPDATE', (evt, payload) => {
  const { chatId, messageObj, eventType } = payload
  const state = chatStore.getState()
  console.log('DD_EVENT_MSG_UPDATE: ', eventType)
  if (state.id !== chatId) {
    return
  }
  if (!state.messages.find(msg => msg.id === messageObj.id)) {
    chatStore.setState({ ...state, messages: [...state.messages, messageObj] })
  } else {
    let messages = state.messages.map(msg => {
      return msg.id === messageObj.id ? messageObj : msg
    })
    chatStore.setState({ ...state, messages })
  }
})

module.exports = chatStore
