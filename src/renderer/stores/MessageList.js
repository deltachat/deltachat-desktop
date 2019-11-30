import { callDcMethodAsync, ipcBackend } from '../ipc'
import EventEmitterStore from './EventEmitterStore'
import logger from '../../logger'
const log = logger.getLogger('renderer/stores/MessageList')

export const PAGE_SIZE = 30

const defaultState = {
  chatId: -1,
  messageIds: [],
  messages: {},
  oldestFetchedMessageIndex: -1
}


const MessageListStore = new EventEmitterStore(defaultState, 'MessageListStore')

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
      oldestFetchedMessageIndex: payload.oldestFetchedMessageIndex
    }
  } else if (type === 'FETCHED_INCOMING_MESSAGES') {
    return { 
      ...state,
      messageIds: payload.messageIds,
      messages: {...state.messages, ...payload.messagesIncoming},
    }
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
    const messages = await callDcMethodAsync('messageList.getMessages', [messageIdsToFetch])
    MessageListStore.dispatch({
      type: 'NEW_CHAT_SELECTED',
      payload: {
        chatId,
        messageIds,
        messages,
        oldestFetchedMessageIndex
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

    const fetchedMessages = await callDcMethodAsync('messageList.getMessages', [fetchedMessageIds])
    console.log('fetchedMessages', fetchedMessages)

    MessageListStore.dispatch({
      type: 'FETCHED_MORE_MESSAGES',
      payload: {
        fetchedMessages,
        oldestFetchedMessageIndex,
        countFetchedMessages: fetchedMessageIds.length
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

MessageListStore.hooks.push(({ type, payload }) => {
  if (type === 'NEW_CHAT_SELECTED') {
    MessageListStore.emit('afterNewChatSelected')
  } else if (type === 'FETCHED_MORE_MESSAGES') {
    MessageListStore.emit('afterFetchedMoreMessages', payload.countFetchedMessages)
  }
})

export default MessageListStore
