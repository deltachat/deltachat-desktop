import { callDcMethodAsync, ipcBackend } from '../ipc'
import { Store } from './store'
import logger from '../../logger'
import MessageWrapper from '../components/message/MessageWrapper'

const log = logger.getLogger('renderer/stores/MessageList')

export const PAGE_SIZE = 50

const defaultState = {
  chatId: -1,
  messageIds: [],
  messages: {},
  oldestFetchedMessageIndex: -1,
  scrollToBottom: false,
  scrollToLastPage: false,
  scrollHeight: 0,
  countFetchedMessages: 0
}


const MessageListStore = new Store(defaultState, 'MessageListStore')

MessageListStore.getName = () => 'MessageListStore'

// remove the message from state immediately
MessageListStore.reducers.push(({ type, payload}, state) => {
  if (type === 'SELECT_CHAT') {
    return {...defaultState, chatId: payload}
  } else if (type === 'NEW_CHAT_SELECTED') {
    return { ...state, ...payload }
  } else if (type === 'FETCHED_MORE_MESSAGES') {
    return { 
      ...state,
      messages: {...state.messages, ...payload.fetchedMessages},
      oldestFetchedMessageIndex: payload.oldestFetchedMessageIndex,
      scrollToLastPage: true,
      scrollHeight: payload.scrollHeight,
      countFetchedMessages: payload.countFetchedMessages
    }
  } else if (type === 'FETCHED_INCOMING_MESSAGES') {
    return { 
      ...state,
      messageIds: payload.messageIds,
      messages: {...state.messages, ...payload.messagesIncoming},
    }
  } else if (type === 'SCROLLED_TO_LAST_PAGE') {
    return {...state, scrollToLastPage: false, scrollHeight: 0}
  } else if (type === 'SCROLLED_TO_BOTTOM') {
    return {...state, scrollToBottom: false}
  }
  return state
})

MessageListStore.effects.push(async ({ type, payload }, state) => {
  if (type === 'SELECT_CHAT') {
    const chatId = payload
    log.debug('SELECT CHAT:', chatId)
    const messageIds = await callDcMethodAsync('messageList.getMessageIds', [chatId])
    const oldestFetchedMessageIndex = messageIds.length - PAGE_SIZE
    const newestFetchedMessageIndex = messageIds.length
    const messageIdsToFetch = messageIds.slice(oldestFetchedMessageIndex, newestFetchedMessageIndex)
    let messages = await callDcMethodAsync('messageList.getMessages', [messageIdsToFetch])
    for (let messageId of Object.keys(messages)) {
        messages[messageId] = MessageWrapper.convert(messages[messageId])
    }
    MessageListStore.dispatch({
      type: 'NEW_CHAT_SELECTED',
      payload: {
        chatId,
        messageIds,
        messages,
        oldestFetchedMessageIndex,
        scrollToBottom: true
      }
    })
  } else if (type === 'FETCH_MORE_MESSAGES') {
    const page = state.page + 1
    const oldestFetchedMessageIndex = Math.max(state.oldestFetchedMessageIndex - 30, 0)
    const lastMessageIndexOnLastPage = state.oldestFetchedMessageIndex
    if (lastMessageIndexOnLastPage === 0) return
    console.log(oldestFetchedMessageIndex, lastMessageIndexOnLastPage)
    const fetchedMessageIds = state.messageIds.slice(
      oldestFetchedMessageIndex,
      lastMessageIndexOnLastPage
    )
    if (fetchedMessageIds.length === 0) return

    let fetchedMessages = await callDcMethodAsync('messageList.getMessages', [fetchedMessageIds])
    for (let messageId of Object.keys(fetchedMessages)) {
        fetchedMessages[messageId] = MessageWrapper.convert(fetchedMessages[messageId])
    }
    console.log('fetchedMessages', fetchedMessages)

    MessageListStore.dispatch({
      type: 'FETCHED_MORE_MESSAGES',
      payload: {
        fetchedMessages,
        oldestFetchedMessageIndex,
        countFetchedMessages: fetchedMessageIds.length,
        scrollHeight: payload.scrollHeight
      }
    })

  }
})


ipcBackend.on('DC_EVENT_INCOMING_MSG', async (_, chatId, messageIdIncoming) => {
  console.log('xxx hallo!', chatId, messageIdIncoming, MessageListStore.state.chatId)
  if (chatId !== MessageListStore.state.chatId) return
  const messageIds = await callDcMethodAsync('messageList.getMessageIds', [chatId])
  const messageIdsIncoming = messageIds.filter(x => !MessageListStore.state.messageIds.includes(x));
  const messagesIncoming = await callDcMethodAsync('messageList.getMessages', [messageIdsIncoming])
  MessageListStore.dispatch({
    type: 'FETCHED_INCOMING_MESSAGES',
    payload: {
      messageIds,
      messageIdsIncoming,
      messagesIncoming
    }
  })
  
})

export default MessageListStore
