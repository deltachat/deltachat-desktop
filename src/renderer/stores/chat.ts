import { ipcBackend, saveLastChatId } from '../ipc'
import { Store, useStore } from './store'
import { FullChat, MessageType } from '../../shared/shared-types'
import { DeltaBackend, sendMessageParams } from '../delta-remote'
import { runtime } from '../runtime'
import { ActionEmitter, KeybindAction } from '../keybindings'
import { C } from 'deltachat-node/dist/constants'

export const PAGE_SIZE = 10

export interface ChatStoreState {
  chat: FullChat | null
  messageIds: number[]
  messages: { [key: number]: MessageType | null }
  oldestFetchedMessageIndex: number
  scrollToBottom: boolean // if true the UI will scroll to bottom
  scrollToBottomIfClose: boolean
  scrollToLastPage: boolean // after fetching more messages reset scroll bar to old position
  scrollHeight: number
  countFetchedMessages: number
}

const defaultState: ChatStoreState = {
  chat: null,
  messageIds: [],
  messages: {},
  oldestFetchedMessageIndex: -1,
  scrollToBottom: false,
  scrollToBottomIfClose: false,
  scrollToLastPage: false,
  scrollHeight: 0,
  countFetchedMessages: 0,
}

function guardReducerIfChatIdIsDifferent(
  payload: { id: number },
  state: ChatStoreState
) {
  if (typeof payload.id !== 'undefined' && payload.id !== state.chat?.id) {
    log.debug(
      'REDUCER',
      'seems like an old action because the chatId changed in between'
    )
    return true
  }
  return false
}

class ChatStore extends Store<ChatStoreState> {
  reducer = {
    selectedChat: (payload: Partial<ChatStoreState>) => {
      this.setState(_ => {
        return {
          ...defaultState,
          ...payload,
        }
      }, 'selectedChat')
    },
    unselectChat: () => {
      this.setState(_ => {
        return { ...defaultState }
      }, 'unselectChat')
    },
    modifiedChat: (payload: { id: number } & Partial<ChatStoreState>) => {
      this.setState(state => {
        if (guardReducerIfChatIdIsDifferent(payload, state)) return
        return {
          ...state,
          ...payload,
        }
      }, 'modifiedChat')
    },
    fetchedMoreMessages: (payload: {
      id: number
      fetchedMessages: ChatStoreState['messages']
      scrollHeight: number
      countFetchedMessages: number
      oldestFetchedMessageIndex: number
    }) => {
      this.setState(state => {
        if (guardReducerIfChatIdIsDifferent(payload, state)) return
        return {
          ...state,
          messages: { ...state.messages, ...payload.fetchedMessages },
          oldestFetchedMessageIndex: payload.oldestFetchedMessageIndex,
          scrollToLastPage: true,
          scrollHeight: payload.scrollHeight,
          countFetchedMessages: payload.countFetchedMessages,
        }
      }, 'fetchedMoreMessages')
    },
    fetchedIncomingMessages: (payload: {
      id: number
      messageIds: ChatStoreState['messageIds']
      messagesIncoming: ChatStoreState['messages']
    }) => {
      this.setState(state => {
        if (guardReducerIfChatIdIsDifferent(payload, state)) return
        return {
          ...state,
          messageIds: payload.messageIds,
          messages: {
            ...state.messages,
            ...payload.messagesIncoming,
          },
          scrollToBottomIfClose: true,
        }
      }, 'fetchedIncomingMessages')
    },
    scrolledToLastPage: () => {
      log.debug('scrolledToLastPage')
      this.setState(state => {
        return {
          ...state,
          scrollToLastPage: false,
          scrollHeight: 0,
        }
      }, 'scrolledToLastPage')
    },
    scrolledToBottom: () => {
      log.debug('scrolledToBottom')
      this.setState(state => {
        return {
          ...state,
          scrollToBottom: false,
          scrollToBottomIfClose: false,
        }
      }, 'scrolledToBottom')
    },
    uiDeleteMessage: (payload: { id: number; msgId: number }) => {
      this.setState(state => {
        const { msgId } = payload
        const messageIndex = state.messageIds.indexOf(msgId)
        let { oldestFetchedMessageIndex } = state
        if (messageIndex === oldestFetchedMessageIndex) {
          oldestFetchedMessageIndex += 1
        }
        const messageIds = state.messageIds.filter(mId => mId !== msgId)
        if (guardReducerIfChatIdIsDifferent(payload, state)) return
        return {
          ...state,
          messageIds,
          messages: { ...state.messages, [msgId]: null },
          oldestFetchedMessageIndex,
        }
      }, 'uiDeleteMessage')
    },
    messageChanged: (payload: {
      id: number
      messagesChanged: ChatStoreState['messages']
    }) => {
      this.setState(state => {
        if (guardReducerIfChatIdIsDifferent(payload, state)) return
        return {
          ...state,
          messages: { ...state.messages, ...payload.messagesChanged },
        }
      }, 'messageChanged')
    },
    messageSent: (payload: {
      id: number
      messageId: number
      message: MessageType
    }) => {
      const { messageId, message } = payload
      this.setState(state => {
        const messageIds = [...state.messageIds, messageId]
        const messages = { ...state.messages, [messageId]: message }
        if (guardReducerIfChatIdIsDifferent(payload, state)) return
        return { ...state, messageIds, messages, scrollToBottom: true }
      }, 'messageSent')
    },
    setMessageState: (payload: {
      id: number
      messageId: number
      messageState: number
    }) => {
      const { messageId, messageState } = payload
      this.setState(state => {
        const message = state.messages[messageId]
        if (message === null) return
        const updatedMessage: MessageType = {
          ...message,
          state: messageState,
        }
        return {
          ...state,
          messages: {
            ...state.messages,
            [messageId]: updatedMessage,
          },
        }
      }, 'setMessageState')
    },
    setMessageIds: (payload: { id: number; messageIds: number[] }) => {
      this.setState(state => {
        if (guardReducerIfChatIdIsDifferent(payload, state)) return
        return {
          ...state,
          messageIds: payload.messageIds,
        }
      }, 'setMessageIds')
    },
  }
  effect = {
    selectChat: async (chatId: number) => {
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
      const oldestFetchedMessageIndex = Math.max(
        messageIds.length - PAGE_SIZE,
        0
      )
      const newestFetchedMessageIndex = messageIds.length

      const messageIdsToFetch = messageIds.slice(
        oldestFetchedMessageIndex,
        newestFetchedMessageIndex
      )
      const messages = await DeltaBackend.call(
        'messageList.getMessages',
        messageIdsToFetch
      )

      chatStore.reducer.selectedChat({
        chat,
        messages,
        messageIds,
        oldestFetchedMessageIndex,
        scrollToBottom: true,
      })
      ActionEmitter.emitAction(
        chat.archived
          ? KeybindAction.ChatList_SwitchToArchiveView
          : KeybindAction.ChatList_SwitchToNormalView
      )
      runtime.updateBadge()
      saveLastChatId(chatId)
    },
    uiDeleteMessage: (msgId: number) => {
      DeltaBackend.call('messageList.deleteMessage', msgId)
      if (!this.state.chat) return
      const id = this.state.chat.id
      this.reducer.uiDeleteMessage({ id, msgId })
    },
    fetchMoreMessages: async (scrollHeight: number) => {
      log.debug(`fetchMoreMessages ${scrollHeight}`)
      const state = this.state
      if (state.chat === null) return
      const id = state.chat.id
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

      chatStore.reducer.fetchedMoreMessages({
        id,
        fetchedMessages,
        oldestFetchedMessageIndex,
        countFetchedMessages: fetchedMessageIds.length,
        scrollHeight: scrollHeight,
      })
    },
    mute: async (payload: { chatId: number; muteDuration: number }) => {
      if (payload.chatId !== chatStore.state.chat?.id) return
      if (
        !(await DeltaBackend.call(
          'chat.setMuteDuration',
          payload.chatId,
          payload.muteDuration
        ))
      ) {
        return
      }
    },
    sendMessage: async (payload: {
      chatId: number
      message: sendMessageParams
    }) => {
      if (payload.chatId !== chatStore.state.chat?.id) return
      const messageObj = await DeltaBackend.call(
        'messageList.sendMessage',
        payload.chatId,
        payload.message
      )

      // Workaround for failed messages
      if (messageObj[0] === 0) return
      if (messageObj[1] === null) return
      chatStore.reducer.messageSent({
        messageId: messageObj[0],
        message: messageObj[1],
        id: payload.chatId,
      })
    },
  }
}

const chatStore = new ChatStore({ ...defaultState }, 'ChatStore')

chatStore.dispatch = (..._args) => {
  throw new Error('Deprecated')
}

const log = chatStore.log

ipcBackend.on('DC_EVENT_CHAT_MODIFIED', async (_evt, [chatId]) => {
  const state = chatStore.getState()
  if (state.chat?.id !== chatId) {
    return
  }
  chatStore.reducer.modifiedChat({
    id: chatId,
    chat: await DeltaBackend.call('chatList.getFullChatById', chatId),
  })
})

ipcBackend.on('DC_EVENT_MSG_DELIVERED', (_evt, [id, msgId]) => {
  chatStore.reducer.setMessageState({
    id,
    messageId: msgId,
    messageState: C.DC_STATE_OUT_DELIVERED,
  })
})

ipcBackend.on('DC_EVENT_MSG_FAILED', async (_evt, [chatId, msgId]) => {
  const state = chatStore.getState()
  if (state.chat?.id !== chatId) return
  if (!state.messageIds.includes(msgId)) {
    // Hacking around https://github.com/deltachat/deltachat-desktop/issues/1361#issuecomment-776291299
    const message = await DeltaBackend.call('messageList.getMessage', msgId)
    if (message === null) return

    chatStore.reducer.messageSent({
      id: chatId,
      messageId: msgId,
      message,
    })
  }
  chatStore.reducer.setMessageState({
    id: chatId,
    messageId: msgId,
    messageState: C.DC_STATE_OUT_FAILED,
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
  chatStore.reducer.fetchedIncomingMessages({
    id: chatId,
    messageIds,
    messagesIncoming,
  })
})

ipcBackend.on('DC_EVENT_MSG_READ', (_evt, [id, msgId]) => {
  chatStore.reducer.setMessageState({
    id,
    messageId: msgId,
    messageState: C.DC_STATE_OUT_MDN_RCVD,
  })
})

ipcBackend.on('DC_EVENT_MSGS_CHANGED', async (_, [id, messageId]) => {
  log.debug('DC_EVENT_MSGS_CHANGED', id, messageId)
  const chatId = chatStore.state.chat?.id
  if (chatId === null || chatId === undefined) {
    return
  }
  if (id === 0 && messageId === 0) {
    const messageIds = await DeltaBackend.call(
      'messageList.getMessageIds',
      chatId
    )

    chatStore.reducer.setMessageIds({
      id: chatId,
      messageIds,
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
    chatStore.reducer.messageChanged({
      id: chatId,
      messagesChanged,
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
    chatStore.reducer.fetchedIncomingMessages({
      id: chatId,
      messageIds,
      messagesIncoming,
    })
  }
})

ipcBackend.on('ClickOnNotification', (_ev, { chatId }) => {
  chatStore.effect.selectChat(chatId)
})

export const useChatStore = () => useStore(chatStore)[0]
export const useChatStore2 = () => {
  const [selectedChat, _chatStoreDispatch] = useStore(chatStore)
  return { selectedChat }
}

export default chatStore

export type ChatStoreDispatch = Store<ChatStoreState>['dispatch']

export type ChatStoreStateWithChatSet = {
  chat: NonNullable<ChatStoreState['chat']>
} & Exclude<ChatStoreState, 'chat'>
