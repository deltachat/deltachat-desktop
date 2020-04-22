import { ipcBackend, mainProcessUpdateBadge, saveLastChatId } from '../ipc'
import { Store, useStore, Action } from './store'
import { JsonContact, FullChat } from '../../shared/shared-types'
import { DeltaBackend } from '../delta-remote'

export const PAGE_SIZE = 10

class state implements FullChat {
  contactIds: number[]
  isDeviceChat: boolean
  selfInGroup: boolean
  id: number | null = null
  name = ''
  isVerified = false
  profileImage: string = null

  archived = false
  subtitle = ''
  type: number = null
  isUnpromoted = false
  isSelfTalk = false

  contacts: JsonContact[] = []
  color = ''
  // summary = undefined
  freshMessageCounter = 0
  isGroup = false
  isDeaddrop = false
  draft: string | null = null

  messageIds: number[] = []
  messages: { [key: number]: todo } = {}
  oldestFetchedMessageIndex = -1
  scrollToBottom = false // if true the UI will scroll to bottom
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

  if (typeof id !== 'undefined' && id !== state.id) {
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
      scrollToBottom: true,
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
        msg: {
          ...state.messages[payload].msg,
          status: 'delivered',
        },
      },
    }
    return { ...state, messages }
  } else if (type === 'MESSAGE_READ') {
    const messages = {
      ...state.messages,
      [payload]: {
        ...state.messages[payload],
        msg: {
          ...state.messages[payload].msg,
          status: 'read',
        },
      },
    }
    return { ...state, messages }
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
        ...chat,
        id: chatId,
        messageIds,
        messages,
        oldestFetchedMessageIndex,
        scrollToBottom: true,
      },
    })
    mainProcessUpdateBadge()
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
    if (lastMessageIndexOnLastPage === 0) return
    const fetchedMessageIds = state.messageIds.slice(
      oldestFetchedMessageIndex,
      lastMessageIndexOnLastPage
    )
    if (fetchedMessageIds.length === 0) return

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
    if (payload[0] !== chatStore.state.id) return
    const messageObj = await DeltaBackend.call(
      'messageList.sendMessage',
      ...payload /* [chatId, text, filename, location]*/
    )
    chatStore.dispatch({
      type: 'MESSAGE_SENT',
      payload: messageObj,
      id: payload[0],
    })
  }
})

ipcBackend.on('DD_EVENT_CHAT_MODIFIED', (evt, payload) => {
  const { chatId, chat } = payload
  const state = chatStore.getState()
  if (state.id !== chatId) {
    return
  }
  chatStore.dispatch({
    type: 'MODIFIED_CHAT',
    payload: {
      profileImage: chat.profileImage,
      name: chat.name,
      subtitle: chat.subtitle,
      contacts: chat.contacts,
      selfInGroup: chat.selfInGroup,
    },
  })
})

ipcBackend.on('DC_EVENT_MSG_DELIVERED', (evt, [id, msgId]) => {
  chatStore.dispatch({
    type: 'MESSAGE_DELIVERED',
    id,
    payload: msgId,
  })
})

ipcBackend.on('DC_EVENT_INCOMING_MSG', async (_, [chatId, messageId]) => {
  if (chatId !== chatStore.state.id) {
    log.debug(
      `DC_EVENT_INCOMING_MSG chatId of event (${chatId}) doesn't match id of selected chat (${chatStore.state.id}). Skipping.`
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

ipcBackend.on('DC_EVENT_MSG_READ', (evt, [id, msgId]) => {
  chatStore.dispatch({
    type: 'MESSAGE_READ',
    id,
    payload: msgId,
  })
})

ipcBackend.on('DC_EVENT_MSGS_CHANGED', async (_, [id, messageId]) => {
  log.debug('DC_EVENT_MSGS_CHANGED', id, messageId)
  if (id !== chatStore.state.id) return
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

ipcBackend.on('ClickOnNotification', (ev, { chatId }) => {
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
