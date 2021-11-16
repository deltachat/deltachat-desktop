import { ipcBackend, saveLastChatId } from '../ipc'
import { Store, useStore } from './store'
import { FullChat, MessageType } from '../../shared/shared-types'
import { DeltaBackend } from '../delta-remote'
import { runtime } from '../runtime'
import { ActionEmitter, KeybindAction } from '../keybindings'
import { C } from 'deltachat-node/dist/constants'

export const PAGE_SIZE = 10

class state {
  chat: FullChat | null = null

  messageIds: number[] = []
  messages: { [key: number]: MessageType | null } = {}
  oldestFetchedMessageIndex = -1
  scrollToBottom = false // if true the UI will scroll to bottom
  scrollToBottomIfClose = false
  scrollToLastPage = false // after fetching more messages reset scroll bar to old position
  scrollHeight = 0
  countFetchedMessages = 0
}

const defaultState = new state()

const chatStore = new Store<state>(new state(), 'ChatStore')
const log = chatStore.log

chatStore.attachReducer(({ type, payload, id }, state) => {
  if (type === 'SELECTED_CHAT') {
    return { ...defaultState, ...payload }
  }

  if (typeof id !== 'undefined' && id !== state.chat?.id) {
    log.debug(
      'REDUCER',
      'seems like an old action because the chatId changed in between'
    )
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
      countFetchedMessages: payload.countFetchedMessages,
    }
  } else if (type === 'FETCHED_INCOMING_MESSAGES') {
    return {
      ...state,
      messageIds: payload.messageIds,
      messages: {
        ...state.messages,
        ...payload.messagesIncoming,
      },
      scrollToBottomIfClose: true,
    }
    // type SCROLL_COMPLETE ?
  } else if (type === 'FINISHED_SCROLL') {
    if (payload === 'SCROLLED_TO_LAST_PAGE') {
      return { ...state, scrollToLastPage: false, scrollHeight: 0 }
    } else if (payload === 'SCROLLED_TO_BOTTOM') {
      return { ...state, scrollToBottom: false, scrollToBottomIfClose: false }
    }
  } else if (type === 'UI_DELETE_MESSAGE') {
    const msgId = payload

    const messageIndex = state.messageIds.indexOf(msgId)
    let { oldestFetchedMessageIndex } = state
    if (messageIndex === oldestFetchedMessageIndex) {
      oldestFetchedMessageIndex += 1
    }
    const messageIds = state.messageIds.filter(mId => mId !== msgId)
    return {
      ...state,
      messageIds,
      messages: { ...state.messages, [msgId]: null },
      oldestFetchedMessageIndex,
    }
  } else if (type === 'MESSAGE_CHANGED') {
    return {
      ...state,
      messages: { ...state.messages, ...payload.messagesChanged },
    }
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
        state: C.DC_STATE_OUT_DELIVERED,
      },
    }
    return { ...state, messages }
  } else if (type === 'MESSAGE_FAILED') {
    const messages = {
      ...state.messages,
      [payload]: {
        ...state.messages[payload],
        state: C.DC_STATE_OUT_FAILED,
      },
    }
    return { ...state, messages }
  } else if (type === 'MESSAGE_READ') {
    const messages = {
      ...state.messages,
      [payload]: {
        ...state.messages[payload],
        state: C.DC_STATE_OUT_MDN_RCVD,
      },
    }
    return { ...state, messages }
  } else if (type === 'SET_MESSAGE_IDS') {
    const messageIds = payload
    return { ...state, messageIds }
  }
  return state
})

chatStore.attachEffect(async ({ type, payload }, state) => {
  if (type === 'SELECT_CHAT') {
    const chatId = payload
    // these methods were called in backend before
    // might be an issue if DeltaBackend.call has a significant delay
    const chat = <FullChat>(
      await DeltaBackend.call('chatList.selectChat', chatId)
    )
    if (chat.id === null) {
      log.debug(
        'SELECT CHAT chat does not exsits, id is null. chatId:',
        chat.id
      )
      return
    }
    const messageIds = <number[]>(
      await DeltaBackend.call('messageList.getMessageIds', chatId)
    )
    const oldestFetchedMessageIndex = Math.max(messageIds.length - PAGE_SIZE, 0)
    const newestFetchedMessageIndex = messageIds.length

    const messageIdsToFetch = messageIds.slice(
      oldestFetchedMessageIndex,
      newestFetchedMessageIndex
    )
    const messages = await DeltaBackend.call(
      'messageList.getMessages',
      messageIdsToFetch
    )
    chatStore.dispatch({
      type: 'SELECTED_CHAT',
      payload: {
        chat,
        id: chatId,
        messageIds,
        messages,
        oldestFetchedMessageIndex,
        scrollToBottom: true,
      } as Partial<state>,
    })
    ActionEmitter.emitAction(
      chat.archived
        ? KeybindAction.ChatList_SwitchToArchiveView
        : KeybindAction.ChatList_SwitchToNormalView
    )
    runtime.updateBadge()
    saveLastChatId(chatId)
  } else if (type === 'UI_DELETE_MESSAGE') {
    const msgId = payload
    DeltaBackend.call('messageList.deleteMessage', msgId)
  } else if (type === 'FETCH_MORE_MESSAGES') {
    const oldestFetchedMessageIndex = Math.max(
      state.oldestFetchedMessageIndex - PAGE_SIZE,
      0
    )
    const lastMessageIndexOnLastPage = state.oldestFetchedMessageIndex
    if (lastMessageIndexOnLastPage === 0) {
      log.debug(
        'FETCH_MORE_MESSAGES: lastMessageIndexOnLastPage is zero, returning'
      )
      return
    }
    const fetchedMessageIds = state.messageIds.slice(
      oldestFetchedMessageIndex,
      lastMessageIndexOnLastPage
    )
    if (fetchedMessageIds.length === 0) {
      log.debug(
        'FETCH_MORE_MESSAGES: fetchedMessageIds.length is zero, returning'
      )
      return
    }

    const fetchedMessages = await DeltaBackend.call(
      'messageList.getMessages',
      fetchedMessageIds
    )

    chatStore.dispatch({
      type: 'FETCHED_MORE_MESSAGES',
      payload: {
        fetchedMessages,
        oldestFetchedMessageIndex,
        countFetchedMessages: fetchedMessageIds.length,
        scrollHeight: payload.scrollHeight,
      },
    })
  } else if (type === 'SEND_MESSAGE') {
    if (payload[0] !== chatStore.state.chat?.id) return
    const messageObj = await DeltaBackend.call(
      'messageList.sendMessage',
      payload[0],
      payload[1]
    )

    // Workaround for failed messages
    if (messageObj[0] === 0) return
    chatStore.dispatch({
      type: 'MESSAGE_SENT',
      payload: messageObj,
      id: payload[0],
    })
  } else if (type === 'MUTE') {
    if (payload[0] !== chatStore.state.chat?.id) return
    if (
      !(await DeltaBackend.call('chat.setMuteDuration', payload[0], payload[1]))
    ) {
      return
    }
  }
})

ipcBackend.on('DC_EVENT_CHAT_MODIFIED', async (_evt, [chatId]) => {
  const state = chatStore.getState()
  if (state.chat?.id !== chatId) {
    return
  }
  chatStore.dispatch({
    type: 'MODIFIED_CHAT',
    payload: {
      chat: await DeltaBackend.call('chatList.getFullChatById', chatId),
    } as Partial<state>,
  })
})

ipcBackend.on('DC_EVENT_MSG_DELIVERED', (_evt, [id, msgId]) => {
  chatStore.dispatch({
    type: 'MESSAGE_DELIVERED',
    id,
    payload: msgId,
  })
})

ipcBackend.on('DC_EVENT_MSG_FAILED', async (_evt, [chatId, msgId]) => {
  const state = chatStore.getState()
  if (state.chat?.id !== chatId) return
  if (!state.messageIds.includes(msgId)) {
    // Hacking around https://github.com/deltachat/deltachat-desktop/issues/1361#issuecomment-776291299
    const messageObj = [
      msgId,
      await DeltaBackend.call('messageList.getMessage', msgId),
    ]
    chatStore.dispatch({
      type: 'MESSAGE_SENT',
      payload: messageObj,
      id: chatId,
    })
  }
  chatStore.dispatch({
    type: 'MESSAGE_FAILED',
    id: chatId,
    payload: msgId,
  })
})

ipcBackend.on('DC_EVENT_INCOMING_MSG', async (_, [chatId, _messageId]) => {
  if (chatId !== chatStore.state.chat?.id) {
    log.debug(
      `DC_EVENT_INCOMING_MSG chatId of event (${chatId}) doesn't match id of selected chat (${chatStore.state.chat?.id}). Skipping.`
    )
    return
  }
  const messageIds = <number[]>(
    await DeltaBackend.call('messageList.getMessageIds', chatId)
  )
  const messageIdsIncoming = messageIds.filter(
    x => !chatStore.state.messageIds.includes(x)
  )
  const messagesIncoming = await DeltaBackend.call(
    'messageList.getMessages',
    messageIdsIncoming
  )
  chatStore.dispatch({
    type: 'FETCHED_INCOMING_MESSAGES',
    payload: {
      messageIds,
      messageIdsIncoming,
      messagesIncoming,
    },
  })
})

ipcBackend.on('DC_EVENT_MSG_READ', (_evt, [id, msgId]) => {
  chatStore.dispatch({
    type: 'MESSAGE_READ',
    id,
    payload: msgId,
  })
})

ipcBackend.on('DC_EVENT_MSGS_CHANGED', async (_, [id, messageId]) => {
  log.debug('DC_EVENT_MSGS_CHANGED', id, messageId)
  if (id === 0 && messageId === 0) {
    const chatId = chatStore.state.chat?.id
    if (chatId === null || chatId === undefined) {
      return
    }
    const messageIds = await DeltaBackend.call(
      'messageList.getMessageIds',
      chatId
    )

    chatStore.dispatch({
      type: 'SET_MESSAGE_IDS',
      id: chatId,
      payload: messageIds,
    })
    return
  }
  if (id !== chatStore.state.chat?.id) return
  if (chatStore.state.messageIds.indexOf(messageId) !== -1) {
    log.debug(
      'DC_EVENT_MSGS_CHANGED',
      'changed message seems to be message we already know'
    )
    const messagesChanged = await DeltaBackend.call('messageList.getMessages', [
      messageId,
    ])
    chatStore.dispatch({
      type: 'MESSAGE_CHANGED',
      payload: {
        messageId,
        messagesChanged,
      },
    })
  } else {
    log.debug(
      'DC_EVENT_MSGS_CHANGED',
      'changed message seems to be a new message'
    )
    const messageIds = <number[]>(
      await DeltaBackend.call('messageList.getMessageIds', id)
    )
    const messageIdsIncoming = messageIds.filter(
      x => !chatStore.state.messageIds.includes(x)
    )
    const messagesIncoming = await DeltaBackend.call(
      'messageList.getMessages',
      messageIdsIncoming
    )
    chatStore.dispatch({
      type: 'FETCHED_INCOMING_MESSAGES',
      payload: {
        messageIds,
        messageIdsIncoming,
        messagesIncoming,
      },
    })
  }
})

ipcBackend.on('ClickOnNotification', (_ev, { chatId }) => {
  selectChat(chatId)
})

export const useChatStore = () => useStore(chatStore)
export const useChatStore2 = () => {
  const [selectedChat, chatStoreDispatch] = useStore(chatStore)
  return { selectedChat, chatStoreDispatch }
}

export const selectChat = (chatId: number) =>
  chatStore.dispatch({ type: 'SELECT_CHAT', payload: chatId })

export default chatStore

export type ChatStoreDispatch = Store<state>['dispatch']

export type ChatStoreState = typeof state.prototype

export type ChatStoreStateWithChatSet = {
  chat: NonNullable<ChatStoreState['chat']>
} & Exclude<ChatStoreState, 'chat'>
