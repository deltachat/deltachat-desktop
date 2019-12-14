import { ipcBackend, callDcMethod, callDcMethodAsync } from '../ipc'
import { Store, useStore } from './store'

export const PAGE_SIZE = 30

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
  draft: null,

  messageIds: [],
  messages: {},
  oldestFetchedMessageIndex: -1,
  scrollToBottom: false, // if true the UI will scroll to bottom
  scrollToLastPage: false, // after fetching more messages reset scroll bar to old position
  scrollHeight: 0,
  countFetchedMessages: 0
}

const chatStore = new Store(defaultState, 'ChatStore')
const log = chatStore.log

chatStore.reducers.push(({ type, payload, id }, state) => {
  if (type === 'SELECTED_CHAT') {
    return { ...defaultState, ...payload }
  }

  if (typeof id !== 'undefined' && id !== state.id) {
    log.debug('REDUCER', 'seems like an old action because the chatId changed in between')
    return state
  }

  if (type === 'UI_UNSELECT_CHAT') {
    return { ...defaultState }
  } else if (type === 'MODIFIED_CHAT') {
    return { ...state, ...payload }
  } else if (type === 'FETCHED_MORE_MESSAGES') {
    return {
      ...state,
      messages: { ...state.messages, ...payload.fetchedMessages },
      oldestFetchedMessageIndex: payload.oldestFetchedMessageIndex,
      scrollToLastPage: true,
      scrollHeight: payload.scrollHeight,
      countFetchedMessages: payload.countFetchedMessages
    }
  } else if (type === 'FETCHED_INCOMING_MESSAGES') {
    return {
      ...state,
      messageIds: payload.messageIds,
      messages: {
        ...state.messages,
        ...payload.messagesIncoming
      },
      scrollToBottom: true
    }
    // type SCROLL_COMPLETE ?
  } else if (type === 'FINISHED_SCROLL') {
    if (payload === 'SCROLLED_TO_LAST_PAGE') {
      return { ...state, scrollToLastPage: false, scrollHeight: 0 }
    } else if (payload === 'SCROLLED_TO_BOTTOM') {
      return { ...state, scrollToBottom: false }
    }
  } else if (type === 'UI_DELETE_MESSAGE') {
    const msgId = payload

    const messageIndex = state.messageIds.indexOf(msgId)
    let { oldestFetchedMessageIndex } = state
    if (messageIndex === oldestFetchedMessageIndex) {
      oldestFetchedMessageIndex += 1
    }
    const messageIds = state.messageIds.filter(mId => mId !== msgId)
    const messages = { ...state.messages, [msgId]: null }
    return { ...state, messageIds, messages, oldestFetchedMessageIndex }
  } else if (type === 'MESSAGE_CHANGED') {
    return { ...state, messages: { ...state.messages, ...payload.messagesChanged } }
  } else if (type === 'MESSAGE_SENT') {
    const [messageId, message] = payload
    const messageIds = [...state.messageIds, messageId]
    const messages = { ...state.messages, [messageId]: message }
    return { ...state, messageIds, messages, scrollToBottom: true }
  } else if (type === 'MESSAGE_DELIVERED') {
    const messages = {
      ...state.messages,
      [payload]: {
        ...state.messages[payload],
        msg: {
          ...state.messages[payload].msg,
          status: 'delivered'
        }
      }
    }
    return { ...state, messages }
  }
  return state
})

chatStore.effects.push(async ({ type, payload }, state) => {
  if (type === 'SELECT_CHAT') {
    const chatId = payload
    // these methods were called in backend before
    // might be an issue if callDcMethodAsync has a significant delay
    const chat = await callDcMethodAsync('chatList.selectChat', [chatId])
    const messageIds = await callDcMethodAsync('messageList.getMessageIds', [chatId])
    const oldestFetchedMessageIndex = messageIds.length - PAGE_SIZE
    const newestFetchedMessageIndex = messageIds.length
    const messageIdsToFetch = messageIds.slice(oldestFetchedMessageIndex, newestFetchedMessageIndex)
    const messages = await callDcMethodAsync('messageList.getMessages', [messageIdsToFetch])
    chatStore.dispatch({
      type: 'SELECTED_CHAT',
      payload: {
        ...chat,
        id: chatId,
        messageIds,
        messages,
        oldestFetchedMessageIndex,
        scrollToBottom: true
      }
    })
  } else if (type === 'UI_DELETE_MESSAGE') {
    const msgId = payload
    callDcMethod('messageList.deleteMessage', [msgId])
  } else if (type === 'FETCH_MORE_MESSAGES') {
    const oldestFetchedMessageIndex = Math.max(state.oldestFetchedMessageIndex - PAGE_SIZE, 0)
    const lastMessageIndexOnLastPage = state.oldestFetchedMessageIndex
    if (lastMessageIndexOnLastPage === 0) return
    const fetchedMessageIds = state.messageIds.slice(
      oldestFetchedMessageIndex,
      lastMessageIndexOnLastPage
    )
    if (fetchedMessageIds.length === 0) return

    const fetchedMessages = await callDcMethodAsync('messageList.getMessages', [fetchedMessageIds])

    chatStore.dispatch({
      type: 'FETCHED_MORE_MESSAGES',
      payload: {
        fetchedMessages,
        oldestFetchedMessageIndex,
        countFetchedMessages: fetchedMessageIds.length,
        scrollHeight: payload.scrollHeight
      }
    })
  } else if (type === 'SEND_MESSAGE') {
    if (payload[0] !== chatStore.state.id) return
    const messageObj = await callDcMethodAsync('messageList.sendMessage', payload)
    chatStore.dispatch({ type: 'MESSAGE_SENT', payload: messageObj, id: payload[0] })
  }
})

ipcBackend.on('DD_EVENT_CHAT_MODIFIED', (evt, payload) => {
  const { chatId, chat } = payload
  const state = chatStore.getState()
  if (state.id !== chatId) {
    return
  }
  chatStore.dispatch({ type: 'MODIFIED_CHAT',
    payload: {
      profileImage: chat.profileImage,
      name: chat.name,
      subtitle: chat.subtitle,
      contacts: chat.contacts,
      selfInGroup: chat.selfInGroup
    } })
})

ipcBackend.on('DC_EVENT_MSG_DELIVERED', (evt, [id, msgId]) => {
  chatStore.dispatch({
    type: 'MESSAGE_DELIVERED',
    id,
    payload: msgId
  })
})

ipcBackend.on('DC_EVENT_INCOMING_MSG', async (_, [chatId, messageId]) => {
  if (chatId !== chatStore.state.id) {
    log.debug(`DC_EVENT_INCOMING_MSG chatId of event (${chatId}) doesn't match id of selected chat (${chatStore.state.id}). Skipping.`)
    return
  }
  const messageIds = await callDcMethodAsync('messageList.getMessageIds', [chatId])
  const messageIdsIncoming = messageIds.filter(x => !chatStore.state.messageIds.includes(x))
  const messagesIncoming = await callDcMethodAsync('messageList.getMessages', [messageIdsIncoming])
  chatStore.dispatch({
    type: 'FETCHED_INCOMING_MESSAGES',
    payload: {
      messageIds,
      messageIdsIncoming,
      messagesIncoming
    }
  })
})

ipcBackend.on('DC_EVENT_MSGS_CHANGED', async (_, [id, messageId]) => {
  log.debug('DC_EVENT_MSGS_CHANGED', id, messageId)
  if (id !== chatStore.state.id) return
  if (chatStore.state.messageIds.indexOf(messageId) !== -1) {
    log.debug('DC_EVENT_MSGS_CHANGED', 'changed message seems to be message we already know')
    const messagesChanged = await callDcMethodAsync('messageList.getMessages', [[messageId]])
    chatStore.dispatch({
      type: 'MESSAGE_CHANGED',
      payload: {
        messageId,
        messagesChanged
      }
    })
  } else {
    log.debug('DC_EVENT_MSGS_CHANGED', 'changed message seems to be a new message')
    const messageIds = await callDcMethodAsync('messageList.getMessageIds', [id])
    const messageIdsIncoming = messageIds.filter(x => !chatStore.state.messageIds.includes(x))
    const messagesIncoming = await callDcMethodAsync('messageList.getMessages', [messageIdsIncoming])
    chatStore.dispatch({
      type: 'FETCHED_INCOMING_MESSAGES',
      payload: {
        messageIds,
        messageIdsIncoming,
        messagesIncoming
      }
    })
  }
})

ipcBackend.on('ClickOnNotification', (ev, { chatId }) => {
  selectChat(chatId)
})

export const useChatStore = () => useStore(chatStore)
export const selectChat = chatId => chatStore.dispatch({ type: 'SELECT_CHAT', payload: chatId })

export default chatStore
