import { ipcBackend, saveLastChatId } from '../ipc'
import { Store, useStore } from './store'
import { FullChat, MessageType } from '../../shared/shared-types'
import { DeltaBackend, sendMessageParams } from '../delta-remote'
import { runtime } from '../runtime'
import { ActionEmitter, KeybindAction } from '../keybindings'
import { C } from 'deltachat-node/dist/constants'
import { OrderedMap } from 'immutable'

export const PAGE_SIZE = 11

export interface MessagePage {
  pageKey: string
  messages: OrderedMap<number, MessageType | null>
}

type ScrollTo = ScrollToMessage | ScrollToPosition | ScrollToLastKnownPosition | null

interface ScrollToMessage {
  type: 'scrollToMessage'
  msgId: number
  highlight: boolean
}

interface ScrollToLastKnownPosition {
  type: 'scrollToLastKnownPosition'
  lastKnownScrollHeight: number
  lastKnownScrollTop: number
  appendedOn: 'top' | 'bottom'
}

interface ScrollToPosition {
  type: 'scrollToPosition'
  scrollTop: number
}

export interface ChatStoreState {
  chat: FullChat | null
  messageIds: number[]
  messagePages: MessagePage[]
  newestFetchedMessageIndex: number
  oldestFetchedMessageIndex: number
  scrollTo: ScrollTo
  scrollToBottom: boolean // if true the UI will scroll to bottom
  scrollToBottomIfClose: boolean
  lastKnownScrollHeight: number
  countFetchedMessages: number
}

const defaultState: ChatStoreState = {
  chat: null,
  messageIds: [],
  messagePages: [],
  newestFetchedMessageIndex: -1,
  oldestFetchedMessageIndex: -1,
  scrollTo: null,
  scrollToBottom: false,
  scrollToBottomIfClose: false,
  lastKnownScrollHeight: -1,
  countFetchedMessages: 0,
}

function getLastKnownScrollPosition(): {
  lastKnownScrollHeight: number
  lastKnownScrollTop: number
} {
  //@ts-ignore
  const { scrollHeight, scrollTop } = document.querySelector('#message-list')
  return {
    lastKnownScrollHeight: scrollHeight,
    lastKnownScrollTop: scrollTop,
  }
}

async function messagePagesFromMessageIds(messageIds: number[]) {
  const _messages = await DeltaBackend.call(
    'messageList.getMessages',
    messageIds
  )

  let messagePages = []

  let currentIndex = 0
  while (currentIndex < messageIds.length) {
    const messages = OrderedMap().withMutations(messagePages => {
      for (let i = currentIndex; i < currentIndex + PAGE_SIZE; i++) {
        if (i >= _messages.length) break
        let [messageId, message] = _messages[i]
        messagePages.set(messageId, message)
      }
    }) as OrderedMap<number, MessageType | null>
    currentIndex = currentIndex + PAGE_SIZE

    const messagePage = {
      pageKey: calculatePageKey(messages),
      messages,
    }

    messagePages.push(messagePage)
  }

  return messagePages
}

interface ChatStoreLocks {
  scroll: boolean
  queue: boolean
}

class ChatStore extends Store<ChatStoreState> {
  __locks: ChatStoreLocks = {
    scroll: false,
    queue: false
    
  }
  effectQueue: Function[] = []

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
    if (isDuplicatePageKey) {
      log.error('Duplicate page key')
    }
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
    refresh: (messageIds: number[], messagePages: MessagePage[], newestFetchedMessageIndex: number, oldestFetchedMessageIndex: number) => {
      this.setState(state => {
        const {
          lastKnownScrollTop,
        } = getLastKnownScrollPosition()

        const scrollTo: ScrollToPosition = {
          type: 'scrollToPosition',
          scrollTop: lastKnownScrollTop
        }

        return {
          ...state,
          messageIds,
          messagePages,
          scrollTo,
          countFetchedMessages: messageIds.length,
          newestFetchedMessageIndex,
          oldestFetchedMessageIndex
        }
      }, 'refresh')
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
    appendMessagePageTop: (payload: {
      id: number
      messagePage: MessagePage
      countFetchedMessages: number
      oldestFetchedMessageIndex: number
    }) => {
      this.setState(state => {
        const {
          lastKnownScrollHeight,
          lastKnownScrollTop,
        } = getLastKnownScrollPosition()

        const scrollTo: ScrollToLastKnownPosition = {
          type: 'scrollToLastKnownPosition',
          lastKnownScrollHeight,
          lastKnownScrollTop,
          appendedOn: 'top',
        }

        const modifiedState = {
          ...state,
          messagePages: [payload.messagePage, ...state.messagePages],
          oldestFetchedMessageIndex: payload.oldestFetchedMessageIndex,
          scrollTo,
          countFetchedMessages: payload.countFetchedMessages,
        }
        if (this.guardReducerIfChatIdIsDifferent(payload)) return
        if (
          this.guardReducerTriesToAddDuplicatePageKey(
            payload.messagePage.pageKey
          )
        )
          return
        return modifiedState
      }, 'appendMessagePageTop')
    },
    appendMessagePageBottom: (payload: {
      id: number
      messagePage: MessagePage
      countFetchedMessages: number
      newestFetchedMessageIndex: number
    }) => {
      this.setState(state => {
        const {
          lastKnownScrollHeight,
          lastKnownScrollTop,
        } = getLastKnownScrollPosition()

        const scrollTo: ScrollToLastKnownPosition = {
          type: 'scrollToLastKnownPosition',
          lastKnownScrollTop,
          lastKnownScrollHeight,
          appendedOn: 'bottom',
        }

        const modifiedState: ChatStoreState = {
          ...state,
          messagePages: [...state.messagePages, payload.messagePage],
          newestFetchedMessageIndex: payload.newestFetchedMessageIndex,
          scrollTo,
          countFetchedMessages: payload.countFetchedMessages,
        }
        if (this.guardReducerIfChatIdIsDifferent(payload)) return
        if (
          this.guardReducerTriesToAddDuplicatePageKey(
            payload.messagePage.pageKey
          )
        )
          return
        return modifiedState
      }, 'appendMessagePageBottom')
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
    unlockScroll: (payload: { id: number }) => {
      log.debug('unlockScroll')
      this.setState(state => {
        const modifiedState: ChatStoreState = {
          ...state,
          scrollTo: null,
          lastKnownScrollHeight: -1,
        }
        if (this.guardReducerIfChatIdIsDifferent(payload)) return
        setTimeout(() => this.lockUnlock('scroll'), 0)
        return modifiedState
      }, 'unlockScroll')
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
        let { oldestFetchedMessageIndex, newestFetchedMessageIndex } = state
        if (messageIndex === oldestFetchedMessageIndex) {
          oldestFetchedMessageIndex += 1
        } else if (messageIndex === newestFetchedMessageIndex) {
          newestFetchedMessageIndex -= 1
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
          newestFetchedMessageIndex,
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

  lockedEffect<T extends Function>(
    lockName: keyof ChatStoreLocks,
    effect: T,
    effectName: string
  ): T {
    const fn: T = (async (...args: any) => {
      if (this.lockIsLocked(lockName) === true) {
        log.debug(`lockedEffect: ${effectName}: We're locked, returning`)
        return false
      }

      log.debug(`lockedEffect: ${effectName}: locking`)
      this.lockLock(lockName)
      const returnValue = await effect(...args)
      if (returnValue === false) {
        log.debug(
          `lockedEffect: ${effectName}: return value was false, unlocking`
        )
        this.lockUnlock(lockName)
      }
      return returnValue
    }) as unknown as T 
    return fn
  }

  queuedEffect<T extends Function>(
    effect: T,
    effectName: string
  ): T {
    const fn: T = (async (...args: any) => {
      const lockQueue = () => {
        log.debug(`queuedEffect: ${effectName}: locking`)
        this.lockLock('queue')
      }
      const unlockQueue = () => {
        this.lockUnlock('queue')
        log.debug(`queuedEffect: ${effectName}: unlocked`)
      }

      if (this.lockIsLocked('queue') === true) {
        log.debug(`queuedEffect: ${effectName}: We're locked, adding effect to queue`)
        this.effectQueue.push(effect.bind(this, args))
        return false
      }

      lockQueue()
      const returnValue = await effect(...args)
      if (this.effectQueue.length !== 0) {
        setTimeout(async () => {
          log.debug('effectQueue: running queued effects')
          while (true) {
            if (this.effectQueue.length === 0) break
            const effect = this.effectQueue.pop()
            if (!effect) {
              throw new Error('Undefined effect in effect queue? This should not happen')
            }
            await effect()
          }
          log.debug('effectQueue: finished')
          unlockQueue()
        }, 0)
      } else {
        unlockQueue()
      }

      return returnValue
    }) as unknown as T 
    return fn
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
      let newestFetchedMessageIndex = -1
      let messagePages: MessagePage[] = []
      if (messageIds.length !== 0) {
        // mesageIds.length = 1767
        // oldestFetchedMessageIndex = 1767 - 1 = 1766 - 10 = 1756
        // newestFetchedMessageIndex =                        1766
        oldestFetchedMessageIndex = Math.max(
          messageIds.length - 1 - PAGE_SIZE,
          0
        )
        newestFetchedMessageIndex = messageIds.length - 1

        const messageIdsToFetch = messageIds.slice(
          oldestFetchedMessageIndex,
          newestFetchedMessageIndex + 1
        )
        messagePages = await messagePagesFromMessageIds(messageIdsToFetch)
      }

      chatStore.reducer.selectedChat({
        chat,
        messagePages,
        messageIds,
        oldestFetchedMessageIndex,
        newestFetchedMessageIndex,
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
    jumpToMessage: async (msgId: number, highlight?: boolean) => {
      highlight = highlight === false ? false : true
      // these methods were called in backend before
      // might be an issue if DeltaBackend.call has a significant delay
      const _message = await DeltaBackend.call('messageList.getMessages', [
        msgId,
      ])

      if (_message.length === 0) {
        throw new Error(
          'jumpToMessage: Tried to jump to non existing message with id: ' +
            msgId
        )
      }
      const message = _message[0][1] as MessageType

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
      const half_page_size = Math.ceil(PAGE_SIZE / 2)
      if (messageIds.length !== 0) {
        oldestFetchedMessageIndex = Math.max(
          jumpToMessageIndex - half_page_size,
          0
        )
        newestFetchedMessageIndex = Math.min(
          jumpToMessageIndex + half_page_size,
          messageIds.length - 1
        )

        const countMessagesOnNewerSide =
          newestFetchedMessageIndex - jumpToMessageIndex
        const countMessagesOnOlderSide =
          jumpToMessageIndex - oldestFetchedMessageIndex
        if (countMessagesOnNewerSide < half_page_size) {
          oldestFetchedMessageIndex = Math.max(
            oldestFetchedMessageIndex -
              (half_page_size - countMessagesOnNewerSide),
            0
          )
        } else if (countMessagesOnOlderSide < half_page_size) {
          newestFetchedMessageIndex = Math.min(
            newestFetchedMessageIndex +
              (half_page_size - countMessagesOnOlderSide),
            messageIds.length - 1
          )
        }

        const messageIdsToFetch = messageIds.slice(
          oldestFetchedMessageIndex,
          newestFetchedMessageIndex + 1
        )

        messagePages = await messagePagesFromMessageIds(messageIdsToFetch)
      }

      chatStore.reducer.selectedChat({
        chat,
        messagePages,
        messageIds,
        oldestFetchedMessageIndex,
        newestFetchedMessageIndex,
        scrollTo: {
          type: 'scrollToMessage',
          msgId,
          highlight,
        },
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
    fetchMoreMessagesTop: this.queuedEffect(this.lockedEffect(
      'scroll',
      async () => {
        log.debug(`fetchMoreMessagesTop`)
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
            'fetchMoreMessagesTop: fetchedMessageIds.length is zero, returning'
          )
          return false
        }

        const messagePages: MessagePage[] = await messagePagesFromMessageIds(
          fetchedMessageIds
        )

        if (messagePages.length === 0) {
          throw new Error('messagePages.length is zero, this should not happen')
        }
        const messagePage = messagePages[0]

        chatStore.reducer.appendMessagePageTop({
          id,
          messagePage,
          oldestFetchedMessageIndex,
          countFetchedMessages: fetchedMessageIds.length,
        })
        return true
      },
      'fetchMoreMessagesTop'
    ), 'fetchMoreMessagesTop'),
    fetchMoreMessagesBottom: this.queuedEffect(this.lockedEffect(
      'scroll',
      async () => {
        log.debug(`fetchMoreMessagesBottom`)
        const state = this.state
        if (state.chat === null) {
          return false
        }
        const id = state.chat.id

        const newestFetchedMessageIndex = state.newestFetchedMessageIndex
        const newNewestFetchedMessageIndex = Math.min(
          newestFetchedMessageIndex + PAGE_SIZE,
          state.messageIds.length - 1
        )
        if (newestFetchedMessageIndex === state.messageIds.length - 1) {
          log.debug('fetchMoreMessagesBottom: no more messages, returning')
          return false
        }

        const fetchedMessageIds = state.messageIds.slice(
          newestFetchedMessageIndex,
          newNewestFetchedMessageIndex + 1
        )
        if (fetchedMessageIds.length === 0) {
          log.debug(
            'fetchMoreMessagesBottom: fetchedMessageIds.length is zero, returning',
            JSON.stringify({
              newestFetchedMessageIndex,
              newNewestFetchedMessageIndex,
              messageIds: state.messageIds,
            })
          )
          return false
        }

        const messagePages: MessagePage[] = await messagePagesFromMessageIds(
          fetchedMessageIds
        )

        if (messagePages.length === 0) {
          throw new Error('MessagePage length is zero, this should not happen')
        }
        const messagePage = messagePages[0]

        chatStore.reducer.appendMessagePageBottom({
          id,
          messagePage,
          newestFetchedMessageIndex: newNewestFetchedMessageIndex,
          countFetchedMessages: fetchedMessageIds.length,
        })
        return true
      },
      'fetchMoreMessagesBottom'
    ), 'fetchMoreMessagesBottom'),
    refresh: this.queuedEffect(this.lockedEffect('scroll', async (payload: { chatId: number }) => {
      log.debug(`refresh`)
      const state = this.state
      if (state.chat === null || state.chat.id !== payload.chatId) {
        return false
      }
      const chatId = payload.chatId
      const messageIds = <number[]>(
        await DeltaBackend.call('messageList.getMessageIds', chatId)
      )
      let { newestFetchedMessageIndex, oldestFetchedMessageIndex } = state
      newestFetchedMessageIndex = Math.min(newestFetchedMessageIndex, messageIds.length - 1)
      oldestFetchedMessageIndex = Math.max(oldestFetchedMessageIndex, 0)

      const messagePages = await messagePagesFromMessageIds(messageIds.slice(oldestFetchedMessageIndex, newestFetchedMessageIndex + 1))

      this.reducer.refresh(messageIds, messagePages, newestFetchedMessageIndex, oldestFetchedMessageIndex)
      return true

    }, 'refresh'), 'refresh'),
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
    sendMessage: this.queuedEffect(async (payload: {
      chatId: number
      message: sendMessageParams
    }) => {
      log.debug('sendMessage')
      if (payload.chatId !== chatStore.state.chat?.id) return
      const [messageId, message] = await DeltaBackend.call(
        'messageList.sendMessage',
        payload.chatId,
        payload.message
      )

      // Workaround for failed messages
      if (messageId === 0) return
      if (message === null) return
      chatStore.effect.jumpToMessage(messageId, false)
    }, 'sendMessage'),
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
  const messagesIncoming = _messagesIncoming.map(
    ([_messageId, message]) => message
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
    chatStore.effect.refresh({chatId})
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

    if (messagesChanged.length === 0) return
    const message = messagesChanged[0][1]
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

    chatStore.effect.refresh({chatId})
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

