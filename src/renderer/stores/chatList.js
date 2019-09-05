const { ipcRenderer } = require('electron')
const { Store } = require('./store')
const chatStore = require('./chat')
const mapCoreMsgStatus2String = require('../components/helpers/MapMsgStatus')
const log = require('../../logger').getLogger('renderer/stores/chatList')

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

ipcRenderer.on('DD_EVENT_CHAT_MODIFIED', (evt, payload) => {
  const { chatId, chat } = payload
  const state = chatListStore.getState()
  const { chatList } = state
  const chatListIndex = chatList.findIndex(chat => chat.id === chatId)
  if (chatListIndex === -1) {
    // the chat is not in the list, let's reload the list
    ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'updateChatList')
    return
  }
  
  chatListStore.setState({ ...state, chatList: chatList.map((oldChat, i) => {
    return i === chatListIndex ? chat : oldChat
  })})
})

ipcRenderer.on('DD_EVENT_MSG_UPDATE', (evt, payload) => {
  const { chatId, messageObj, eventType } = payload

  const listState = chatListStore.getState()
  const selectedChat = chatStore.getState()
  const chat = listState.chatList.find(chat => chat.id === chatId)
  if (!chat) {
    // the chat is not in the list, let's reload the list
    ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'updateChatList')
    return
  }
  let freshMessageCounter = chat.freshMessageCounter
  if (eventType === 'DC_EVENT_INCOMING_MSG' && chatId !== selectedChat.id) {
    freshMessageCounter++
  }
  const updatedChat = {
    ...chat,
    freshMessageCounter: freshMessageCounter,
    summary: { status: mapCoreMsgStatus2String(messageObj.msg.state), ...messageObj.msg.summary }
  }
  const chatList = listState.chatList.map(chat => {
    return chat.id === chatId ? updatedChat : chat
  })
  chatList.sort(sortChatList)
  chatListStore.setState({ ...listState, chatList })
})

function reducer (action, componentState) {
  if (action.type === 'UI_SET_DRAFT') {
    // update the draft in chat list immediately
    const { chatId, text } = action.payload
    const chat = componentState.chatList.find(chat => chat.id === chatId)
    if (!chat) {
      log.debug('Chat not found')
      return
    }
    let { text1, text2, text1Meaning, _initialText, state } = chat.summary

    if (text1Meaning !== DC_TEXT1_DRAFT && !_initialText) {
      // keep initial text to be able to restore it if a draft is deleted again
      _initialText = [text1, text2, state]
    }
    const newSummary = {
      ...chat.summary,
      text1: window.translate('draft'),
      text2: text,
      state: 'draft',
      _initialText: _initialText
    }
    if (text.length === 0 && _initialText) {
      newSummary.text1 = _initialText[0]
      newSummary.text2 = _initialText[1]
      newSummary.state = _initialText[2]
    }
    const updatedChat = { ...chat, summary: newSummary }
    const chatList = componentState.chatList.map(chat => {
      return chat.id === chatId ? updatedChat : chat
    })
    return { ...componentState, chatList }
  } else if (action.type === 'UI_UPDATE_QUERY') {
    const { query } = action.payload
    return { ...componentState, query }
  } else {
    return componentState
  }
}

chatListStore.reducers.push(reducer)

chatListStore.effects.push((action, state) => {
  if (action.type === 'UI_SET_DRAFT') {
    const { chatId, text } = action.payload
    ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'setDraft', chatId, text)
  }
  if (action.type === 'UI_DELETE_CHAT' || action.type === 'UI_ARCHIVE_CHAT' || action.type === 'UI_LEAVE_CHAT') {
    const { chatId } = action.payload
    const selectedChat = chatStore.getState()
    if (selectedChat && selectedChat.id === chatId) {
      // current chat is deleted
      chatStore.dispatch({ type: 'UI_UNSELECT_CHAT' })
    }
    if (action.type === 'UI_ARCHIVE_CHAT') {
      const { archive } = action.payload
      ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'archiveChat', chatId, archive)
    } else {
      const functionName = action.type === 'UI_DELETE_CHAT' ? 'deleteChat' : 'leaveGroup'
      ipcRenderer.send('EVENT_DC_FUNCTION_CALL', functionName, chatId)
    }
  }
})

chatStore.subscribe((selectedChat) => {
  if (selectedChat === null || selectedChat.id === null) {
    return
  }
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
