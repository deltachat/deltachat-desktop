const { ipcRenderer } = require('electron')
const { Store } = require('./store')

const defaultState = {
  chatList: [],
  showArchivedChats: false
}
const chatListStore = new Store(defaultState)

// value for text1Meaning
const DC_TEXT1_DRAFT = 1

ipcRenderer.on('DD_EVENT_CHATLIST_UPDATED', (evt, payload) => {
  console.log('DD_EVENT_CHATLIST_UPDATED', payload)
  chatListStore.setState(payload)
})

// update the draft in chat list immediately
chatListStore.reducers.push((action, state) => {
  if (action.type === 'UI_SET_DRAFT') {
    const { chatId, text } = action.payload
    const chat = state.chatList.find(chat => chat.id === chatId)
    if (!chat) {
      console.log('Chat not found')
      return
    }
    let { text1, text2, text1Meaning, _initialText } = chat.summary

    if (text1Meaning !== DC_TEXT1_DRAFT && !_initialText) {
      _initialText = [ text1, text2 ]
    }
    let newSummary = {
      ...chat.summary,
      text1: window.translate('draft'),
      text2: text,
      _initialText: _initialText
    }
    if (text.length === 0 && _initialText) {
      newSummary.text1 = _initialText[0]
      newSummary.text2 = _initialText[1]
    }
    const updatedChat = { ...chat, summary: newSummary }
    let chatList = state.chatList.map(chat => {
      return chat.id === chatId ? updatedChat : chat
    })
    return { ...state, chatList }
  }
})

chatListStore.effects.push((action, state) => {
  if (action.type === 'UI_SET_DRAFT') {
    const { chatId, text } = action.payload
    ipcRenderer.send(
      'EVENT_DC_FUNCTION_CALL',
      'setDraft',
      chatId,
      text
    )
  }
})

module.exports = chatListStore
