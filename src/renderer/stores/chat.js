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

function getMessage (evt, msgId) {
  const state = chatStore.getState()
  const messageObj = ipcRenderer.sendSync(
    'EVENT_DC_FUNCTION_CALL',
    'getMessage',
    msgId
  )
  if (evt === 'DC_EVENT_INCOMING_MSG') {
    this.setState({ ...state, messages: [...state.chat.messages, messageObj] })
  } else if (evt === 'DC_EVENT_MSGS_CHANGED') {
    const index = state.messages.findIndex(msg => msg.id === msgId)
    let messages = [
      ...state.messages.slice(0, index),
      messageObj,
      ...state.messages.slice(index + 1)
    ]
    this.setState({ ...state, messages: messages })
  }
}

function onMessageChanged (evt, payload) {
  const { id } = chatStore.getState()
  const { chatId, msgId } = payload
  if (id && chatId === id) {
    getMessage(evt, msgId)
  }
}

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

ipcRenderer.on('DC_EVENT_MSGS_CHANGED', onMessageChanged)
ipcRenderer.on('DC_EVENT_INCOMING_MSG', onMessageChanged)

module.exports = chatStore
