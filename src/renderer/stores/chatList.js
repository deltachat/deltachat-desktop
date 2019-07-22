const { ipcRenderer } = require('electron')
const { Store } = require('./store')
const chatStore = require('./chat')

const defaultState = {
  chatList: [],
  archivedChatList: []
}
const chatListStore = new Store(defaultState)

// value for text1Meaning
const DC_TEXT1_DRAFT = 1

function sortChatList (first, second) {
  if (first.deaddrop || second.deaddrop) {
    return first.deaddrop ? -1 : 1
  }
  if (first.isArchiveLink || second.isArchiveLink) {
    return first.isArchiveLink ? 1 : -1
  }
  if (first.freshMessageCounter !== second.freshMessageCounter) {
    return first.freshMessageCounter > second.freshMessageCounter ? -1 : 1
  }
  return first.summary.timestamp > second.summary.timestamp ? -1 : 1
}

// complete update of chat list
ipcRenderer.on('DD_EVENT_CHATLIST_UPDATED', (evt, payload) => {
  const { chatList, showArchivedChats } = payload
  const state = chatListStore.getState()
  if (showArchivedChats) {
    chatListStore.setState({ ...state, archivedChatList: chatList })
  } else {
    chatListStore.setState({ ...state, chatList })
  }
})

ipcRenderer.on('DD_EVENT_MSG_UPDATE', (evt, payload) => {
  const { chatId, messageObj, eventType } = payload
  if (eventType === 'DC_EVENT_INCOMING_MSG' || eventType === 'DC_EVENT_MSGS_CHANGED') {
    const listState = chatListStore.getState()
    const selectedChat = chatStore.getState()
    const chat = listState.chatList.find(chat => chat.id === chatId)
    if (!chat) {
      return
    }
    let freshMessageCounter = chat.freshMessageCounter
    if (eventType === 'DC_EVENT_INCOMING_MSG' && chatId !== selectedChat.id) {
      freshMessageCounter++
    }
    const updatedChat = {
      ...chat,
      freshMessageCounter: freshMessageCounter,
      summary: messageObj.msg.summary
    }
    const chatList = listState.chatList.map(chat => {
      return chat.id === chatId ? updatedChat : chat
    })
    chatList.sort(sortChatList)
    chatListStore.setState({ ...listState, chatList })
  }
})

function reducer (action, state) {
  if (action.type === 'UI_SET_DRAFT') {
    // update the draft in chat list immediately
    const { chatId, text } = action.payload
    const chat = state.chatList.find(chat => chat.id === chatId)
    if (!chat) {
      console.log('Chat not found')
      return
    }
    let { text1, text2, text1Meaning, _initialText } = chat.summary

    if (text1Meaning !== DC_TEXT1_DRAFT && !_initialText) {
      // keep initial text to be able to restore it if a draft is deleted again
      _initialText = [text1, text2]
    }
    const newSummary = {
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
    const chatList = state.chatList.map(chat => {
      return chat.id === chatId ? updatedChat : chat
    })
    return { ...state, chatList }
  } else if (action.type === 'UI_UPDATE_QUERY') {
    const { query } = action.payload
    return { ...state, query }
  } else {
    return state
  }
}

chatListStore.reducers.push(reducer)

chatListStore.effects.push((action, state) => {
  if (action.type === 'UI_SET_DRAFT') {
    const { chatId, text } = action.payload
    ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'setDraft', chatId, text)
  }
})

chatStore.subscribe((selectedChat) => {
  const { id, messages } = selectedChat
  if (!messages || messages.length < 0) {
    return
  }
  const state = chatListStore.getState()
  // mark loaded messages as read
  const chatList = state.chatList.map(chat => {
    if (chat.id === id) {
      const newCounter = chat.freshMessageCounter < messages.length ? 0 : chat.freshMessageCounter - messages.length
      return { ...chat, freshMessageCounter: newCounter }
    } else {
      return chat
    }
  })
  chatListStore.setState({ ...state, chatList })
})

module.exports = chatListStore
