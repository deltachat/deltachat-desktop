import { ipcBackend, saveLastChatId } from '../ipc'
import { Store, useStore } from './store'
import { FullChat, MessageType } from '../../shared/shared-types'
import { DeltaBackend, sendMessageParams } from '../delta-remote'
import { runtime } from '../runtime'
import { ActionEmitter, KeybindAction } from '../keybindings'
import { C } from 'deltachat-node/dist/constants'
import { OrderedMap } from 'immutable'

export const PAGE_SIZE = 10

export interface MessagePage {
  pageKey: string
  messages: OrderedMap<number, MessageType | null>
}

type ScrollTo = ScrollToMessage |null

interface ScrollToMessage {
  type: 'scrollToMessage',
  msgId: number
}

export interface ChatStoreState {
  chat: FullChat | null
  messageIds: number[]
  messagePages: MessagePage[]
  oldestFetchedMessageIndex: number
  scrollTo: ScrollTo,
  scrollToBottom: boolean // if true the UI will scroll to bottom
  scrollToBottomIfClose: boolean
  scrollToLastPage: boolean // after fetching more messages reset scroll bar to old position
  lastKnownScrollHeight: number
  lastKnownScrollTop: number
  countFetchedMessages: number
}

const defaultState: ChatStoreState = {
  chat: null,
  messageIds: [],
  messagePages: [],
  oldestFetchedMessageIndex: -1,
  scrollTo: null,
  scrollToBottom: false,
  scrollToBottomIfClose: false,
  scrollToLastPage: false,
  lastKnownScrollHeight: -1,
  lastKnownScrollTop: -1,
  countFetchedMessages: 0,
}

function getLastKnownScrollPosition() {
  //@ts-ignore
  const { scrollHeight, scrollTop } = document.querySelector('#message-list')
  return {
    lastKnownScrollHeight: scrollHeight,
    lastKnownScrollTop: scrollTop,
  }
}

interface ChatStoreLocks {
  scroll: boolean
}

class ChatStore extends Store<ChatStoreState> {
  __locks: ChatStoreLocks = {
    scroll: false,
  }

  lockUnlock(key: keyof ChatStoreLocks) {
    this.__locks[key] = false
  }

  lockLock(key: keyof ChatStoreLocks) {
    this.__locks[key] = true
  }

  lockIsLocked(key: keyof ChatStoreLocks) {
    return this.__locks[key]
  }
  guardReducerTriesToAddDuplicatePageKey(pageKeyToAdd: string) {
    const isDuplicatePageKey =
      this.state.messagePages.findIndex(
        messagePage => messagePage.pageKey === pageKeyToAdd
      ) !== -1
    return isDuplicatePageKey
  }
  guardReducerIfChatIdIsDifferent(payload: { id: number }) {
    if (
      typeof payload.id !== 'undefined' &&
      payload.id !== this.state.chat?.id
    ) {
      log.debug(
        'REDUCER',
        'seems like an old action because the chatId changed in between'
      )
      return true
    }
    return false
  }
  reducer = {
    selectedChat: (payload: Partial<ChatStoreState>) => {
      this.setState(_ => {
        this.lockUnlock('scroll')
        return {
          ...defaultState,
          ...payload,
        }
      }, 'selectedChat')
    },
    unselectChat: () => {
      this.setState(_ => {
        this.lockUnlock('scroll')
        return { ...defaultState }
      }, 'unselectChat')
    },
    modifiedChat: (payload: { id: number } & Partial<ChatStoreState>) => {
      this.setState(state => {
        const modifiedState = {
          ...state,
          ...payload,
        }
        if (this.guardReducerIfChatIdIsDifferent(payload)) return
        return modifiedState
      }, 'modifiedChat')
    },
    fetchedMessagePage: (payload: {
      id: number
      fetchedMessagePage: MessagePage
      countFetchedMessages: number
      oldestFetchedMessageIndex: number
    }) => {
      this.setState(state => {
        const {
          lastKnownScrollHeight,
          lastKnownScrollTop,
        } = getLastKnownScrollPosition()

        const modifiedState = {
          ...state,
          messagePages: [payload.fetchedMessagePage, ...state.messagePages],
          oldestFetchedMessageIndex: payload.oldestFetchedMessageIndex,
          scrollToLastPage: true,
          lastKnownScrollHeight,
          lastKnownScrollTop,
          countFetchedMessages: payload.countFetchedMessages,
        }
        if (this.guardReducerIfChatIdIsDifferent(payload)) return
        return modifiedState
      }, 'fetchedMessagePage')
    },
    fetchedIncomingMessages: (payload: {
      id: number
      messageIds: ChatStoreState['messageIds']
      messagesIncoming: MessageType[]
    }) => {
      this.setState(state => {
        const messages: OrderedMap<
          number,
          MessageType | null
        > = OrderedMap().withMutations(messages => {
          for (const messageIncoming of payload.messagesIncoming) {
            messages.set(messageIncoming.id, messageIncoming)
          }
        }) as OrderedMap<number, MessageType | null>

        const incomingPageKey = calculatePageKey(messages)
        const incomingMessagePage: MessagePage = {
          pageKey: incomingPageKey,
          messages,
        }
        const {
          lastKnownScrollHeight,
          lastKnownScrollTop,
        } = getLastKnownScrollPosition()

        const modifiedState = {
          ...state,
          messageIds: payload.messageIds,
          messagePages: [...state.messagePages, incomingMessagePage],
          lastKnownScrollHeight,
          lastKnownScrollTop,
          scrollToBottomIfClose: true,
        }

        if (this.guardReducerTriesToAddDuplicatePageKey(incomingPageKey)) {
          throw new Error(
            'We almost added the same page twice! We should prevent this in code duplicate pageKey: ' +
              incomingPageKey
          )
        }

        if (this.guardReducerIfChatIdIsDifferent(payload)) return

        return modifiedState
      }, 'fetchedIncomingMessages')
    },
    scrolledToLastPage: (payload: { id: number }) => {
      log.debug('scrolledToLastPage')
      this.setState(state => {
        const modifiedState = {
          ...state,
          scrollToLastPage: false,
          lastKnownScrollHeight: -1,
          lastKnownScrollTop: -1,
        }
        if (this.guardReducerIfChatIdIsDifferent(payload)) return
        this.lockUnlock('scroll')
        return modifiedState
      }, 'scrolledToLastPage')
    },
    scrolledToBottom: (payload: { id: number }) => {
      log.debug('scrolledToBottom')
      this.setState(state => {
        const modifiedState = {
          ...state,
          scrollToBottom: false,
          scrollToBottomIfClose: false,
        }
        if (this.guardReducerIfChatIdIsDifferent(payload)) return
        this.lockUnlock('scroll')
        return modifiedState
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
        const modifiedState = {
          ...state,
          messageIds,
          messagePages: state.messagePages.map(messagePage => {
            if (messagePage.messages.has(msgId)) {
              return {
                ...messagePage,
                messages: messagePage.messages.set(msgId, null),
              }
            }
            return messagePage
          }),
          oldestFetchedMessageIndex,
        }
        if (this.guardReducerIfChatIdIsDifferent(payload)) return
        return modifiedState
      }, 'uiDeleteMessage')
    },
    messageChanged: (payload: {
      id: number
      messagesChanged: MessageType[]
    }) => {
      this.setState(state => {
        const modifiedState = {
          ...state,
          messagePages: state.messagePages.map(messagePage => {
            const returnMessagePage = messagePage
            returnMessagePage.messages = returnMessagePage.messages.withMutations(
              messages => {
                for (const changedMessage of payload.messagesChanged) {
                  if (!messages.has(changedMessage.id)) continue
                  messages.set(changedMessage.id, changedMessage)
                }
              }
            )
            return returnMessagePage
          }),
        }
        if (this.guardReducerIfChatIdIsDifferent(payload)) return
        return modifiedState
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
        const messagePages: MessagePage[] = [
          ...state.messagePages,
          {
            pageKey: `page-${messageId}-${messageId}`,
            messages: OrderedMap().set(messageId, message) as OrderedMap<
              number,
              MessageType | null
            >,
          },
        ]
        const modifiedState = {
          ...state,
          messageIds,
          messagePages,
          scrollToBottom: true,
        }
        if (this.guardReducerIfChatIdIsDifferent(payload)) return
        return modifiedState
      }, 'messageSent')
    },
    setMessageState: (payload: {
      id: number
      messageId: number
      messageState: number
    }) => {
      const { messageId, messageState } = payload
      this.setState(state => {
        const modifiedState = {
          ...state,
          messagePages: state.messagePages.map(messagePage => {
            if (messagePage.messages.has(messageId)) {
              const message = messagePage.messages.get(messageId)
              if (message !== null && message !== undefined) {
                const updatedMessages = messagePage.messages.set(messageId, {
                  ...message,
                  state: messageState,
                })

                return {
                  ...messagePage,
                  messages: updatedMessages,
                }
              }
            }

            return messagePage
          }),
        }
        if (this.guardReducerIfChatIdIsDifferent(payload)) return
        return modifiedState
      }, 'setMessageState')
    },
    setMessageIds: (payload: { id: number; messageIds: number[] }) => {
      this.setState(state => {
        const modifiedState = {
          ...state,
          messageIds: payload.messageIds,
        }
        if (this.guardReducerIfChatIdIsDifferent(payload)) return
        return modifiedState
      }, 'setMessageIds')
    },
  }

  lockedEffect<R>(
    lockName: keyof ChatStoreLocks,
    effect: () => Promise<R & boolean>,
    effectName: string
  ): () => Promise<any> {
    return async () => {
      if (this.lockIsLocked(lockName) === true) {
        log.debug(`lockedEffect: ${effectName}: We're locked, returning`)
        return false
      }

      log.debug(`lockedEffect: ${effectName}: locking`)
      this.lockLock(lockName)
      const returnValue = await effect()
      if (returnValue === false) {
        log.debug(
          `lockedEffect: ${effectName}: return value was false, unlocking`
        )
        this.lockUnlock(lockName)
      }
      return returnValue
    }
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

      let oldestFetchedMessageIndex = -1
      let messagePages: MessagePage[] = []
      if (messageIds.length !== 0) {
        oldestFetchedMessageIndex = Math.max(messageIds.length - PAGE_SIZE, 0)
        const newestFetchedMessageIndex = messageIds.length

        const messageIdsToFetch = messageIds.slice(
          oldestFetchedMessageIndex,
          newestFetchedMessageIndex
        )
        const _messages = await DeltaBackend.call(
          'messageList.getMessages',
          messageIdsToFetch
        )

        const messages = OrderedMap().withMutations(messagePages => {
          messageIdsToFetch.forEach(messageId => {
            messagePages.set(messageId, _messages[messageId])
          })
        }) as OrderedMap<number, MessageType | null>

        messagePages = [
          {
            pageKey: calculatePageKey(messages),
            messages,
          },
        ]
      }

      chatStore.reducer.selectedChat({
        chat,
        messagePages,
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
    jumpToMessage: async (msgId: number) => {
      // these methods were called in backend before
      // might be an issue if DeltaBackend.call has a significant delay
      const _message = await DeltaBackend.call('messageList.getMessages', [msgId])

      const message = _message[msgId] as MessageType
      if (message === null || message === undefined) {
        throw new Error('jumpToMessage: Tried to jump to non existing message with id: ' + msgId)
      }

      const chatId = (message as MessageType).chatId

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

      const jumpToMessageIndex = messageIds.indexOf(msgId)

      let oldestFetchedMessageIndex = -1
      let newestFetchedMessageIndex = -1
      let messagePages: MessagePage[] = []
      if (messageIds.length !== 0) {
        oldestFetchedMessageIndex = Math.max(jumpToMessageIndex - (PAGE_SIZE / 2), 0)
        newestFetchedMessageIndex = Math.min(jumpToMessageIndex + (PAGE_SIZE / 2), messageIds.length - 1)

        const messageIdsToFetch = messageIds.slice(
          oldestFetchedMessageIndex,
          newestFetchedMessageIndex
        )
        const _messages = await DeltaBackend.call(
          'messageList.getMessages',
          messageIdsToFetch
        )

        const messages = OrderedMap().withMutations(messagePages => {
          messageIdsToFetch.forEach(messageId => {
            messagePages.set(messageId, _messages[messageId])
          })
        }) as OrderedMap<number, MessageType | null>

        messagePages = [
          {
            pageKey: calculatePageKey(messages),
            messages,
          },
        ]
      }

      chatStore.reducer.selectedChat({
        chat,
        messagePages,
        messageIds,
        oldestFetchedMessageIndex,
        scrollTo: {
          type: 'scrollToMessage',
          msgId
        }
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
    fetchMoreMessages: this.lockedEffect<boolean>(
      'scroll',
      async () => {
        log.debug(`fetchMoreMessages`)
        const state = this.state
        if (state.chat === null) {
          return false
        }
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
          return false
        }
        const fetchedMessageIds = state.messageIds.slice(
          oldestFetchedMessageIndex,
          lastMessageIndexOnLastPage
        )
        if (fetchedMessageIds.length === 0) {
          log.debug(
            'FETCH_MORE_MESSAGES: fetchedMessageIds.length is zero, returning'
          )
          return false
        }

        const fetchedMessages = await DeltaBackend.call(
          'messageList.getMessages',
          fetchedMessageIds
        )

        const messages = OrderedMap().withMutations(messages => {
          fetchedMessageIds.forEach(messageId => {
            messages.set(messageId, fetchedMessages[messageId])
          })
        }) as OrderedMap<number, MessageType | null>

        const fetchedMessagePage: MessagePage = {
          pageKey: calculatePageKey(messages),
          messages,
        }

        chatStore.reducer.fetchedMessagePage({
          id,
          fetchedMessagePage,
          oldestFetchedMessageIndex,
          countFetchedMessages: fetchedMessageIds.length,
        })
        return true
      },
      'fetchMoreMessages'
    ),
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

  stateToHumanReadable(state: ChatStoreState): any {
    return {
      //...state,
      ...state,
      messagePages: state.messagePages.map(messagePage => {
        return {
          ...messagePage,
          messages: messagePage.messages.toArray().map(([msgId, message]) => {
            return [
              msgId,
              message === null || message === undefined
                ? null
                : {
                    messageId: message.id,
                    messsage: message.text,
                  },
            ]
          }),
        }
      }),
    }
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
  const _messagesIncoming = await DeltaBackend.call(
    'messageList.getMessages',
    messageIdsIncoming
  )
  const messagesIncoming = messageIdsIncoming.map(
    messageId => _messagesIncoming[messageId]
  ) as MessageType[]

  if (messagesIncoming.length === 0) {
    log.debug(
      'DC_EVENT_INCOMING_MSG, actually no new messages for us, returning'
    )
    return
  }

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

    const message = messagesChanged[messageId]
    if (message === null) return

    chatStore.reducer.messageChanged({
      id: chatId,
      messagesChanged: [message],
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
    const _messagesIncoming = await DeltaBackend.call(
      'messageList.getMessages',
      messageIdsIncoming
    )

    const messagesIncoming = messageIdsIncoming
      .map(messageId =>
        _messagesIncoming[messageId] === undefined
          ? null
          : _messagesIncoming[messageId]
      )
      .filter(message => message !== null) as MessageType[]

    if (messagesIncoming.length === 0) {
      log.debug(
        'DC_EVENT_MSGS_CHANGED actually no new messages for us, returning'
      )
      return
    }

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

export function calculatePageKey(
  messages: OrderedMap<number, MessageType | null>
): string {
  const first = messages.find(
    message => message !== null && message !== undefined
  )
  const last = messages.findLast(
    message => message !== null && message !== undefined
  )
  let firstId = 'undefined'
  if (first) {
    firstId = first.id.toString()
  } else {
    throw new Error(
      `first message is null/undefined ${JSON.stringify(
        messages.toArray()
      )} ${JSON.stringify(first)}`
    )
  }
  let lastId = 'undefined'
  if (last) {
    lastId = last.id.toString()
  } else {
    throw new Error(
      `last message is null/undefined ${JSON.stringify(messages.toArray())}`
    )
  }
  return `page-${firstId}-${lastId}`
}

export const useChatStore = () => useStore(chatStore)[0]
export const useChatStore2 = () => {
  const [selectedChat, _chatStoreDispatch] = useStore(chatStore)
  return { selectedChat }
}

export default chatStore
window.__chatStore = chatStore

export type ChatStoreDispatch = Store<ChatStoreState>['dispatch']

export type ChatStoreStateWithChatSet = {
  chat: NonNullable<ChatStoreState['chat']>
} & Exclude<ChatStoreState, 'chat'>
