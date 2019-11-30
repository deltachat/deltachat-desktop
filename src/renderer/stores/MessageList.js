import { ipcRenderer } from 'electron'
import { callDcMethodAsync } from '../ipc'
import EventEmitterStore from './EventEmitterStore'
import logger from '../../logger'
const log = logger.getLogger('renderer/stores/MessageList')

const defaultState = {
  messageIds: [],
  messages: {},
  messageIdsToShow: [],
  pages: 0
}


const MessageListStore = new EventEmitterStore(defaultState)

// remove the message from state immediately
MessageListStore.reducers.push(({ type, payload}, state) => {
  if (type === 'SELECT_CHAT') {
    return defaultState
  } else if (type === 'NEW_CHAT_SELECTED') {
    return { ...state, ...payload }
  }
  return state
})

MessageListStore.effects.push(async ({ type, payload }) => {
  if (type === 'SELECT_CHAT') {
    const chatId = payload
    log.debug('SELECT CHAT:', chatId)
    const messageIds = await callDcMethodAsync('messageList.getMessageIds', [chatId])
    const messageIdsToShow = messageIds.slice(messageIds.length - 30, messageIds.length)
    const messages = await callDcMethodAsync('messageList.getMessages', [messageIdsToShow])
    MessageListStore.dispatch({ type: 'NEW_CHAT_SELECTED', payload: {messageIds, messages, messageIdsToShow}})
  }
})

MessageListStore.hooks.push(({ type, paload }) => {
  if (type === 'NEW_CHAT_SELECTED') {
    MessageListStore.emit('NEW_CHAT_SELECTED')
  }
})

export default MessageListStore
