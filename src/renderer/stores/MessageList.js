import { ipcRenderer } from 'electron'
import { callDcMethodAsync } from '../ipc'
import EventEmitterStore from './EventEmitterStore'
import logger from '../../logger'
const log = logger.getLogger('renderer/stores/MessageList')

export const PAGE_SIZE = 10

const defaultState = {
  messageIds: [],
  messages: {},
  messageIdsToShow: [],
  page: 0
}


const MessageListStore = new EventEmitterStore(defaultState)

// remove the message from state immediately
MessageListStore.reducers.push(({ type, payload}, state) => {
  if (type === 'SELECT_CHAT') {
    return defaultState
  } else if (type === 'NEW_CHAT_SELECTED') {
    return { ...state, ...payload }
  } else if (type === 'FETCHED_MORE_MESSAGES') {
    return { 
      ...state,
      page: payload.page,
      messages: {...state.messages, ...payload.fetchedMessages},
      messageIdsToShow: [...payload.fetchedMessageIds, ...state.messageIdsToShow]
    }
  } 
  return state
})

MessageListStore.effects.push(async ({ type, payload }, state) => {
  if (type === 'SELECT_CHAT') {
    const chatId = payload
    log.debug('SELECT CHAT:', chatId)
    const messageIds = await callDcMethodAsync('messageList.getMessageIds', [chatId])
    const startIndex = messageIds.length - PAGE_SIZE
    const endIndex = messageIds.length
    console.log(startIndex, endIndex)
    const messageIdsToShow = messageIds.slice(messageIds.length - PAGE_SIZE, messageIds.length)
    const messages = await callDcMethodAsync('messageList.getMessages', [messageIdsToShow])
    MessageListStore.dispatch({ type: 'NEW_CHAT_SELECTED', payload: {messageIds, messages, messageIdsToShow, page: 1}})
  } else if (type === 'FETCH_MORE_MESSAGES') {
    const page = state.page + 1
    const startIndex = Math.max(state.messageIds.length - (PAGE_SIZE * page), 0)
    const endIndex = state.messageIds.length - (PAGE_SIZE * (page - 1))
    if (endIndex <= startIndex) return
    console.log(startIndex, endIndex)
    const fetchedMessageIds = state.messageIds.slice(startIndex, endIndex)
    if (fetchedMessageIds.length === 0) return

    const fetchedMessages = await callDcMethodAsync('messageList.getMessages', [fetchedMessageIds])
    console.log('fetchedMessages', fetchedMessages)

    MessageListStore.dispatch({
      type: 'FETCHED_MORE_MESSAGES',
      payload: {
        page,
        fetchedMessageIds,
        fetchedMessages
      }
    })

  }
})

MessageListStore.hooks.push(({ type, payload }) => {
  if (type === 'NEW_CHAT_SELECTED') {
    MessageListStore.emit('afterNewChatSelected')
  } else if (type === 'FETCHED_MORE_MESSAGES') {
    MessageListStore.emit('afterFetchedMoreMessages', payload.fetchedMessageIds.length)
  }
})

export default MessageListStore
